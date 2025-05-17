import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./InvoicePage.module.css";

const InvoicePage = () => {
  const location = useLocation();
  const { order, invoiceId } = location.state;

  const [user, setUser] = useState(null);

  // Giriş yapan kullanıcıyı çek
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", 
            {
            withCredentials: true,
          });
          
        console.log("✅ Kullanıcı bilgisi alındı:", res.data.user); // 👈 burayı ekle
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Kullanıcı bilgisi alınamadı:", err); // 👈 burayı ekle
      }
    };
    fetchUser();
  }, []);
  

  const calculateTotal = () =>
    order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const generatePDF = () => {
    if (!user) {
        alert("Kullanıcı bilgisi henüz yüklenmedi.");
        return;
    }

    const doc = new jsPDF();
    doc.text("Invoice", 14, 20);
    doc.text(`Invoice #: ${order.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${order.date}`, 14, 37);
    doc.text(`Customer: ${user.username}`, 14, 44);
    doc.text(`Email: ${user.email}`, 14, 51);

    const rows = order.items.map((item) => [
        item.description,
        item.quantity,
        `$${item.price}`,
        `$${item.quantity * item.price}`,
    ]);

    autoTable(doc, {
        startY: 58,
        head: [["Item", "Qty", "Price", "Total"]],
        body: rows,
    });

    doc.text(`Grand Total: $${calculateTotal()}`, 14, doc.lastAutoTable.finalY + 10);

    // Convert the PDF to a Blob and then to a Base64 string
    const pdfBlob = doc.output("blob");
    console.log("📄 PDF Blob created:", pdfBlob); // Debugging log

    const reader = new FileReader();
    console.log("📄 Starting to read PDF Blob as Base64..."); // Debugging log
    reader.readAsDataURL(pdfBlob);

    reader.onloadend = function () {
        console.log("📄 FileReader onloadend triggered."); // Debugging log
        const base64data = reader.result;
        console.log("📄 PDF Base64 Data:", base64data.substring(0, 50) + "..."); // Debugging log
        axios
            .post(
                "http://localhost:5000/api/sendInvoiceEmail",
                {
                    to: user.email,
                    invoiceNumber: order.invoiceNumber,
                    pdfData: base64data, // Ensure this is the full Base64 string
                },
                { withCredentials: true }
            )
            .then((response) => {
                console.log("✅ Email sent successfully:", response.data); // Debugging log
                alert("Invoice sent to your email successfully!");
            })
            .catch((error) => {
                console.error("❌ Error sending email:", error.response?.data || error.message); // Debugging log
                alert("Failed to send the invoice email.");
            });

        // Save PDF to backend
        axios.post(
            "http://localhost:5000/api/invoices/save-invoice-pdf",
            {
                invoiceId: invoiceId, // Use invoiceId to update the correct invoice row
                pdfData: base64data
            },
            { withCredentials: true }
        )
        .then((response) => {
            console.log("✅ Invoice PDF saved to backend:", response.data);
        })
        .catch((error) => {
            console.error("❌ Error saving invoice PDF:", error.response?.data || error.message);
        });
    };

    reader.onerror = function (error) {
        console.error("❌ FileReader error:", error); // Debugging log
    };
};

  return (
    <div className={styles.invoiceContainer}>
      <div className={styles.leftWrapper}></div>
      <div className={styles.rightPanel}>
        <div className={styles.invoiceWrapper}>
          <h2 className={styles.invoiceTitle}>Invoice</h2>
          <p className={styles.invoiceInfo}><strong>Invoice #:</strong> {order.invoiceNumber}</p>
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
          <button className={styles.downloadButton} onClick={generatePDF}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;