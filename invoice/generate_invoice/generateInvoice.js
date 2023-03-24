import ejs from "ejs";
import path from "path";
import pdfMaker from "html-pdf-node";
import { gcloudStorage } from "../../index.js";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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
