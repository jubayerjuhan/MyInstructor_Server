import catchAsyncError from "../middlewares/catchAsyncError.js";
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
