import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import Fileinput from "@/components/ui/Fileinput";
import { toast } from "react-toastify";
import Select from "@/components/ui/Select";

const AddAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const mode = location.state?.mode || "add"; // add | view | edit
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    uploadAssignment: "",
    dueDate: "",
    tenantId: "",
  });

  const [loading, setLoading] = useState(isViewMode || isEditMode);

  // Get tenant from localStorage
  const getTenantId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.tenantId || "";
    } catch (error) {
      console.error("Error getting tenantId:", error);
      return "";
    }
  };

  // fetch assignment for view/edit
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/assignments/${id}`,
          { headers: { Authorization: `${token}` } }
        );

        const assignment = response.data.data;
        setFormData({
          title: assignment.title || "",
          description: assignment.description || "",
          uploadAssignment: assignment.uploadAssignment || "",
          dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
          tenantId: assignment.tenantId || getTenantId(),
        });
      } catch (error) {
        toast.error("Error loading assignment data");
      } finally {
        setLoading(false);
      }
    };

    if ((isViewMode || isEditMode) && id) fetchAssignment();
  }, [id, isViewMode, isEditMode]);

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (e) => {
    if (isViewMode) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("documentFile", file);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/upload/upload`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedPath = res.data?.data || "";

      setFormData((prev) => ({
        ...prev,
        uploadAssignment: uploadedPath,
      }));
      
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("File upload error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.uploadAssignment.trim())
      newErrors.uploadAssignment = "Please upload an assignment";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Get tenantId from localStorage
      const tenantId = getTenantId();
      
      const payload = {
        title: formData.title,
        description: formData.description,
        uploadAssignment: formData.uploadAssignment,
        dueDate: new Date(formData.dueDate).toISOString(),
        tenantId: tenantId,
      };

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/assignments/update/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("Assignment updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/assignments/create`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("Assignment created successfully!");
      }

      setTimeout(() => navigate("/assignment-listing"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <p>Loading assignment data...</p>;

  return (
    <div>
      <Card
        title={
          isViewMode
            ? "View Assignment"
            : isEditMode
              ? "Edit Assignment"
              : "Add Assignment"
        }
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                readOnly={isViewMode}
                placeholder="Enter assignment title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                readOnly={isViewMode}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`border p-2 w-full rounded ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                readOnly={isViewMode}
                placeholder="Enter assignment description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Upload Assignment <span className="text-red-500">*</span>
              </label>
              {!isViewMode && (
                <Fileinput
                  name="assignment"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                />
              )}
              {formData.uploadAssignment && (
                <div className="mt-2">
                  <a
                    href={formData.uploadAssignment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {formData.uploadAssignment.split("/").pop()}
                  </a>
                </div>
              )}
              {errors.uploadAssignment && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.uploadAssignment}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              text={mode === "view" ? "Back" : "Cancel"}
              className={mode === "view" ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/assignment-listing")}
            />
            {!isViewMode && (
              <Button
                text={isEditMode ? "Update Assignment" : "Add Assignment"}
                className="btn-primary"
                type="submit"
              />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddAssignmentPage;