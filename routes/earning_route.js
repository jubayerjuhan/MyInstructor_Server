import { Router } from "express";
import { getEarningsByInstructor } from "../controllers/earnings_controller.js";
const router = Router();

router.route("/:id").get(getEarningsByInstructor);

export default router;
