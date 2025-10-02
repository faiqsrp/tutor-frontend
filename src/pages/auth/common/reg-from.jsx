import React, { useState } from "react";
import { toast } from "react-toastify";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

const RegForm = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checked) {
      toast.error("You must accept Terms and Conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://api-tutor.srptechs.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful!");
      navigate("/"); // redirect to login after registration
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label>Name</label>
      <input
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your name"
        className="form-control h-[48px] w-full px-3 border rounded mb-2"
      />

      <label>Email</label>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        className="form-control h-[48px] w-full px-3 border rounded mb-2"
      />

      <label>Password</label>
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        className="form-control h-[48px] w-full px-3 border rounded mb-2"
      />

      <Checkbox
        label="I accept Terms and Conditions & Privacy Policy"
        value={checked}
        onChange={() => setChecked(!checked)}
      />

      <Button
        type="submit"
        text={loading ? "Registering..." : "Create Account"}
        className="btn btn-dark block w-full text-center"
        isLoading={loading}
      />
    </form>
  );
};

export default RegForm;
