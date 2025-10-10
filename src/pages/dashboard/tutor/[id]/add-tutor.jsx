import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { isValidEmail } from "@/constant/validation";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";

const AddTutor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = location.state?.mode || "create"; // create | edit | view
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    tenantId: "",
  });

  const [tenants, setTenants] = useState([]);
  const [tenantName, setTenantName] = useState("");

  //  Fetch tenants list
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants`,
          { headers: { Authorization: `${token}` } }
        );
        setTenants(res.data?.data || []);
      } catch (err) {
        toast.error("Error fetching tenants:", err);
      }
    };
    fetchTenants();
  }, []);

  //  If edit or view , fetch tutor by id
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && id) {
      const fetchTutor = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_APP_BASE_URL}/user/user/${id}`,
            { headers: { Authorization: `${token}` } }
          );

          const tutor = res.data?.data;
          if (tutor) {
            setFormData({
              username: tutor.username || "",
              name: tutor.name || "",
              email: tutor.email || "",
              password: "",
              tenantId: tutor.tenantId?._id || tutor.tenantId || "",
            });
            setTenantName(tutor.tenantId?.name || "");
          }
        } catch (err) {
          toast.error("Error fetching tutor:", err);
        }
      };

      fetchTutor();
    }
  }, [id, mode]);

  //  Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    //validation
    if (formData.email.length > 0 && !isValidEmail(formData.email)) {
      toast.error("Invalid email address");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // get logged in user

      if (mode === "create") {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/user/tutor`,
          { ...formData, createdBy: user?.name },
          { headers: { Authorization: `${token}` } }
        );
        toast.success("Tutor Added Successfully");
      } else if (mode === "edit") {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/user/admin-update/${id}`,
          { ...formData},
          { headers: { Authorization: `${token}` } }
        );
      }
      toast.success("Tutor Update Successfully");
      navigate("/tutor-listing");
    } catch (err) {
      toast.error(err.response?.data?.message || "All fields are required");

    }

  };

  return (
    <div >
      <Card
        title={
          mode === "view"
            ? "View Tutor"
            : mode === "edit"
              ? "Edit Tutor"
              : "Add Tutor"
        }
      >
        <form onSubmit={handleSubmit} >
          {/* Username */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                disabled={mode === "view"}
                value={formData.username}
                onChange={handleChange}
                className="w-full border p-2 rounded"

              />
            </div>
            {/* Password (only in create mode) */}
            {mode === "create" && (
              <div className="relative">
                <label className="block text-sm font-medium">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 rounded pr-10"
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <Icon icon="heroicons:eye-slash" className="w-5 h-5" />
                  ) : (
                    <Icon icon="heroicons:eye" className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                disabled={mode === "view" || mode === "edit"}
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                disabled={mode === "view"}
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Tenant */}
            <div>
              <label className="block text-sm font-medium">Tenant</label>
              {mode === "view" ? (
                <input
                  type="text"
                  value={tenantName}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100"
                />
              ) : (
                <select
                  name="tenantId"
                  disabled={mode === "view"}
                  value={formData.tenantId}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
           {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text="Cancel"
              className="btn-light "
              type="button"
              onClick={() => navigate("/tutor-listing")}
            />
            {mode !== "view" && (
              <Button
                text={mode === "edit" ? "Update" : "Add Tutor"}
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

export default AddTutor;
