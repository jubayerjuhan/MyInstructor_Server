import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = Schema(
  {
    text: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const messages = mongoose.model("message", messageSchema);
