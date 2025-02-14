import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  user: null, // Store user data
  isUsersLoading: false,
  isMessagesLoading: false,
  isUserLoading: false, // Loading state for user data

  // Get users
  getUsers: async () => {
    const { authUser } = useAuthStore.getState();
    const userId = authUser._id;

    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/friend/${userId}`);
      // Notice we're now accessing res.data.friends
      set({ users: res.data.friends });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  

  // Get messages
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Fetch user data
  fetchUser: async () => {
    const { authUser } = useAuthStore.getState(); // Get the authenticated user
    if (!authUser) {
      toast.error("User not authenticated.");
      return;
    }

    const userId = authUser._id;
    console.log(userId); // Debugging log
    set({ isUserLoading: true });

    try {
      const response = await axiosInstance.get(`/addfriend/${userId}`);
      if (response.data?.filteredUsers?.length > 0) {
        set({ user: response.data.filteredUsers[0] }); // Store the first user
      } else {
        toast.error("No user found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    } finally {
      set({ isUserLoading: false });
    }
  },
  fetchFilteredUsers: async () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) {
      toast.error("User not authenticated.");
      return [];
    }
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get(`/addfriend/${authUser._id}`);
      const filtered = response.data?.filteredUsers || [];
      set({ filteredUsers: filtered });
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered users:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch user data"
      );
      return [];
    } finally {
      set({ isUserLoading: false });
    }
  },
  fetchFilteredUserss: async () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) {
      toast.error("User not authenticated.");
      return [];
    }
    set({ isUserLoading: true });
    try {
      // POST request with the user id sent in the request body
      const response = await axiosInstance.post(`/getrequest`, { senderID: authUser._id });
      
      // If the API now returns an array of connection objects directly:
      const connections = response.data || [];
      set({ filteredUsers: connections }); // Consider renaming this state key for clarity
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered users:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch user data"
      );
      return [];
    } finally {
      set({ isUserLoading: false });
    }
  },
  
  

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const formData = new FormData();
      Object.keys(messageData).forEach((key) => {
        if (messageData[key]) {
          if (key === "file" && messageData[key].data) {
            formData.append("file", messageData[key].data);
            formData.append("fileName", messageData[key].name);
          } else {
            formData.append(key, messageData[key]);
          }
        }
      });

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageRelevant =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (isMessageRelevant) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));



