import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import useDarkMode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";

import MobileLogo from "@/assets/images/logo/logo.png";
import MobileLogoWhite from "@/assets/images/logo/logo.png";

const SidebarLogo = ({ menuHover }) => {
  const [isDark] = useDarkMode();
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.type) {
        navigate("/login");
        return;
      }

      switch (user.type) {
        case "admin":
          navigate("/tenant-listing");
          break;
        case "tutor":
          navigate("/student-listing");
          break;
        case "student":
          navigate("/studentdashboard");
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (err) {
      console.error("Error navigating by role:", err);
      navigate("/login");
    }
  };

  return (
    <div
      className={`logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] py-6 px-4 
      ${menuHover ? "logo-hovered" : ""}
      ${
        skin === "bordered"
          ? "border-b border-r-0 border-slate-200 dark:border-slate-700"
          : "border-none"
      }
      `}
    >
      <div
        onClick={handleLogoClick}
        className="flex justify-center items-center w-full cursor-pointer"
      >
        <img
          src={!isDark && !isSemiDark ? MobileLogo : MobileLogoWhite}
          alt="logo"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "w-[80%]" : "w-full"
          }`}
        />
      </div>

      {(!collapsed || menuHover) && (
        <div
          onClick={() => setMenuCollapsed(!collapsed)}
          className={`h-4 w-4 border-[1.5px] border-slate-900 dark:border-slate-700 rounded-full transition-all duration-150
          ${
            collapsed
              ? ""
              : "ring-2 ring-inset ring-offset-4 ring-black-900 dark:ring-slate-400 bg-slate-900 dark:bg-slate-400 dark:ring-offset-slate-700"
          }
          `}
        ></div>
      )}
    </div>
  );
};

export default SidebarLogo;
