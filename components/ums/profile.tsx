"use client";

import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { TextField, Button, duration } from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "@/app/contexts/authContext";

export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfilePageVisible, setIsProfilePageVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    username: "",
    email: "",
    currentpassword: "",
    newpassword: "",
  });

  const [isUpdated, setIsUpdated] = useState(true);

  const { user, setUser, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setUserInfo((prev) => ({
        ...prev,
        name: user.name,
        username: user.username,
        email: user.email,
      }));
    }
  }, [user]);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const showProfilePage = () => {
    setIsProfilePageVisible(true);
    setIsOpen(false);
  };

  const addNewAdmin = () => {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUserInfo({ ...userInfo, [name]: value });
  };
  const handleSave = async () => {
    if (user?.password !== userInfo.currentpassword) {
      toast.error("Current password is incorrect.", {
        autoClose: 1500,
      });
      return;
    }

    if (userInfo.newpassword) {
      // Check if the password is valid (at least 8 characters)
      if (userInfo.newpassword.length < 8) {
        toast.error("Password must be at least 8 characters long.", {
          autoClose: 1500,
        });
        return;
      }
    }
    setIsUpdated(false);

    await fetch(`/api/admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        name: userInfo.name,
        username: userInfo.username,
        email: userInfo.email,
        password: userInfo.newpassword,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("User updated successfully.", {
            autoClose: 1500,
          });

          setUser({
            ...user,
            name: userInfo.name,
            username: userInfo.username,
            email: userInfo.email,
            password: userInfo.newpassword,
          });

          setIsUpdated(true);

          setIsProfilePageVisible(false);
        }
      })
      .catch((error) => {
        toast.error("Failed to update user.", {
          autoClose: 1500,
        });
      });

    setIsProfilePageVisible(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
      >
        <AccountCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="hidden sm:inline">{user?.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-30">
          <ul className="py-2">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center hover:text-blue-700"
              onClick={showProfilePage}
            >
              <PersonIcon className="mr-2 text-blue-600" />{" "}
              <p className="text-blue-600">Edit</p>
            </li>
            {/* <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center hover:text-blue-700"
              onClick={showProfilePage}
            >
              <GroupAddIcon className="mr-2" /> Add
            </li> */}
            <li
              className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={logout}
            >
              <LogoutIcon className="mr-2" /> Logout
            </li>
          </ul>
        </div>
      )}

      {isProfilePageVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 ">Edit Profile</h2>

            {user && (
              <form className="space-y-4">
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={userInfo?.username}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userInfo?.email}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentpassword"
                  type="password"
                  value={userInfo?.currentpassword}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  name="newpassword"
                  type="password"
                  value={userInfo?.newpassword}
                  onChange={handleChange}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setIsProfilePageVisible(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                  >
                    {isUpdated ? "Save" : "Updating..."}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
