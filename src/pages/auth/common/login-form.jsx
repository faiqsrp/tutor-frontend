import React, { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const LoginForm = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const UserRole = Object.freeze({
    ADMIN: "admin",
    STUDENT: "student",
    TUTOR: "tutor",
  });


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Login response:", result);

      // Destructure properly
      const { data, message } = result;

      // Check API response
      if (!response.ok) throw new Error(message || "Login failed");
      if (!data.token) throw new Error("Invalid credentials");

      // Save token and user to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login Successful!");
      console.log("Stored user:", localStorage.getItem("user"));
      console.log("Token stored:", localStorage.getItem("token"));
      console.log("User stored:", localStorage.getItem("user"));
      // // Navigate after saving user
      // setTimeout(() => navigate("/dashboard"), 500);

      const userRole = data.user.type;

      switch (userRole) {
        case UserRole.ADMIN:
          navigate("/dashboard");
          break;
        case UserRole.STUDENT:
          navigate("/studentdashboard");
          break;
        case UserRole.TUTOR:
          navigate("/dashboard");
          break;
        default:
          throw new Error("Invalid role");
      }

    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="">Email</label>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        className="form-control h-[48px] w-full px-3 border rounded mb-4"
      />

      <label htmlFor="">password</label>
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        className="form-control h-[48px] w-full px-3 border rounded"
      />

      <div className="flex justify-between items-center">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Keep me signed in"
        />
        <Link
          to="/forgot-password"
          className="text-sm text-slate-800 dark:text-slate-400 font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        text={loading ? "Signing in..." : "Sign in"}
        className="btn btn-dark block w-full text-center"
        isLoading={loading}
      />
    </form>
  );
};

export default LoginForm;
