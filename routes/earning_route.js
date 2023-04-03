import { Router } from "express";
import {
  getEarningsByInstructor,
  getInstructorPendingEarning,
} from "../controllers/earnings_controller.js";
import { verifyInstructor } from "../middlewares/verify_user.js";
const router = Router();

router.route("/get-all").get(verifyInstructor, getEarningsByInstructor);
router.route("/amount").get(verifyInstructor, getInstructorPendingEarning);

export default router;
