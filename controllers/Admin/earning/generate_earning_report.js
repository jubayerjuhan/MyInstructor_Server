import moment from "moment";
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
import { generateInvoice } from "../../../invoice/generate_invoice/generateInvoice.js";

/**
this function generates a fortnightly pdf payment report with ejs
@param {Object<Instructor>} Instructor - The Instructor Object 
@param {Array<Earning>} Earning - An array of Earning objects representing the earnings for the specified period.
@returns {Promise} A promise that resolves with the generated PDF report.
@throws {Error} - Throws an error if anything wrong happens
*/
export const generateFortnightReportPDF = async (
  instructor,
  earnings,
  breakdown
) => {
  const data = {
    customerName: `${instructor.firstName} ${instructor.lastName}`,
    customerAbn: `123469485094`,
    customerAddress: "Nawabganj Dhaka Bangladesh",
    invoiceId: 12028930389233,
    date: moment().format("DD MMMM YYYY"),
    managementFee: breakdown.managementFee,
    subtotal: breakdown.subtotal,
    gst: breakdown.gst,
    total: breakdown.total,
    inclusiveGst: breakdown.inclusiveGst,
    bookingAmount: breakdown.bookingAmount,
    items: earnings.map((earning) => ({
      ...earning.toObject({ getters: true }),
      date: moment(earning?.createdAt).format("DD MMMM YYYY"),
      description: `#${earning?.bookingId} - ${earning.bookingType} - ${
        earning.learner?.firstName + earning.learner?.lastName
      }`,
    })),
  };

  const ejsPath = path.join(
    __dirname,
    "../../../invoice/ejs/fortnightly_report.ejs"
  );
  const invoice = await generateInvoice(data, ejsPath);
  console.log(invoice);

  // console.log(instructor, earnings);
  //   generateInvoice();
};
