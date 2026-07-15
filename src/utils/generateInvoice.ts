import { Order } from '@/types/order';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/invoice`;

export const downloadInvoice = async (order: Order): Promise<void> => {
  try {
    if (order.invoiceUrl) {
      window.open(order.invoiceUrl, '_blank');
      return;
    }

    const res = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id })
    });
    
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    
    const data = await res.json();
    
    if (data.success && data.invoiceUrl) {
      window.open(data.invoiceUrl, '_blank');
    } else {
      console.error("Failed to generate invoice", data);
      alert("Failed to generate invoice");
    }
  } catch (error) {
    console.error("Invoice Generation Error:", error);
    alert("Error generating invoice");
  }
};

export const downloadAllInvoices = async (orders: Order[]): Promise<void> => {
  const JSZip = (await import('jszip')).default;
  const { saveAs } = await import('file-saver');

  const zip = new JSZip();
  let hasItems = false;

  for (const order of orders) {
    try {
      let url = order.invoiceUrl;
      if (!url) {
        const res = await fetch(`${BACKEND_URL}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id })
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.invoiceUrl) {
                url = data.invoiceUrl;
            }
        }
      }

      if (url) {
        const pdfRes = await fetch(url);
        const pdfBlob = await pdfRes.blob();
        zip.file(`Invoice_${order.id}.pdf`, pdfBlob);
        hasItems = true;
      }
    } catch (err) {
      console.error(`Failed to generate invoice for order ${order.id}:`, err);
    }
  }

  if (hasItems) {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Invoices.zip");
  } else {
    alert("Failed to generate invoices for the selected orders.");
  }
};
