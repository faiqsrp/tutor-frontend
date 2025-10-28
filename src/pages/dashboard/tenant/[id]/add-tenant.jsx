import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { isValidEmail, isValidPhone } from "@/constant/validation";

const AddTenantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "add"; // add | view | edit
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(isViewMode || isEditMode);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants/${id}`,
          { headers: { Authorization: `${token}` } }
        );
        const tenant = response.data.data;
        setFormData({
          name: tenant.name || "",
          email: tenant.email || "",
          phone: tenant.phone || "",
          address: tenant.address || "",
          notes: tenant.notes || "",
        });
      } catch (error) {
        toast.error("Error fetching tenant:", error);
      } finally {
        setLoading(false);
      }
    };

    if ((isViewMode || isEditMode) && id) fetchTenant();
  }, [id, isViewMode, isEditMode]);

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    if (formData.email.length > 0 && !isValidEmail(formData.email)) {
      toast.error("Invalid email address");
      return;
    }
    if (formData.phone.length > 0 && !isValidPhone(formData.phone)) {
      toast.error("Phone must be 11 digits only");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // get logged in user

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants/${id}`,
          { ...formData, editedBy: user?.name },
          { headers: { "Content-Type": "application/json", Authorization: `${token}` } }
        );
        toast.success("Tenant updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants/`,
          { ...formData, createdBy: user?.name },
          { headers: { "Content-Type": "application/json", Authorization: `${token}` } }
        );
        toast.success("Tenant created successfully!");
      }

      setTimeout(() => navigate("/tenant-listing"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "All fields are required");
    }
  };

  if (loading) return <p>Loading tenant data...</p>;

  return (
    <div>
      <Card
        title={
          isViewMode ? "View Tenant" : isEditMode ? "Edit Tenant" : "Add Tenant"
        }
      >
        <form onSubmit={handleSubmit} className="p-4">
          {/* Grid Layout */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${isViewMode || isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode || isEditMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 ">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={1}
                  className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  readOnly={isViewMode}
                />
              </div>
          </div>

          {/* Buttons outside grid */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text={isViewMode ? "Back" : "Cancel"}
              className={isViewMode ? "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/tenant-listing")}
            />
            {!isViewMode && (
              <Button
                text={isEditMode ? "Update" : "Add Tenant"}
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

export default AddTenantPage;
