import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import NoImage from "@/assets/images/all-img/404.svg";
import { toast } from "react-toastify";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    _id: "",
    username: "",
    name: "",
    email: "",
    type: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch current logged-in user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user")); // store this at login

        if (!userData?._id) {
          toast.error("User not found in localStorage");
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/user/user/${userData._id}`,
          { headers: { Authorization: `${token}` } }
        );

        const user = res.data.data;
        setFormData({
          _id: user._id,
          username: user.username || "",
          name: user.name || "",
          email: user.email || "",
          type: user.type || "",
          image: user.image || "",
        });
      } catch (error) {
        toast.error("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  Submit updated name + username
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/user/update/${formData._id}`,
        {
          username: formData.username,
          name: formData.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      toast.success("Profile updated successfully!");
      // optional: update local storage
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div>
      <Card title="Edit Profile">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left section */}
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    errors.username ? "border-red-500" : ""
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Role (readonly) */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  readOnly
                  className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex flex-col items-center">
              <img
                src={
                  formData.image
                    ? `${import.meta.env.VITE_APP_BASE_URL}/${formData.image}`
                    : NoImage
                }
                alt="Profile"
                className="w-60 h-60 rounded-full object-cover border"
              />
              <p className="mt-2 text-sm text-gray-500">Profile Picture</p>

              <div className="pt-16 flex justify-center gap-4 w-full">
                <Button
                  text="Cancel"
                  className="btn-light "
                  type="button"
                  onClick={() => navigate(-1)}
                />
                <Button text="Update" className="btn-primary " type="submit" />
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
