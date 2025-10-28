import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";

const AddDocType = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "create"; // create | edit | view

  const [formData, setFormData] = useState({
    documentType: "",
    documentAbbreviation: "",
    description: "",
  });

  //  If edit/view → fetch doc type by id
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && id) {
      const fetchDocType = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_APP_BASE_URL}/document-types/Doc-type/${id}`,
            { headers: { Authorization: `${token}` } }
          );

          const docType = res.data?.data;
          if (docType) {
            setFormData({
              documentType: docType.documentType || "",
              documentAbbreviation: docType.documentAbbreviation || "",
              description: docType.description || "",
            });
          }
        } catch (err) {
          toast.error("Error fetching doc type:", err);
        }
      };

      fetchDocType();
    }
  }, [id, mode]);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (mode === "create") {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/document-types/Doc-type`,
          formData,
          { headers: { Authorization: `${token}` } }
        );
      } else if (mode === "edit") {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/document-types/update/${id}`,
          formData,
          { headers: { Authorization: `${token}` } }
        );
         toast.success("Doc Type updated successfully!");
      }
      navigate("/doc-type-listing");
    } catch (err) {
       toast.error(error.response?.data?.message || "All fields are required");
    }
  };

  return (
    <div >
        <Card
        title={
          mode === "view"
          ? "View Document Type"
          : mode === "edit"
            ? "Edit Document Type"
            : "Add Document Type"
        }
      >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium">Document Type</label>
          <input
            type="text"
            name="documentType"
            disabled={mode === "view"}
            value={formData.documentType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Abbreviation */}
        <div>
          <label className="block text-sm font-medium">
            Document Abbreviation
          </label>
          <input
            type="text"
            name="documentAbbreviation"
            disabled={mode === "view"}
            value={formData.documentAbbreviation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            disabled={mode === "view"}
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
          />
        </div>
       
        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            text={mode === "view"?  "Back" : "Cancel"}
            className={mode === "view"?  "btn-primary" : "btn-light"}
            type="button"
            onClick={() => navigate("/doc-type-listing")}
          />
          {mode !== "view" && (
            <Button
              text={mode === "edit"? "Update Doc Type" : "Add Doc Type"}
              className="btn-primary "
              type="submit"
            />
          )}
        </div>
      </form>
      </Card>
    </div>
  );
};

export default AddDocType;
