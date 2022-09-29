import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const instructorSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Email address is required",
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  transmissionType: {
    type: String,
    required: true,
  },
  languages: [{ type: String, required: true }],
  avater: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  reviews: [
    {
      user: { type: String },
      rating: { type: Number },
      message: { type: String },
    },
  ],
  car: {
    name: { type: String, required: true },
    numberPlate: { type: String, required: true },
    image: { type: String },
  },
  serviceSubrubs: [
    {
      name: { type: String, required: true },
      postCode: { type: String, required: true },
    },
  ],
  password: {
    type: String,
    required: true,
    select: false,
  },
});

instructorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

instructorSchema.methods.generateJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_DAY,
  });
};

instructorSchema.methods.passwordComparison = async function (password) {
  const validPass = await bcrypt.compare(password, this.password);
  return validPass;
};

export const Instructor = mongoose.model("Instructor", instructorSchema);
