import catchAsyncError from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/handle_error.js";
import { sendJwtToken } from "../middlewares/sendJwtToken.js";
import { Instructor } from "../models/instructor_model.js";
import { Suburbs } from "../models/subrubs_model.js";

export const addInstructor = catchAsyncError(async (req, res, next) => {
  const newInstructor = {
    ...req.body,
    languages: JSON.parse(req.body.languages),
    car: JSON.parse(req.body.car),
    serviceSuburbs: JSON.parse(req.body.serviceSubrubs),
    avater: req.file.filename,
  };

  console.log(newInstructor);

  const userExist = await Instructor.findOne({ email: req.body?.email });
  if (userExist)
    next(new Errorhandler(500, "Instructor Already Exist With This Email"));

  const instructor = await Instructor.create(newInstructor);

  console.log(instructor);
  res.status(200).json({
    success: true,
    instructor,
  });
});

export const loginInstructor = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) next(new Errorhandler(404, `Credentials Not Found`));

  const instructor = await Instructor.findOne({ email }).select("+password");
  if (!instructor)
    next(new Errorhandler(404, `No Instructor Found With This Email`));

  const passwordValid = await instructor.passwordComparison(password);
  if (passwordValid) return sendJwtToken(res, next, instructor);

  res.status(200).json({
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