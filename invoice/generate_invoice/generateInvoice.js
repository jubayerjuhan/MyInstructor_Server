import ejs from "ejs";
import path from "path";
import pdfMaker from "html-pdf-node";
import { gcloudStorage } from "../../index.js";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const data = {
//   customerName: "John Doe",
//   products: [{ name: "#5273828 Juhan - Driving Lesson (1 hr)", price: 100 }],
//   subtotal: 100,
//   gst: 8,
//   serviceFee: 20,
//   total: 72,
// };

export const generateInvoice = (data) => {
  return new Promise((resolve, reject) => {
    const invoicePath = path.join(__dirname, "../ejs/invoice.ejs");
    ejs.renderFile(invoicePath, data, (err, html) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        const options = { format: "A4" };
        let file = { content: html };
        // or //
        pdfMaker.generatePdf(file, options).then(async (pdfBuffer) => {
          const invoice = await uploadPdfToBucket(pdfBuffer);
          resolve(invoice);
        });
      }
    });
  });
};

const uploadPdfToBucket = async (buffer) => {
  const fileName = "Earning_Invoice" + Date.now() + ".pdf";
  const bucket = gcloudStorage.bucket(process.env.BUCKET_NAME);
  try {
    await bucket.file(fileName).save(buffer);

    return `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.log(error);
    return false;
  }
};
