import { Suburbs } from "../models/subrubs_model.js";
import EarningsModel from "../models/earnings_model.js";
import { generateInvoice } from "../invoice/generate_invoice/generateInvoice.js";

export const addEarningsToInstructor = async (instructor, booking) => {
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

  const earning = await EarningsModel.create({
    learner: booking.user._id,
    instructor: instructor._id,
    duration: booking.duration,
    bookingAmount: Number(totalLessonPrice.toFixed(2)),
    instructorAmount: Number(instructorAmount.toFixed(2)),
    serviceCharge: Number(serviceCharge.toFixed(2)),
    gst: Number(gst.toFixed(2)),
  });

  const invoice = await generateInvoice();
  console.log(invoice, "invoice");
};
