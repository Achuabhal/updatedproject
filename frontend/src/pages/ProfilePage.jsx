import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User,GraduationCap  } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile,isUpdatingSemester, updateProfile  } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [semester, setSemester] = useState(authUser?.semester || "");
  const [course, setCourse] = useState(authUser?.course || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSemesterUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/update-semester", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`, // Send token in Authorization header
        },
        body: JSON.stringify({ semester }),
        credentials: "include", // Include cookies in the request
      });
  
      if (response.ok) {
        const data = await response.json();
       // alert(`Semester updated successfully to ${data.semester}!`);
        setSemester(data.semester); // Update UI with new semester
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || "Failed to update semester");
        } catch {
          alert(errorText || "An unknown error occurred");
        }
      }
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("An error occurred while updating the semester.");
    }
  };
  

  const handleCourseUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/update-course", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`, // Send token in Authorization header
        },
        body: JSON.stringify({ course }),
        credentials: "include", // Include cookies in the request
      });
  
      if (response.ok) {
        const data = await response.json();
       //alert(`Course updated successfully to ${data.Course}!`);
        setCourse(data.course); // Update UI with new semester
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || "Failed to update course");
        } catch {
          alert(errorText || "An unknown error occurred");
        }
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("An error occurred while updating the course.");
    }
  };
  

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Semester Update Section */}
          <div className="mt-6">
            <label htmlFor="semester" className="block text-sm font-medium">
              Semester
            </label>
            <select
              id="semester"
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border mt-2"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={isUpdatingSemester}
            >
              <option value="" disabled>
                Select your semester
              </option>
              {[...Array(8)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleSemesterUpdate}
              disabled={isUpdatingSemester}
            >
              Update Semester
            </button>
          </div>

          {/* Course Update Section */}
          <div className="mt-6">
            <label htmlFor="semester" className="block text-sm font-medium">
            Course
            </label>
            <select
              id="course"
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border mt-2"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={isUpdatingSemester}
            >
              <option value="" disabled>
                Select your course
                Select your semester
  </option>
  <option value="B.Com">B.Com</option>
  <option value="BBA">BBA</option>
  <option value="BA Economics">BA Economics</option>
</select>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleCourseUpdate}
              disabled={isUpdatingSemester}
            >
              Update Course
            </button>
          </div>

          


          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>


            <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                University Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.collegeName}
              </p>
            </div>
           </div>



            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
