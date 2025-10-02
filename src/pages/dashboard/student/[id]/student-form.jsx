import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import NoImage from "@/assets/images/all-img/404.svg";

const StudentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

const mode = location.state?.mode || "edit";
const isViewMode = mode === "view";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isActive: false,
    password: "",
    tenantName: "",
    type: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/user/user/${id}`,
          { headers: { Authorization: `${token}` } }
        );

        const student = response.data.data;

        setFormData({
          name: student.name || "",
          email: student.email || "",
          isActive: student.isActive || false,
          password: "",
          tenantName: student.tenantId?.name || "N/A",
          type: student.type || "N/A",
          image: student.image || "",
        });
      } catch (error) {
        console.error("Error fetching student:", error);
        setMessage("Error loading student data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  const handleInputChange = (e) => {
    if (isViewMode) return; // disable editing in view mode
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return; // prevent submit in view mode

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/user/student-update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setMessage("Student updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage("Error updating student");
    }
  };

  if (loading) return <p>Loading student data...</p>;

  return (
    <div>
      <Card title={isViewMode ? "View Student" : "Edit Student"}>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 ">
              <div className="grid grid-cols-2 gap-8">
                <div className="p-3 bg-slate-300 text-slate-800 text-sm rounded-md">
                  Tenant: {formData.tenantName}
                </div>
                <div className="p-3 bg-slate-300 text-slate-800 text-sm rounded-md">
                  Type: {formData.type}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={isViewMode}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                  disabled={isViewMode}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            {/* Profile picture */}
            <div className="flex flex-col items-center ">
              <img
                src={
                  formData.image
                    ? `${process.env.REACT_APP_BASE_URL}/${formData.image}`
                    : NoImage
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border "
              />
              <p className="mt-2 text-sm text-gray-500">Profile Picture</p>

              {/* Buttons */}
              <div className="pt-8 flex justify-between gap-4">
                <Button
                  text="Cancel"
                  className="btn-light w-1/2"
                  type="button"
                  onClick={() => window.history.back()}
                />
                {!isViewMode && (
                  <Button
                    text="Update"
                    className="btn-dark w-1/2"
                    type="submit"
                  />
                )}
              </div>
            </div>
          </div>
        </form>

        {message && (
          <div className="mt-4">
            <p className="text-center">{message}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentFormPage;
