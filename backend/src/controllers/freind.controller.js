import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from 'mongoose';
import Connection from "../models/connections.model.js";


export const getFilteredUsers = async (req, res) => {
    try {
      const { userId } = req.params; // Make sure this matches the parameter name in the route
  
      // Fetch the logged-in user
      const loggedInUser = await User.findById(userId);
      if (!loggedInUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Fetch users with the same course and semester
      const filteredUsers = await User.find({
        course: loggedInUser.course,
        semester: loggedInUser.semester,
        _id: { $ne: userId }, // Exclude the logged-in user
      });
      console.log(filteredUsers);
      return res.status(200).json({ filteredUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  
  export const addFriend = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid friend ID format" });
    }
    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }
    if (userId === friendId) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    try {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!friend) return res.status(404).json({ message: "Friend not found" });

      const connection = await Connection.findOne({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        status: "pending",
      });

      if (!connection) {
        return res.status(404).json({ message: "No pending connection found." });
      }
      connection.status = "accepted";
      await connection.save();

      if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: "Already friends" });
      }

      user.friends.push(friendId);
      friend.friends.push(userId);
      await user.save();
      await friend.save();

      res.status(200).json({ message: "Friend added successfully", friendId });
    } catch (error) {
      console.error("Error adding friend:", error.message);
      if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  };






  export const sendRequest = async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
  
      if (senderId === receiverId) return res.status(400).json({ message: "You cannot send a request to yourself." });
  
      const existingRequest = await Connection.findOne({ senderId, receiverId });
  
      if (existingRequest) return res.status(400).json({ message: "Request already sent." });
  
      const newRequest = new Connection({ senderId, receiverId });
      await newRequest.save();
  
      res.status(201).json({ message: "Friend request sent successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };



  export const request = async (req, res) => {
    try {
      const { senderID } = req.body;
      const connection = await Connection.findOne({
        receiverId: senderID,
        status: "pending",
      }).populate('senderId'); // Populate senderId to get full sender data

      console.log("Connection:", connection);

      if (connection) {
        return res.status(200).json({ sender: connection.senderId });
      }
      return res.status(404).json({ message: "No pending connection found." });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };






  
  export const getFriends = async (req, res) => {
    const userId = req.params.userId;
  
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
  
    try {
      // Populate the 'friends' field to get full friend documents
      const user = await User.findById(userId).populate('friends');
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // user.friends now contains full friend objects with all fields
      res.status(200).json({ friends: user.friends });
    } catch (error) {
      console.error("Error retrieving friends:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };