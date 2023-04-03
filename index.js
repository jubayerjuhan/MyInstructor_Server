import express from "express";

import { connectToDatabase } from "./database/database.js";
import { errorMiddleware } from "./middlewares/error_middleware.js";

import userRoutes from "./routes/user_routes.js";
import instructorApplicantRoute from "./routes/instructor_applicant_route.js";
import instructorRoute from "./routes/instructor_routes.js";
import paymentRoute from "./routes/payment_route.js";
import bookingRoute from "./routes/booking_route.js";
import adminRoute from "./routes/admin_route.js";
import suburbRoute from "./routes/suburb_route.js";
import giftCardRoute from "./routes/giftcard_route.js";
import agreementRoute from "./routes/agreement_route.js";
import conversationRoute from "./routes/conversation_route.js";
import earningRoute from "./routes/earning_route.js";
import { Server } from "socket.io";

import http from "http";
import path, { dirname } from "path";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import { Storage } from "@google-cloud/storage";
import { allowedorigin, checkOrigin } from "./middlewares/checkOrigin.js";
import { sendEmail } from "./middlewares/email/sendEmail.js";
import moment from "moment";
import { verifyInstructor } from "./middlewares/verify_user.js";
import EarningModel from "./models/earnings_model.js";
import { Instructor } from "./models/instructor_model.js";

// initializing app
const app = express();
// applying cors middleware

const server = http.createServer(app);

var corsOptions = {
  origin: allowedorigin,
};

app.use(cors(corsOptions));

// bodyparser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// initializing necessery variable and port
const PORT = process.env.PORT || 5000;

// connect to database
connectToDatabase();

// App Routes
// 01818958564
app.use("/api", userRoutes);
app.use("/api", instructorApplicantRoute);
app.use("/api", instructorRoute);
app.use("/api", paymentRoute);
app.use("/api", bookingRoute);
app.use("/api/admin", checkOrigin, adminRoute);
app.use("/api", giftCardRoute);
app.use("/api", suburbRoute);
app.use("/api/convo", conversationRoute);
app.use("/api/agreement", agreementRoute);
app.use("/api/earning", verifyInstructor, earningRoute);

// image request
app.use("/uploads", express.static("./tmp"), (req, res, next) => {
  next();
});

app.use(express.static("assets"));

// home request
app.get("/", async (req, res, next) => {
  const unpaidInstructors = await Instructor.aggregate([
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
        totalUnpaidAmount: { $sum: "$earnings.subtotal" },
      },
    },

    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        totalUnpaidAmount: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    unpaidInstructors,
    message: `My Instructor Server Is Up And Running.....`,
  });
});

// test request
app.post("/", async (req, res, next) => {
  // res.status(200).json({
  //   success: true,
  //   message: "My Instructor Server Is Up And Running.....",
  // });
});

// google cloud storage
export const gcloudStorage = new Storage({
  keyFilename: "./first-energy-364305-29145b74aa26.json",
  projectId: "first-energy-364305",
});

// websocket connection
// ----------------------

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let socketUsers = [];
// socket users methods
const removeUser = (socketId) => {
  const removedArray = socketUsers.filter((user) => user.socketId !== socketId);
  socketUsers = removedArray;
};

// connecting io
io.on("connection", (socket) => {
  socket.on("add_user", (data) => {
    socketUsers.push({ ...data, socketId: socket.id });
    io.emit("connected_users", socketUsers);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("connected_users", socketUsers);
  });

  socket.on("send_message_to_admin", (message) => {
    io.to(message.to).emit("recieve_message_admin", message);
  });

  socket.on("send__message", (message) => {
    io.to(message.to).emit("recieve_message_user", message);
  });
});

// ----------------------
//

// listening to server
server.listen(PORT, () =>
  console.log("Myinstructor server listening to port " + PORT + "...")
);

app.use(errorMiddleware);
