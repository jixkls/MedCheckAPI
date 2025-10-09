import { Router } from "express";
import { userController } from "../controller/userController.js";
import { userMiddleware } from "../middleware/index.js";
const router = Router();

router.post("/v1/auth/register", userController.register);
router.post("/v1/auth/login", userController.login);

router.get("/v1/users/me", userMiddleware.auth, userController.getUser);
router.put("/v1/users/me", userMiddleware.auth, userController.editUser);

export default router;
