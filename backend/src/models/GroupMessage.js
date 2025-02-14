// models/GroupMessage.js
import mongoose from "mongoose";

// Predefined group id (use your actual group ObjectId as a string)
const PREDEFINED_GROUP_ID = "60d0fe4f5311236168a109ca";

const groupMessageSchema = new mongoose.Schema(
  {
    // The user who sends the message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The group (chat room) for all messages is predefined.
    // Mongoose will automatically cast the string to an ObjectId.
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: PREDEFINED_GROUP_ID,
      immutable: true // Prevent changes after creation
    },
    // The text content of the message
    text: {
      type: String,
      required: true,
    },
    // Optional field for an image attachment
    image: {
      type: String,
      default: "",
    },
    // Optional field for a file attachment
    file: {
      type: String,
      default: "",
    },
    // Optional field to store the original file name of the attachment
    fileName: {
      type: String,
      default: "",
    },
    // Optional array for tracking which users have read the message
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;
