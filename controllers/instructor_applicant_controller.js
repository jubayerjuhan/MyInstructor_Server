import catchAsyncError from "../middlewares/catchAsyncError.js";
import { InstructorApplicantModel } from "../models/instructor_applicant_model.js";

export const applyInstructor = catchAsyncError(async (req, res, next) => {
  const applicant = await InstructorApplicantModel.create(req.body);
  if (!applicant)
    next(new Errorhandler(500, `Sorry Request Can't Be Processed This Time`));

  res.status(200).json({
    success: true,
    applicant,
  });
});
