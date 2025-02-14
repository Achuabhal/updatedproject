import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { axiosInstance } from "../lib/axios";  // Import your custom axios instance

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [translations, setTranslations] = useState({}); // key: message id, value: translated text
  const [loadingTranslations, setLoadingTranslations] = useState({}); // key: message id, value: boolean

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Function to call the backend translation endpoint using axiosInstance
  const handleTranslate = async (messageId, text) => {
    // Prevent multiple requests for the same message
    if (loadingTranslations[messageId]) return;
    setLoadingTranslations((prev) => ({ ...prev, [messageId]: true }));

    try {
      // Make a POST request using axiosInstance
      const { data } = await axiosInstance.post("/translate", {
        text,
        target: "ml", // Malayalam target language code
      });
      setTranslations((prev) => ({ ...prev, [messageId]: data.translatedText }));
    } catch (err) {
      console.error("Translation request failed:", err);
    } finally {
      setLoadingTranslations((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.file && (
                <a
                  href={`${message.file}?fl_attachment=true`}
                  download={message.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-all mb-2"
                >
                  {message.fileName || "Download File"}
                </a>
              )}
              {message.text && (
                <>
                  <p>{message.text}</p>
                  {/* Display translated text if available */}
                  {translations[message._id] && (
                    <p className="mt-2 text-green-600">
                      {translations[message._id]}
                    </p>
                  )}
                  {/* Button to trigger translation */}
                  <button
                    onClick={() => handleTranslate(message._id, message.text)}
                    className="btn btn-sm mt-2"
                    disabled={loadingTranslations[message._id]}
                  >
                    {loadingTranslations[message._id]
                      ? "Translating..."
                      : "Translate to Malayalam"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
