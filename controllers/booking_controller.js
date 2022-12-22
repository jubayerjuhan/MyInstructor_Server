import moment from "moment/moment.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/handle_error.js";
import { Booking } from "../models/booking_model.js";
import { Instructor } from "../models/instructor_model.js";
import { userModel } from "../models/user_model.js";
import { sendEmail } from "./email_controller.js";

export const makeBooking = catchAsyncError(async (req, res, next) => {
  if (!req.body.duration)
    return next(new Errorhandler(404, "Invalid Booking Information Provided"));
  const user = await userModel.findById(req.user._id);

  // if the user has less credit
  if (user.credit < req.body.duration)
    return next(
      new Errorhandler(
        403,
        "You Don't Have Enough Credit's To Make This Booking"
      )
    );

  // console.log(req.body, "req. body");
  const booking = await Booking.create({ ...req.body, user: req.user });

  user.credit = user.credit - req.body.duration;
  await user.save();

  const instructor = await Instructor.findById(req.body.instructor);

  const userSms = ` ${instructor.firstName}. Booking Time, From ${moment(
    req.body.time.from
  ).format("MMM DD YYYY h:mm a")} to ${moment(req.body.time.to).format(
    "MMM DD YYYY h:mm a"
  )}`;

  const instructorSms = ` ${user.firstName}. Booking Time, From ${moment(
    req.body.time.from
  ).format("MMM DD YYYY h:mm a")} to ${moment(req.body.time.to).format(
    "MMM DD YYYY h:mm a"
  )}`;
  sendEmail(4, user.email, user.firstName, userSms);
  sendEmail(5, instructor.email, instructor.firstName, instructorSms);

  res.status(200).json({
    success: true,
    booking,
  });
});

// find booking
export const findBooking = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new Errorhandler(404, "No Booking Id Provided"));

  const booking = await Booking.findById(id).populate("user instructor");

  if (!booking)
    return next(new Errorhandler(404, "No Booking Found With this id"));

  res.status(200).json({
    success: true,
    booking,
  });
});

// change booking status
export const changeBookingStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) return next(new Errorhandler(404, "Invalid Request"));

  const booking = await Booking.findById(id).populate("user");
  const oldStatus = booking.status;

  if (booking.status === "Ended")
    return next(new Errorhandler(403, "Booking Already Ended"));
  booking.status = status;
  booking.save();

  // console.log(status, "booking status");
  if (booking.status === "Ended") {
    const instructor = await Instructor.findById(booking.instructor);
    instructor.credit = instructor.credit + booking.duration;
    instructor.save();
  }

  const sms = `Your Booking Status Was ${oldStatus}, Now It's Changed to ${
    booking.status
  }. Current Booking Status: ${JSON.stringify(booking.status).toUpperCase()}`;
  sendEmail(6, booking.user.email, booking.user.name, sms);

  res.status(200).json({
    success: true,
    booking,
  });
});

// get booking by instructor
export const getInstructorBookings = catchAsyncError(async (req, res, next) => {
  const { instructor } = req.query;
  if (!instructor)
    return next(new Errorhandler(404, "Can't Find Instructor Id"));

  const bookings = await Booking.find({ instructor }).populate(
    "instructor user"
  );
  // console.log(bookings.length);

  res.status(200).json({
    success: true,
    bookings: bookings.reverse(),
  });
});

// get booking by usery
export const getUserBookings = catchAsyncError(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id }).populate(
    "instructor user"
  );

  // console.log(bookings.length);

  res.status(200).json({
    success: true,
    bookings: bookings.reverse(),
  });
});

// confirm booking
