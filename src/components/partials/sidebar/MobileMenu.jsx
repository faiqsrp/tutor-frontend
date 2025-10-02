import React, { useRef, useEffect, useState } from "react";
import Navmenu from "./Navmenu";
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";
import useMenus from "@/hooks/useMenu"; // 

// images
import MobileLogo from "@/assets/images/logo/logo.png";
import MobileLogoWhite from "@/assets/images/logo/logo.png";
import svgRabitImage from "@/assets/images/svg/rabit.svg";

const MobileMenu = ({ className = "custom-class" }) => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);

  // ✅ Get menus from hook
  const menus = useMenus();

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

  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  return (
    <div
      className={`${className} fixed top-0 bg-white dark:bg-slate-800 shadow-lg h-full w-[248px]`}
    >
      {/* Logo + Close button */}
      <div className="logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] h-[85px] px-4">
        <Link to="/dashboard">
          <div className="flex items-center space-x-4">
            <div className="logo-icon">
              {!isDark && !isSemiDark ? (
                <img src={MobileLogo} alt="logo" className="w-40 h-20" />
              ) : (
                <img src={MobileLogoWhite} alt="logo" className="w-40 h-20" />
              )}
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="cursor-pointer text-slate-900 dark:text-white text-2xl"
        >
          <Icon icon="heroicons:x-mark" />
        </button>
      </div>

      {/* Scroll shadow */}
      <div
        className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
          scroll ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Sidebar content */}
      <SimpleBar
        className="sidebar-menu mt-8 px-4 h-[calc(100%-80px)]"
        scrollableNodeProps={{ ref: scrollableNodeRef }}
      >
        {/* ✅ Dynamic menus */}
        <Navmenu menus={menus} />

        {/* Upgrade box */}
        {/* <div className="bg-slate-900 mb-24 lg:mb-10 mt-24 p-4 relative text-center rounded-2xl text-white">
          <img
            src={svgRabitImage}
            alt="illustration"
            className="mx-auto relative -mt-[73px]"
          />
          <div className="max-w-[160px] mx-auto mt-6">
            <div className="widget-title">Unlimited Access</div>
            <div className="text-xs font-light">
              Upgrade your system to business plan
            </div>
          </div>
          <div className="mt-6">
            <button className="btn bg-white hover:bg-opacity-80 text-slate-900 btn-sm w-full block">
              Upgrade
            </button>
          </div>
        </div> */}
      </SimpleBar>
    </div>
  );
};

export default MobileMenu;
