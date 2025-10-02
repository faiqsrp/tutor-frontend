import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import Fileinput from "@/components/ui/Fileinput";
import { toast } from "react-toastify";

const AddDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "add"; // add | view | edit
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    title: "",
    documentType: "",
    documnetBrief: "",
    documentURL: "",
    documentUpload: "",
  });

  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(isViewMode || isEditMode);

  // fetch document types
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/document-types/GetAll`,
          { headers: { Authorization: `${token}` } }
        );
        setDocTypes(res.data.data || []);
      } catch (err) {
          toast.error("Error fetching document types",err);
      }
    };
    fetchDocTypes();
  }, []);

  // fetch document for view/edit
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/documents/GetById/${id}`,
          { headers: { Authorization: `${token}` } }
        );

        const doc = response.data.data;
        setFormData({
          title: doc.title || "",
          documentType: doc.documentType?._id || "",
          documnetBrief: doc.documnetBrief || doc.description || "",
          documentURL: doc.documentURL || "",
          documentUpload: doc.documentUpload || "",
        });
      } catch (error) {
        toast.error("Error fetching document:", error);
        toast.error("Error loading document data");
      } finally {
        setLoading(false);
      }
    };

    if ((isViewMode || isEditMode) && id) fetchDocument();
  }, [id, isViewMode, isEditMode]);

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    if (isViewMode) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("images", file);

      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/upload/image`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedPath = res.data?.data?.[0] || "";

      setFormData((prev) => ({
        ...prev,
        documentUpload: uploadedPath,
      }));
    } catch (error) {
      toast.error("File upload error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    try {
      const token = localStorage.getItem("token");

      if (isEditMode) {
        // update API
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/documents/update/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("Document updated successfully!");
      } else {
        // add API
        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/documents/create`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("Document created successfully!");
      }

      setTimeout(() => navigate("/document-listing"), 1200);
    } catch (error) {
       toast.error(error.response?.data?.message || "All fields are required");
    }
  };

  if (loading) return <p>Loading document data...</p>;

  return (
    <div>
      <Card
        title={
          isViewMode
            ? "View Document"
            : isEditMode
            ? "Edit Document"
            : "Add Document"
        }
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={isViewMode}
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Type
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  disabled={isViewMode}
                >
                  <option value="">Select Type</option>
                  {docTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.documentType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Brief */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Brief
                </label>
                <textarea
                  name="documnetBrief"
                  value={formData.documnetBrief}
                  onChange={handleInputChange}
                  rows={5}
                  className={`border p-2 w-full rounded ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={isViewMode}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col justify-between space-y-6">
              {/* Document URL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document URL
                </label>
                <input
                  type="text"
                  name="documentURL"
                  value={formData.documentURL}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${
                    isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={isViewMode}
                />
              </div>

              {/* File Upload */}
              {!isViewMode && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Document
                  </label>
                  <Fileinput
                    name="fil"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />

                  {formData.documentUpload && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.documentUpload.split("\\").pop().split("/").pop()}
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  text="Cancel"
                  className="btn-light w-full md:w-1/2"
                  type="button"
                  onClick={() => navigate("/document-listing")}
                />
                {!isViewMode && (
                  <Button
                    text={isEditMode ? "Update Doc" : "Add Doc"}
                    className="btn-primary w-full md:w-1/2"
                    type="submit"
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddDocumentPage;
