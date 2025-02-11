import express from "express";
import { userController } from "../controllers/user.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/role", checkRole([]), userController.getRole); // Everyone can access this route
router.get("/completed", checkRole(["jobSeeker", "employer"]), userController.checkProfileCompletion);
router.get("/", checkRole(["jobSeeker", "employer", "admin"]), userController.getUser);
router.post("/basic", checkRole([]), userController.createBasicUser);
router.put("/", checkRole(["jobSeeker", "employer", "admin"]), userController.updateUser);
router.delete("/", checkRole(["jobSeeker", "employer", "admin"]), userController.deleteUser);

export default router;
