import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";

import UserAvatar from "@/assets/images/all-img/user.png";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get logged-in user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(logOut());
    navigate("/");
  };

  const profileLabel = () => {
    return (
      <div className="flex items-center">
        <div className="flex-1 ltr:mr-[10px] rtl:ml-[10px]">
          <div className="lg:h-8 lg:w-8 h-7 w-7 rounded-full">
            <img
              src={UserAvatar}
              alt="User Avatar"
              className="block w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex-none relative bg-primary-300 rounded-full p-1 lg:flex hidden items-center">
          {/* Username badge */}
          <span
            className="inline-block bg-primary-700 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm z-50 relative"
          >
            {user?.name || "Guest"}
          </span>

          {/* Chevron / dropdown trigger */}
          <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px] mr-2">
            <Icon icon="heroicons-outline:chevron-down" />
          </span>
        </div>

      </div>
    );
  };

  const ProfileMenu = [
    { label: "Profile", icon: "heroicons-outline:user", action: () => navigate("/profile") },
    // { label: "Chat", icon: "heroicons-outline:chat", action: () => navigate("/chat") },
    // { label: "Email", icon: "heroicons-outline:mail", action: () => navigate("/email") },
    // { label: "Todo", icon: "heroicons-outline:clipboard-check", action: () => navigate("/todo") },
    // { label: "Settings", icon: "heroicons-outline:cog", action: () => navigate("/settings") },
    // { label: "Price", icon: "heroicons-outline:credit-card", action: () => navigate("/pricing") },
    // { label: "Faq", icon: "heroicons-outline:information-circle", action: () => navigate("/faq") },
    { label: "Logout", icon: "heroicons-outline:login", action: () => handleLogout() },
  ];

  return (
    <Dropdown label={profileLabel()} classMenuItems="w-[180px] top-[62px]">
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={() => item.action()}
              className={`${active
                ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                : "text-slate-600 dark:text-slate-300"
                } block ${item.hasDivider
                  ? "border-t border-slate-100 dark:border-slate-700"
                  : ""
                }`}
            >
              <div className="block cursor-pointer px-4 py-2">
                <div className="flex items-center">
                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="block text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};

export default Profile;
