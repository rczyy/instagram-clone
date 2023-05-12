import { Router } from "express";
import {
  getMe,
  getUsers,
  loginUser,
  signupUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);
router.get("/me", getMe);
router.post("/signup", signupUser);
router.post("/login", loginUser);

export const userRoute = router;
