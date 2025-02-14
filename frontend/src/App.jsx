import Navbar from "./components/Navbar";
import { Routes,Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import  SelectedUserProfile from "./pages/SelectedUserProfile";
import ADD from "./pages/addfriend";
import GROUP from "./pages/groupchat";
import GET from "./pages/request";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import SNAKE from "./pages/snake"
function App() {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  console.log({onlineUsers});

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/selecteduserprofile" element={authUser ? <SelectedUserProfile/> : <Navigate to="/login" />} />
        <Route path="/add-friends" element={<ADD />} />
        <Route path="/friends" element={<GROUP />} />
        <Route path="/snake" element={<SNAKE />} />
        <Route path="/request" element={<GET />} />

      </Routes>

      <Toaster />
    </div>
  );
}

export default App