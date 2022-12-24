import { Router } from "express";
import {
  applyInstructor,
  getApplicationInformation,
  getAppliedInstructors,
} from "../controllers/instructor_applicant_controller.js";
import { verifyAdmin } from "../middlewares/verify_user.js";
const router = Router();
import { multerProcess } from "../utils/multer.js";

router.route("/apply-instructor").post(applyInstructor);
router.route("/instructor-application/:id").get(getApplicationInformation);

export default router;
