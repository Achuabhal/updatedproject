import express from "express"
import { login, signup ,logout, updateProfile,updateSemester,updateCourse, checkAuth} from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();
 
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-semester", protectRoute, updateSemester);
router.put("/update-course", protectRoute,updateCourse );
router.get("/check",protectRoute, checkAuth);

// Assuming userId is passed as a URL parameter

  



export default router;