import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import GroupMessage from "../models/GroupMessage.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
      course: loggedInUser.course,
      semester: loggedInUser.semester,
    }).select("-password");
   console.log(filteredUsers);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileName } = req.body; // Include `fileName`
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl, fileUrl;

    if (image) {
      const imageUploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = imageUploadResponse.secure_url;
    }

    if (file) {
      const fileExtension = fileName.split('.').pop(); // Extract the file extension
      const publicId = fileName.split('.').slice(0, -1).join('_'); // Remove the extension from the file name
    
      const fileUploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw", // Required for non-image files
        use_filename: true,   // Use the original file name
        unique_filename: false, // Prevent Cloudinary from appending unique strings
        public_id: `${publicId}.${fileExtension}`, // Include the extension in the public_id
      });
      fileUrl = fileUploadResponse.secure_url;
    }
    

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileUrl,
      fileName, // Save the original file name
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const PREDEFINED_GROUP_ID = "60d0fe4f5311236168a109ca"; // Replace with your actual group id

export const sendGroupMessage = async (req, res) => {
  try {
    // Since there's only one group, we don't need to extract groupId from req.params or req.body.
    const { text } = req.body; // Expecting only text from the client

    // Ensure that the authenticated user is available
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const senderId = req.user._id;

    // Create and save the new group message using the predefined group id
    const newGroupMessage = await GroupMessage.create({
      senderId,
      groupId: PREDEFINED_GROUP_ID,
      text,
      // Optionally, you can include image, file, fileName if needed:
      image: "",
      file: "",
      fileName: "",
    });

    res.status(200).json({
      success: true,
      message: "Group message sent successfully",
      data: newGroupMessage,
    });
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending group message",
      error: error.message,
    });
  }
};