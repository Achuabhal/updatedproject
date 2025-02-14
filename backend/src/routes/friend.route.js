import express from "express";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import { getFilteredUsers ,addFriend ,getFriends,sendRequest,request} from "../controllers/freind.controller.js"; // Ensure this is the correct path
import axios from "axios";


const router = express.Router();

router.get("/addfriend/:userId", (req, res, next) => {
    console.log("Route hit: /addfriend/:userId");

    // Sanitize userId
    let userId = req.params.userId.trim(); // Remove unwanted spaces or newlines

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID format" });
    }

    req.params.userId = userId; // Update the sanitized value
    next();
}, getFilteredUsers);






router.post("/send", sendRequest);


router.post("/getrequest",request);



router.post("/addfriend/:userId", (req, res, next) => {
    const { friendId } = req.body;

    // Sanitize and validate userId and friendId
    const userId = req.params.userId.trim();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID format" });
    }

    // Check if the friendId exists and is valid
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return res.status(400).json({ error: "Invalid Friend ID format" });
    }

    req.params.userId = userId; // Update the sanitized value
    req.body.friendId = friendId; // Update the friendId in request body

    // Proceed to the next middleware (addFriend)
    next();
}, addFriend);


router.get("/friend/:userId", (req, res, next) => {
    console.log("Route hit: /addfriend/:userId");

    // Sanitize userId
    let userId = req.params.userId.trim(); // Remove unwanted spaces or newlines

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID format" });
    }

    req.params.userId = userId; // Update the sanitized value
    next();
}, getFriends);



router.post("/translate", async (req, res) => {
    const { text, target } = req.body;
  
    // Validate required fields
    if (!text || !target) {
      return res.status(400).json({ error: "Missing text or target language" });
    }
  
    try {
      // Construct the MyMemory Translation API URL
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${target}`;
  
      // Log the URL to ensure it's correctly formed
      console.log("Calling MyMemory API with URL:", url);
  
      // Call the MyMemory Translation API
      const response = await axios.get(url);
  
      // Log the entire response from MyMemory for debugging
      console.log("MyMemory API response data:", response.data);
  
      // Check if response data is in the expected structure
      if (!response.data || !response.data.responseData) {
        return res.status(500).json({
          error: "Invalid response structure from translation API",
        });
      }
  
      const translatedText = response.data.responseData.translatedText;
      res.json({ translatedText });
    } catch (error) {
      // Log full error details for debugging
      console.error(
        "Translation error:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({
        error: "Translation failed",
        details: error.response ? error.response.data : error.message,
      });
    }
  });
  



export default router;
