import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import styles from "./InvoicePage.module.css";
import jsPDF from "jspdf";

const InvoicePage = () => {
  const location = useLocation();
  const { order, invoiceId, invoicePdfUrl } = location.state || {};
  
  // State variables
  const [invoiceNumber, setInvoiceNumber] = useState(order?.invoiceNumber || '');
  const [user, setUser] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState(invoicePdfUrl || null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Fetch user and check for existing PDF
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user profile
        const userRes = await axios.get("http://localhost:5000/api/auth/profile", {
          withCredentials: true,
        });
        
        console.log("✅ Kullanıcı bilgisi alındı:", userRes.data.user);
        setUser(userRes.data.user);
        
        // If we already have the PDF URL from the state, use it
        if (invoicePdfUrl) {
          console.log("📄 Using PDF URL from state:", invoicePdfUrl);
          setExistingPdfUrl(`http://localhost:5000${invoicePdfUrl}`);
          setIsLoading(false);
          return;
        }
        
        // Otherwise, check if invoice PDF exists on backend
        if (order) {
          const orderId = order.order_id || (order.invoiceNumber && order.invoiceNumber.split('-')[1]);
          if (orderId) {
            const invoiceRes = await axios.get(`http://localhost:5000/api/invoices/by-order/${orderId}`, {
              withCredentials: true,
            });
            
            if (invoiceRes.data && invoiceRes.data.invoice_pdf_url) {
              console.log("📄 Mevcut fatura PDF'i bulundu:", invoiceRes.data.invoice_pdf_url);
              setExistingPdfUrl(`http://localhost:5000${invoiceRes.data.invoice_pdf_url}`);
              
              // Always use invoice number from the backend
              if (invoiceRes.data.invoice_description) {
                setInvoiceNumber(invoiceRes.data.invoice_description);
              }
            } else {
              console.log("❌ Bu sipariş için kayıtlı fatura bulunamadı");
            }
          }
        }
      } catch (err) {
        console.error("❌ Veri alınamadı:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [invoiceId, order, invoicePdfUrl]);

  const calculateTotal = () =>
    order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Send PDF via email
  const sendEmailPDF = async () => {
    try {
      if (!user || !user.email) {
        alert("User email is not available.");
        return;
      }
      
      // Always ensure we're using an existing PDF from the backend
      if (!existingPdfUrl) {
        alert("No invoice PDF found. Please contact support.");
        return;
      }
      
      // Send email with the PDF from backend
      const response = await axios.post(
        "http://localhost:5000/api/sendInvoiceEmail",
        {
          to: user.email,
          invoiceNumber: invoiceNumber
        },
        { withCredentials: true }
      );
      
      console.log("✅ Email sent successfully:", response.data);
      alert("Invoice sent to your email successfully!");
    } catch (error) {
      console.error("❌ Error sending email:", error);
      alert("Failed to send the invoice email.");
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    try {
      // Only allow downloading if we have a PDF URL from backend
      if (existingPdfUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = existingPdfUrl;
        link.download = `invoice-${invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("PDF downloaded from server:", existingPdfUrl);
      } else {
        alert("No invoice PDF available for download.");
      }
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    }
  };

  // Toggle PDF viewer
  const togglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  // Check for invoice data
  if (isLoading) {
    return <div className={styles.invoiceContainer}><p>Loading invoice data...</p></div>;
  }
  
  if (!invoiceNumber && !isLoading) {
    return (
      <div className={styles.invoiceContainer}>
        <div className={styles.messageWrapper}>
          <p>Invoice data not found. Please contact customer support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invoiceContainer}>
      <div className={styles.leftWrapper}></div>
      <div className={styles.rightPanel}>
        <div className={styles.invoiceWrapper}>
          <h2 className={styles.invoiceTitle}>Invoice</h2>
          <p className={styles.invoiceInfo}><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p className={styles.invoiceInfo}><strong>Date:</strong> {order.date}</p>
          <p className={styles.invoiceInfo}><strong>Customer:</strong> {user?.username || "Loading..."}</p>
          <p className={styles.invoiceInfo}><strong>Email:</strong> {user?.email || "Loading..."}</p>

          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price}</td>
                  <td>${item.quantity * item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className={styles.totalAmount}>Total: ${calculateTotal()}</p>
          <div className={styles.buttonContainer}>
            <button className={styles.downloadButton} onClick={downloadPDF}>
              Download PDF
            </button>
            <button className={styles.emailButton} onClick={sendEmailPDF}>
              Send to Email
            </button>
          </div>
          
          {existingPdfUrl && (
            <div className={styles.pdfContainer}>
              <button 
                className={styles.viewPdfButton} 
                onClick={togglePdfViewer}
              >
                {showPdfViewer ? "Hide PDF" : "View PDF"}
              </button>
              
              {showPdfViewer && (
                <div className={styles.pdfViewer}>
                  <iframe 
                    src={existingPdfUrl} 
                    width="100%" 
                    height="500px"
                    title="Invoice PDF" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;