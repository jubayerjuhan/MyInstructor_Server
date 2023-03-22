import { Suburbs } from "../models/subrubs_model.js";
import EarningsModel from "../models/earnings_model.js";
import { generateInvoice } from "../invoice/generate_invoice/generateInvoice.js";
import { errorMiddleware } from "../middlewares/error_middleware.js";
import ErrorHandler from "../middlewares/handle_error.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

export const addEarningsToInstructor = async (instructor, booking, next) => {
  return new Promise(async (resolve, reject) => {
    const suburb = await Suburbs.findById(booking.pickupDetails.suburb);

    const totalLessonPrice = suburb.price * booking.duration;
    let instructorAmount = 0;
    let serviceCharge = 0;
    let gst = 0;

    //   CALCULATING THE SPLITTING PRICES OF THE BOOKING
    const totalPrice = (totalLessonPrice / 100) * 80;
    serviceCharge = totalLessonPrice - totalPrice;
    gst = instructor.hasGst ? (totalPrice / 100) * 10 : 0;
    instructorAmount = totalPrice - gst;

    console.log(
      Number(totalLessonPrice.toFixed(2)),
      Number(serviceCharge.toFixed(2)),
      Number(gst.toFixed(2)),
      Number(instructorAmount.toFixed(2))
    );

    console.log("instructor...:", instructor);
    console.log("booking...:", booking);

    // defining invoice information
    const invoiceInfo = {
      customerName: `${instructor.firstName} ${instructor.lastName}`,
      products: [
        {
          name: `#${booking._id} - ${booking.user?.firstName} (${booking.duration} hr)`,
          price: Number(totalLessonPrice.toFixed(2)),
        },
      ],
      subtotal: Number(totalLessonPrice.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      serviceFee: Number(serviceCharge.toFixed(2)),
      total: Number(instructorAmount.toFixed(2)),
    };

    const invoice = await generateInvoice(invoiceInfo);

    EarningsModel.create({
      learner: booking.user._id,
      instructor: instructor._id,
      duration: booking.duration,
      bookingAmount: Number(totalLessonPrice.toFixed(2)),
      instructorAmount: Number(instructorAmount.toFixed(2)),
      serviceCharge: Number(serviceCharge.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      invoice: invoice,
    })
      .then((res) => {
        return resolve(invoice);
      })
      .catch((err) => reject(err));
  });
};
