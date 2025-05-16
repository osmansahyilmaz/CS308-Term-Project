const pool = require('./pool');

/**
 * Calculate revenue, cost, and profit within a date range
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} - Financial metrics
 */
const calculateFinancialMetrics = async (startDate, endDate) => {
    // Convert dates to timestamps with time components for inclusive range
    const startDateTimestamp = `${startDate} 00:00:00`;
    const endDateTimestamp = `${endDate} 23:59:59`;

    const query = `
        SELECT
            SUM(o.order_total_price) as total_revenue,
            SUM(po.product_order_count * p.cost) as total_cost,
            COUNT(DISTINCT o.order_id) as order_count,
            COUNT(po.product_of_order_id) as products_sold
        FROM orders o
        JOIN products_of_order po ON o.order_id = po.order_id
        JOIN products p ON po.product_id = p.product_id
        WHERE o.order_date BETWEEN $1 AND $2
        AND o.order_status != 4  -- Exclude cancelled orders
    `;

    try {
        const result = await pool.query(query, [startDateTimestamp, endDateTimestamp]);
        
        const metrics = result.rows[0];
        
        // Calculate profit/loss
        const totalRevenue = parseFloat(metrics.total_revenue || 0);
        const totalCost = parseFloat(metrics.total_cost || 0);
        const profit = totalRevenue - totalCost;
        
        // Get product category breakdown
        const categoryQuery = `
            SELECT
                p.category,
                SUM(po.price_when_buy * po.product_order_count) as category_revenue,
                SUM(p.cost * po.product_order_count) as category_cost,
                COUNT(po.product_of_order_id) as products_sold
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.order_date BETWEEN $1 AND $2
            AND o.order_status != 4  -- Exclude cancelled orders
            GROUP BY p.category
            ORDER BY category_revenue DESC
        `;
        
        const categoryResult = await pool.query(categoryQuery, [startDateTimestamp, endDateTimestamp]);
        
        // Get top selling products
        const topProductsQuery = `
            SELECT
                p.product_id,
                p.name,
                p.model,
                SUM(po.product_order_count) as units_sold,
                SUM(po.price_when_buy * po.product_order_count) as revenue,
                SUM(p.cost * po.product_order_count) as cost
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.order_date BETWEEN $1 AND $2
            AND o.order_status != 4  -- Exclude cancelled orders
            GROUP BY p.product_id, p.name, p.model
            ORDER BY units_sold DESC
            LIMIT 5
        `;
        
        const topProductsResult = await pool.query(topProductsQuery, [startDateTimestamp, endDateTimestamp]);
        
        // Get daily sales data for charting
        const dailySalesQuery = `
            SELECT
                DATE_TRUNC('day', o.order_date) as date,
                SUM(o.order_total_price) as daily_revenue,
                SUM(po.product_order_count * p.cost) as daily_cost,
                COUNT(DISTINCT o.order_id) as order_count
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.order_date BETWEEN $1 AND $2
            AND o.order_status != 4  -- Exclude cancelled orders
            GROUP BY DATE_TRUNC('day', o.order_date)
            ORDER BY date
        `;
        
        const dailySalesResult = await pool.query(dailySalesQuery, [startDateTimestamp, endDateTimestamp]);
        
        return {
            summary: {
                totalRevenue,
                totalCost,
                profit,
                profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
                orderCount: parseInt(metrics.order_count || 0),
                productsSold: parseInt(metrics.products_sold || 0),
                averageOrderValue: metrics.order_count > 0 ? totalRevenue / parseInt(metrics.order_count) : 0
            },
            categoryBreakdown: categoryResult.rows.map(category => ({
                category: category.category || 'uncategorized',
                revenue: parseFloat(category.category_revenue || 0),
                cost: parseFloat(category.category_cost || 0),
                profit: parseFloat(category.category_revenue || 0) - parseFloat(category.category_cost || 0),
                productsSold: parseInt(category.products_sold || 0)
            })),
            topProducts: topProductsResult.rows.map(product => ({
                productId: product.product_id,
                name: product.name,
                model: product.model,
                unitsSold: parseInt(product.units_sold || 0),
                revenue: parseFloat(product.revenue || 0),
                cost: parseFloat(product.cost || 0),
                profit: parseFloat(product.revenue || 0) - parseFloat(product.cost || 0)
            })),
            dailySales: dailySalesResult.rows.map(day => ({
                date: day.date,
                revenue: parseFloat(day.daily_revenue || 0),
                cost: parseFloat(day.daily_cost || 0),
                profit: parseFloat(day.daily_revenue || 0) - parseFloat(day.daily_cost || 0),
                orderCount: parseInt(day.order_count || 0)
            }))
        };
    } catch (err) {
        throw new Error('Error calculating financial metrics: ' + err.message);
    }
};

