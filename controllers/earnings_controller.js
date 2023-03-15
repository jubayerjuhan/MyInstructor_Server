import { Suburbs } from "../models/subrubs_model.js";

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
};
