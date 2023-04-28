import express from "express";
// importing the controller functions from fortnightly_payment_controller.js
import { instructorAllFortnightlyPayments } from "../controllers/Admin/fortnightly_payment/fortnightly_payment_controller.js";

// creating router instance
const router = express.Router();

// routes
router.route("/list").get(instructorAllFortnightlyPayments);

export default router;
