import catchAsyncError from "../../../middlewares/catchAsyncError.js";
import Errorhandler from "../../../middlewares/handle_error.js";
import { Instructor } from "../../../models/instructor_model.js";
import { getInstructorPendingPaymentsById } from "./instructor_payments.js";

export const fortnightPaymentInstructorList = catchAsyncError(
  async (req, res, next) => {
    const instructors = await Instructor.aggregate([
      {
        $lookup: {
          from: "earnings",
          localField: "_id",
          foreignField: "instructor",
          as: "earnings",
        },
      },
      {
        $unwind: "$earnings",
      },

      {
        $match: {
          "earnings.paid": false,
        },
      },
      {
        $group: {
          _id: "$_id",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          amount: { $sum: "$earnings.subtotal" },
        },
      },

      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          amount: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      instructors,
    });
  }
);

// * pay selected instructors
export const paySelectedInstructors = catchAsyncError(
  async (req, res, next) => {
    // get instructors array from the request
    const { instructors } = req.body;

    // setting up a error if we don't get instructor array
    if (!instructors)
      return next(new Errorhandler(404, "No Instructors Found To Pay"));

    // loop through all instructors and get their earnings info
    instructors?.forEach(async (instructorId) => {
      try {
        const payments = await getInstructorPendingPaymentsById(instructorId);
        console.log(payments, "payments");
      } catch (error) {
        console.log(error);
      }
    });
    //sending the response
    res.status(200).json({
      success: true,
    });
  }
);
