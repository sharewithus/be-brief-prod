import express from "express";
import { Login, logOut, Me } from "../controllers/Auth.js";
import { GenerateQRCode } from "../controllers/GenerateQRCode.js";
import { Scanning } from "../controllers/Scan.js";
import {
  Attendances,
  getUsersWithoutAttendance,
} from "../controllers/Export.js";
import { verifyUser } from "../middleware/AuthUser.js";
import { refreshToken } from "../controllers/RefreshToken.js";
const router = express.Router();

router.get("/me", Me);
router.post("/login", Login);
router.delete("/logout", logOut);
router.get("/generate", GenerateQRCode);
router.post("/scanning", verifyUser, Scanning);
router.get("/token", refreshToken);
router.post("/attendances", Attendances);
router.post("/absences", getUsersWithoutAttendance);
export default router;
