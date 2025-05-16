const analyticsDb = require('../db/analytics');

/**
 * Calculate revenue, cost, and profit/loss in a date range
 * @route GET /api/analytics/financial
 * @access Private - Sales Managers only
 */
exports.getFinancialMetrics = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can access financial metrics
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can access financial metrics' });
        }
        
        const { startDate, endDate } = req.query;
        
        // Validate input
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
        }
        
        // Validate that start date is not after end date
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }
        
        const financialMetrics = await analyticsDb.calculateFinancialMetrics(startDate, endDate);
        
        res.status(200).json({ 
            message: 'Financial metrics calculated successfully', 
            dateRange: { startDate, endDate },
            ...financialMetrics
        });
    } catch (err) {
        console.error('Error calculating financial metrics:', err);
        res.status(500).json({ error: 'Failed to calculate financial metrics', details: err.message });
    }
};

/**
 * Generate chart data for revenue/profit visualization
 * @route GET /api/analytics/chart-data
 * @access Private - Sales Managers only
 */
exports.getChartData = async (req, res) => {
    try {
        // Check authentication and authorization
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Only Sales Managers (role_id = 3) can access chart data
        if (req.session.user.role_id !== 3) {
            return res.status(403).json({ error: 'Forbidden: Only Sales Managers can access chart data' });
        }
        
        const { startDate, endDate, interval } = req.query;
        
        // Validate input
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
        }
        
        // Validate that start date is not after end date
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }
        
        // Validate interval if provided
        const validIntervals = ['day', 'week', 'month'];
        if (interval && !validIntervals.includes(interval.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Invalid interval', 
                validIntervals: validIntervals.join(', ')
            });
        }
        
        const chartData = await analyticsDb.generateChartData(
            startDate, 
            endDate, 
            interval || 'day'
        );
        
        res.status(200).json({ 
            message: 'Chart data generated successfully', 
            dateRange: { startDate, endDate },
            interval: interval || 'day',
            ...chartData
        });
    } catch (err) {
        console.error('Error generating chart data:', err);
        res.status(500).json({ error: 'Failed to generate chart data', details: err.message });
    }
}; 