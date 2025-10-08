import { Router } from "express";
import { userController } from "../controller/userController.js";
const router = Router();

router.post("/v1/auth/register", userController.register);
router.post("/v1/auth/login", userController.login);

export default router;
