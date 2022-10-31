import catchAsyncError from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/handle_error.js";
import { sendJwtToken } from "../middlewares/sendJwtToken.js";
import { Instructor } from "../models/instructor_model.js";
import { Suburbs } from "../models/subrubs_model.js";
import { gcloudStorage } from "../index.js";
import { format } from "util";

export const addInstructor = catchAsyncError(async (req, res, next) => {
  const bucket = gcloudStorage.bucket("my_instructor");
  // ===========Image upload handleing===============
  if (!req.file) {
    // res.status(400).send("No file uploaded.");
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(Date.now() + req.file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on("error", (err) => {
    next(err);
    // res.send(404).send(false);
  });

  blobStream.on("finish", async () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    console.log(publicUrl);
    // ============create instructor==============
    const newInstructor = {
      ...req.body,
      languages: JSON.parse(req.body.languages),
      car: JSON.parse(req.body.car),
      serviceSuburbs: JSON.parse(req.body.serviceSubrubs),
      avater: publicUrl,
    };
    const userExist = await Instructor.findOne({ email: req.body?.email });
    if (userExist)
      return next(
        new Errorhandler(500, "Instructor Already Exist With This Email")
      );
    const instructor = await Instructor.create(newInstructor);
    console.log(instructor);
    res.status(200).json({
      success: true,
      instructor,
    });
  });
  blobStream.end(req.file.buffer);
});

export const loginInstructor = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) next(new Errorhandler(404, `Credentials Not Found`));

  const instructor = await Instructor.findOne({ email }).select("+password");
  if (!instructor)
    return next(new Errorhandler(404, `No Instructor Found With This Email`));

  const passwordValid = await instructor.passwordComparison(password);
  if (passwordValid) return sendJwtToken(res, next, instructor);

  res.status(500).json({
    success: false,
    message: "You Entered Wrong Credentials",
  });
});

// get single instructor
export const singleInstructor = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const instructor = await Instructor.findById(id);

  if (!instructor)
    next(new Errorhandler(404, `No Instructor Found With This Id`));

  res.status(200).json({
    success: true,
    instructor,
  });
});

// get instructor based on suburbs
export const searchInstructor = catchAsyncError(async (req, res, next) => {
  const { postCode, transmission } = req.params;

  if (!postCode)
    return next(new Errorhandler(404, `No suburb Postcode Found `));

  const instructors = await Instructor.find({
    "serviceSuburbs.suburbs": { $elemMatch: { postCode } },
    transmissionType: { $regex: transmission, $options: "i" },
  });

  res.status(200).json({
    success: true,
    instructors,
  });
});

// get all suburbs
export const getAllsuburbs = catchAsyncError(async (req, res, next) => {
  const suburbs = await Suburbs.find({}).select("suburb state postcode");
  res.status(200).json({
    success: true,
    suburbs,
  });
});

export const searchsuburbs = catchAsyncError(async (req, res, next) => {
  const { keyword } = req.params;
  const suburbsKeyword = await Suburbs.find({
    suburb: { $regex: keyword, $options: "i" },
  }).select("suburb state postcode");

  const suburbPostcode = await Suburbs.find({
    postcode: parseInt(keyword),
  }).select("suburb state postcode");

  let suburbs = [];
  suburbs = [...suburbsKeyword, ...suburbPostcode];

  res.status(200).json({
    success: true,
    suburbs,
  });
});

export const forgotInstructorPassword = catchAsyncError(
  async (req, res, next) => {
    const { email } = req.body;

    const instructor = await Instructor.findOne({ email });
    if (!instructor)
      return next(new Errorhandler(404, "No Instructor Found With This Email"));
    await instructor.resetPasswordRequest();

    instructor.save();

    console.log(
      `http://localhost:3000/reset-password/instructor/${instructor?.resetPasswordToken}`
    );
    res.status(200).json({
      success: true,
      message: "Please Check Your Email, Password Reset Link Sent",
    });
  }
);

export const resetPasswordInstructor = catchAsyncError(
  async (req, res, next) => {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);
    if (!token || !newPassword)
      return next(new Errorhandler(404, `Token or Id Not Found`));

    const instructor = await Instructor.findOne({ resetPasswordToken: token })
      .select("+resetPasswordToken")
      .select("+resetPasswordTime");

    // matching the token
    if (Date.now() > instructor.resetPasswordTime) {
      return next(
        new Errorhandler(
          500,
          `Your Link Already Expired, Please Resend Forget Password Request`
        )
      );
    }

    if (token !== instructor.resetPasswordToken)
      return next(new Errorhandler(403, `Token Is Not Valid`));

    instructor.password = newPassword;
    await instructor.save();

    res.status(200).json({
      success: true,
    });
  }
);
