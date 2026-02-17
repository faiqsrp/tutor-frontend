
import React, { useRef, useEffect, useState } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import useMenus from "@/hooks/useMenu"; 
import { useSelector } from "react-redux";

const Sidebar = () => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);

  // Get filtered menus based on user role
  const menus = useMenus();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current?.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    const node = scrollableNodeRef.current;
    node?.addEventListener("scroll", handleScroll);

    return () => {
      node?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [collapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);
  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800
        ${collapsed ? "w-[72px] close_sidebar" : "w-[248px]"}
        ${menuHover ? "sidebar-hovered" : ""}
        ${
          skin === "bordered"
            ? "border-r border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }`}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
      >
        <SidebarLogo menuHover={menuHover} />

        <div
          className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        <SimpleBar
          className={`sidebar-menu px-4 mt-8 h-[calc(100%-80px)]`}
        >
          {/* Dynamic menus via hook */}
          <Navmenu menus={menus} />
          
          {/* Show user role indicator for admin */}
          {user?.type === "admin" && (
            <div className="mt-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Admin Access
              </p>
              <p className="text-xs text-purple-500 dark:text-purple-500 mt-1">
                {user.email}
              </p>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;

