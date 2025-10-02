import { useState } from "react";

function PasswordInput({ formData, handleChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Password</label>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="w-full border p-2 rounded pr-10"
      />

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

export default PasswordInput;
