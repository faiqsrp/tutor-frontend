import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import Social from "./common/social";
import useDarkMode from "@/hooks/useDarkMode";

// image import
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.png";
import bgImage from "@/assets/images/all-img/bg1.jpg";

const Login = () => {
  const [isDark] = useDarkMode();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Centered Login Box */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-800/90 rounded-2xl shadow-lg p-6 sm:p-8 backdrop-blur-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src={isDark ? LogoWhite : Logo}
              alt="Logo"
              className="mx-auto w-28 sm:w-32"
            />
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h4 className="text-lg sm:text-xl font-semibold">Sign in</h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Sign in to your account to start using Dashcode
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-600" />
          </div>
          {/* <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/90 dark:bg-slate-800/90 text-slate-500">
              Or continue with
            </span>
          </div> */}
        </div>

        {/* Social Buttons */}
        {/* <div className="max-w-[242px] mx-auto w-full">
          <Social />
        </div> */}

        {/* Signup Link */}
        <div className="mt-8 text-center text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-slate-900 dark:text-white font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
