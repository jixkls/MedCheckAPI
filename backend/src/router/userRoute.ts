import { Router } from "express";
import { userController } from "../controller/userController.js";
import { userMiddleware } from "../middleware/index.js";
const router = Router();

router.post("/v1/auth/register", userController.register);
router.post("/v1/auth/login", userController.login);

router.get("/v1/users/me", userMiddleware.auth, userController.getUser);
router.put("/v1/users/me", userMiddleware.auth, userController.editUser);

router.post("/v1/doctors", userMiddleware.auth, userController.registerDoctor);
router.put("/v1/doctors/:id", userMiddleware.auth, userController.editDoctor);
router.delete(
  "/v1/doctors/:id",
  userMiddleware.auth,
  userController.deleteDoctor,
);
router.get("/v1/doctors", userController.getDoctors)
router.get("/v1/doctors/:id", userController.getDoctorsById)

router.get("/v1/search/doctors", userController.searchDoctors);

router.get("/v1/specialties", userController.getSpecialists)
router.get("/v1/cities", userController.getCities);
export default router;
