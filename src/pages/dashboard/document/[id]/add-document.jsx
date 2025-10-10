import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import Fileinput from "@/components/ui/Fileinput";
import { toast } from "react-toastify";
import Select from "@/components/ui/Select";

const AddDocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const mode = location.state?.mode || "add"; // add | view | edit
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    title: "",
    documentType: "",
    documnetBrief: "",
    documentURL: "",
    documentUpload: "",
    documentPage: "NA",
  });

  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(isViewMode || isEditMode);

  // fetch document types
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/document-types/GetAll`,
          { headers: { Authorization: `${token}` } }
        );
        setDocTypes(res.data.data || []);
      } catch (err) {
        toast.error("Error fetching document types", err);
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
          `${import.meta.env.VITE_APP_BASE_URL}/documents/GetById/${id}`,
          { headers: { Authorization: `${token}` } }
        );

        const doc = response.data.data;
        setFormData({
          title: doc.title || "",
          documentType: doc.documentType?._id || "",
          documnetBrief: doc.documnetBrief || doc.description || "",
          documentURL: doc.documentURL || "",
          documentUpload: doc.documentUpload || "",
          documentPage: doc.documentPage || "NA",
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
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (e) => {
    if (isViewMode) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("images", file);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/upload/image`,
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

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.documentType.trim()) newErrors.documentType = "Document type is required";
    if (!formData.documnetBrief.trim()) newErrors.documnetBrief = "Document brief is required";
    if (!formData.documentURL.trim()) newErrors.documentURL = "Document URL is required";
    if (!formData.documentUpload.trim()) newErrors.documentUpload = "Please upload a document";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/documents/update/${id}`,
          formData,
          { headers: { "Content-Type": "application/json", Authorization: `${token}` } }
        );
        toast.success("Document updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/documents/create`,
          formData,
          { headers: { "Content-Type": "application/json", Authorization: `${token}` } }
        );
        toast.success("Document created successfully!");
      }

      setTimeout(() => navigate("/document-listing"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
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
          <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <Select
                name="documentType"
                value={docTypes
                  .map(type => ({ value: type._id, label: type.documentType }))
                  .find(option => option.value === formData.documentType) || null}
                onChange={(selectedOption) =>
                  setFormData(prev => ({ ...prev, documentType: selectedOption?.value || "" }))
                }
                options={docTypes.map(type => ({ value: type._id, label: type.documentType }))}
                isDisabled={isViewMode}
                placeholder="Select Type"
              />
              {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>}
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
                className={`border p-2 w-full h-10 rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.documnetBrief && <p className="text-red-500 text-sm mt-1">{errors.documnetBrief}</p>}
            </div>

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
                className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                readOnly={isViewMode}
              />
              {errors.documentURL && <p className="text-red-500 text-sm mt-1">{errors.documentURL}</p>}
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
                {errors.documentUpload && <p className="text-red-500 text-sm mt-1">{errors.documentUpload}</p>}
              </div>
            )}

            {/* Select Paper */}
            <div>
              <label className="block text-sm font-medium mb-1">Select Paper</label>
              <Select
                name="documentPage"
                value={[
                  { value: "NA", label: "NA" },
                  { value: "Page1", label: "Paper 1" },
                  { value: "Page2", label: "Paper 2" }
                ].find(option => option.value === formData.documentPage)}
                onChange={(selectedOption) =>
                  setFormData(prev => ({ ...prev, documentPage: selectedOption?.value || "NA" }))
                }
                options={[
                  { value: "NA", label: "NA" },
                  { value: "Page1", label: "Paper 1" },
                  { value: "Page2", label: "Paper 2" }
                ]}
                isDisabled={isViewMode}
                placeholder="Select Paper"
              />
              {errors.documentPage && <p className="text-red-500 text-sm mt-1">{errors.documentPage}</p>}
            </div>

          </div>
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text="Cancel"
              className="btn-light "
              type="button"
              onClick={() => navigate("/document-listing")}
            />
            {!isViewMode && (
              <Button
                text={isEditMode ? "Update Doc" : "Add Doc"}
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

export default AddDocumentPage;
