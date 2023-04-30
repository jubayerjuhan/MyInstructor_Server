import catchAsyncError from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/handle_error.js";
import { Instructor } from "../models/instructor_model.js";

export const setInstructorAvailability = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;
    const { day, startTime, endTime } = req.body;

    const instructor = await Instructor.findOneAndUpdate(
      { _id: id, "availability.day": day },
      { $addToSet: { "availability.$.slots": { startTime, endTime } } },
      { new: true }
    );
    console.log(instructor);
    res.status(200).json({
      success: true,
      instructor,
    });
  }
);

// controller function to get instructor
export const getInstructorAvailabilities = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;

    // search for instructor with the id we got in req params
    const instructor = await Instructor.findOne({ _id: id }).select(
      "-_id availability"
    );

    // if no instructor found with the id then return error
    if (!instructor)
      return next(new Errorhandler(404, "Instructor Not Found With the Id"));

    // sending response back to server
    res.status(200).json({
      success: true,
      availability: instructor.availability,
    });
  }
);