/**
 * Generate chart data for revenue/profit visualization
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @param {string} interval - Time interval for grouping (day, week, month)
 * @returns {Promise<Object>} - Chart data for visualization
 */
const generateChartData = async (startDate, endDate, interval = 'day') => {
    // Convert dates to timestamps with time components for inclusive range
    const startDateTimestamp = `${startDate} 00:00:00`;
    const endDateTimestamp = `${endDate} 23:59:59`;
    
    // Determine the appropriate SQL function for the interval
    let timeFunction;
    switch (interval.toLowerCase()) {
        case 'week':
            timeFunction = "DATE_TRUNC('week', o.order_date)";
            break;
        case 'month':
            timeFunction = "DATE_TRUNC('month', o.order_date)";
            break;
        default: // day
            timeFunction = "DATE_TRUNC('day', o.order_date)";
    }
    
    // Query for time-series data with the specified interval
    const query = `
        SELECT
            ${timeFunction} as time_period,
            SUM(o.order_total_price) as revenue,
            SUM(po.product_order_count * p.cost) as cost,
            COUNT(DISTINCT o.order_id) as order_count
        FROM orders o
        JOIN products_of_order po ON o.order_id = po.order_id
        JOIN products p ON po.product_id = p.product_id
        WHERE o.order_date BETWEEN $1 AND $2
        AND o.order_status != 4  -- Exclude cancelled orders
        GROUP BY time_period
        ORDER BY time_period
    `;
    
    try {
        const result = await pool.query(query, [startDateTimestamp, endDateTimestamp]);
        
        // Process the data for the chart
        const chartData = result.rows.map(row => {
            const revenue = parseFloat(row.revenue || 0);
            const cost = parseFloat(row.cost || 0);
            const profit = revenue - cost;
            
            return {
                period: row.time_period,
                revenue,
                cost,
                profit,
                orderCount: parseInt(row.order_count || 0)
            };
        });
        
        // Get category data for pie charts
        const categoryQuery = `
            SELECT
                p.category,
                SUM(po.price_when_buy * po.product_order_count) as revenue
            FROM orders o
            JOIN products_of_order po ON o.order_id = po.order_id
            JOIN products p ON po.product_id = p.product_id
            WHERE o.order_date BETWEEN $1 AND $2
            AND o.order_status != 4
            GROUP BY p.category
            ORDER BY revenue DESC
        `;
        
        const categoryResult = await pool.query(categoryQuery, [startDateTimestamp, endDateTimestamp]);
        
        const categoryData = categoryResult.rows.map(row => ({
            category: row.category || 'uncategorized',
            revenue: parseFloat(row.revenue || 0)
        }));
        
        // Get comparison with previous period
        const periodLength = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        const previousStartDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() - periodLength));
        const previousEndDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() - 1));
        
        const previousPeriodQuery = `
            SELECT
                SUM(o.order_total_price) as revenue,
                COUNT(DISTINCT o.order_id) as order_count
            FROM orders o
            WHERE o.order_date BETWEEN $1 AND $2
            AND o.order_status != 4
        `;
        
        const previousPeriodResult = await pool.query(previousPeriodQuery, [
            previousStartDate.toISOString().split('T')[0] + ' 00:00:00',
            previousEndDate.toISOString().split('T')[0] + ' 23:59:59'
        ]);
        
        const currentPeriodTotals = {
            revenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
            profit: chartData.reduce((sum, item) => sum + item.profit, 0),
            orderCount: chartData.reduce((sum, item) => sum + item.orderCount, 0)
        };
        
        const previousPeriodTotals = {
            revenue: parseFloat(previousPeriodResult.rows[0].revenue || 0),
            orderCount: parseInt(previousPeriodResult.rows[0].order_count || 0)
        };
        
        // Calculate growth percentages
        const growth = {
            revenue: previousPeriodTotals.revenue > 0 
                ? ((currentPeriodTotals.revenue - previousPeriodTotals.revenue) / previousPeriodTotals.revenue) * 100 
                : null,
            orderCount: previousPeriodTotals.orderCount > 0 
                ? ((currentPeriodTotals.orderCount - previousPeriodTotals.orderCount) / previousPeriodTotals.orderCount) * 100 
                : null
        };
        
        return {
            timeSeriesData: chartData,
            categoryData,
            totals: currentPeriodTotals,
            previousPeriodTotals,
            growth,
            metadata: {
                interval,
                startDate,
                endDate,
                dataPoints: chartData.length
            }
        };
    } catch (err) {
        throw new Error('Error generating chart data: ' + err.message);
    }
};

module.exports = {
    calculateFinancialMetrics,
    generateChartData
}; 