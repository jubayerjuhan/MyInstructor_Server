import mongoose from "mongoose";

const EarningSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    bookingAmount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    instructorAmount: {
      type: Number,
      required: true,
    },
    invoice: {
      type: String,
      required: [true, "Invoice Is Required"],
    },
    serviceCharge: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EarningModel = mongoose.model("earning", EarningSchema);

export default EarningModel;
