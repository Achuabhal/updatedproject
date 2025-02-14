import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage,sendGroupMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.post("/sendd/:id",sendGroupMessage);

console.log("Route hit: /addefriend/:userId");

  

export default router;
