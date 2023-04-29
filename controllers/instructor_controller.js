import catchAsyncError from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/handle_error.js";
import { sendJwtToken } from "../middlewares/sendJwtToken.js";
import { Instructor } from "../models/instructor_model.js";
import { Suburbs } from "../models/subrubs_model.js";
import { gcloudStorage } from "../index.js";
import { format } from "util";
import { Booking } from "../models/booking_model.js";
import { sendEmail } from "./email_controller.js";

export const addInstructor = catchAsyncError(async (req, res, next) => {
  const bucket = gcloudStorage.bucket("my_instructor");

  const car = JSON.parse(req.body.car);
  const allSubs = JSON.parse(req.body.serviceSuburbs);
  const languages = JSON.parse(req.body?.languages);

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
    // ============create instructor==============

    const userExist = await Instructor.findOne({ email: req.body?.email });
    if (userExist)
      return next(
        new Errorhandler(500, "Instructor Already Exist With This Email")
      );

    try {
      const instructor = await Instructor.create({
        ...req.body,
        avater: publicUrl,
        car,
        languages,
        serviceSuburbs: {
          suburbs: allSubs.suburbs,
        },
      });

      // sending email after creating the account
      const sms = `email : ${instructor.email}
     \n \n
    password: ${req.body.password}`;
      sendEmail(3, instructor.email, instructor.firstName, sms);

      res.status(200).json({
        success: true,
        instructor,
      });
    } catch (error) {
      console.log(error);
      return next(new Errorhandler(404, "All Information Not Provided"));
    }
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
  const instructor = await Instructor.findById(id).populate();
  // "reviews reviews.user"
  // ();

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
  const { language } = req.query;

  if (!postCode)
    return next(new Errorhandler(404, `No suburb Postcode Found `));

  if (language && language !== "all") {
    const instructors = await Instructor.find({
      "serviceSuburbs.suburbs": { $elemMatch: { postCode } },
      transmissionType: { $regex: transmission, $options: "i" },
    });

    const sortedInstructor = [];
    instructors.forEach((instructor) => {
      if (instructor.languages.includes(language)) {
        sortedInstructor.push(instructor);
      }
    });

    return res.status(200).json({
      success: true,
      instructors: sortedInstructor,
    });
  }

  const instructors = await Instructor.find({
    "serviceSuburbs.suburbs": { $elemMatch: { postCode } },
    transmissionType: { $regex: transmission, $options: "i" },
  });

  console.log(instructors, "instructors...");

  res.status(200).json({
    success: true,
    instructors,
  });
});

// get all suburbs
export const getAllsuburbs = catchAsyncError(async (req, res, next) => {
  const suburbs = await Suburbs.find({}).select("suburb state postcode price");
  res.status(200).json({
    success: true,
    suburbs,
  });
});

export const searchsuburbs = catchAsyncError(async (req, res, next) => {
  const { keyword } = req.params;
  const suburbsKeyword = await Suburbs.find({
    suburb: { $regex: keyword, $options: "i" },
  }).select("suburb state postcode price");

  const suburbPostcode = await Suburbs.find({
    postcode: parseInt(keyword),
  }).select("suburb state postcode price");

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

    res.status(200).json({
      success: true,
      message: "Please Check Your Email, Password Reset Link Sent",
    });
  }
);

export const resetPasswordInstructor = catchAsyncError(
  async (req, res, next) => {
    const { token, newPassword } = req.body;
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

// edit instructor
export const editInstructor = catchAsyncError(async (req, res, next) => {
  const userEdited = await Instructor.findByIdAndUpdate(req.user._id, {
    ...req.body,
    email: req.user.email,
  });

  const instructor = await Instructor.findById(req.user._id);

  res.status(200).json({
    success: true,
    instructor,
  });
});

// edit profile picture of instructor
export const updateInstructorAvater = catchAsyncError(
  async (req, res, next) => {
    const bucket = gcloudStorage.bucket("my_instructor");
    // ===========Image upload handleing===============
    if (!req.file) {
      res.status(400).send("No Image Found");
      return;
    }

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(Date.now() + req.file.originalname);

    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      next(err);
      res.status(500).json({
        success: false,
      });
    });

    blobStream.on("finish", async () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      const instructor = await Instructor.findById(req.user._id);
      instructor.avater = publicUrl;
      instructor.save();

      // response
      return res.status(200).json({
        success: true,
        instructor,
      });
    });
    blobStream.end(req.file.buffer);
  }
);

// insert rating
export const postRating = catchAsyncError(async (req, res, next) => {
  const { rating, review, instructor, booking } = req.body;

  if (!rating || !review || !instructor || !booking)
    return next(new Errorhandler(401, `Required Fields Not Found`));

  const teacher = await Instructor.findById(instructor);
  if (!teacher) return next(new Errorhandler(404, `Instructor Not Found`));

  teacher.reviews.push({
    user: `${req.user.firstName} ${req.user.lastName}`,
    rating,
    message: review,
  });

  const currentBooking = await Booking.findById(booking);
  if (!currentBooking) return next(new Errorhandler(404, `Booking Not Found`));

  currentBooking.reviewed = true;

  currentBooking.save();
  teacher.save();

  res.status(200).json({
    success: true,
    instructor: teacher,
  });
});

export const changeInstructorAvailability = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;
    const { available } = req.body;

    const instructor = await Instructor.findById(id);

    if (!instructor)
      return next(new Errorhandler(404, "No Instructor Found With This Id"));

    instructor.available = available;
    instructor.save();

    res.status(200).json({
      success: true,
      instructor,
    });
  }
);

export const getExpiredInstructor = catchAsyncError(async (req, res, next) => {
  const instructors = await Instructor.find({
    $or: [
      {
        drivingLicenseExpire: { $lte: Date.now() },
      },
      {
        instructorLicenseExpire: { $lte: Date.now() },
      },
      {
        childrenCheckLicenseExpire: { $lte: Date.now() },
      },
    ],
  });
  res.status(200).json({
    success: true,
    instructors,
    date: Date.now(),
  });
});
