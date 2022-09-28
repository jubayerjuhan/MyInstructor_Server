import express from "express";
import "dotenv/config";
import { connectToDatabase } from "./database/database.js";
import userRoutes from "./routes/user_routes.js";
import instructorApplicantRoute from "./routes/instructor_applicant_route.js";
import { errorMiddleware } from "./middlewares/error_middleware.js";
import bodyParser from "body-parser";

// initializing app
const app = express();

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// initializing necessery variable and port
const PORT = process.env.PORT || 5000;

// connect to database
connectToDatabase();

// App Routes
app.use("/api", userRoutes);
app.use("/api", instructorApplicantRoute);

// home request
app.get("/", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "My Instructor Server Is Up And Running...",
  });
});

// listening to server
app.listen(PORT, () =>
  console.log("Myinstructor server listening to port " + PORT + "...")
);

app.use(errorMiddleware);
