import { Router } from "express";
import {
  getEarningsByInstructor,
  getInstructorPendingEarning,
} from "../controllers/earnings_controller.js";
import { verifyAdmin, verifyInstructor } from "../middlewares/verify_user.js";
import {
  fortnightPaymentInstructorList,
  paySelectedInstructors,
} from "../controllers/Admin/earning/admin_earnings.js";
const router = Router();

router.route("/list").get(verifyInstructor, getEarningsByInstructor);
router.route("/amount").get(verifyInstructor, getInstructorPendingEarning);

// here is the options for admin on the
router
  .route("/admin/instructor-list")
  .get(verifyAdmin, fortnightPaymentInstructorList);

router
  .route("/admin/pay-selected-instructors")
  .post(verifyAdmin, paySelectedInstructors);

export default router;
