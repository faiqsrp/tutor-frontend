import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";

import MainLogo from "@/assets/images/logo/logo.svg";
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import MobileLogo from "@/assets/images/logo/logo.png";
import MobileLogoWhite from "@/assets/images/logo/logo.png";
const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="/dashboard">
        {width >= breakpoints.xl ? (
          <img src={isDark ? LogoWhite : MainLogo} alt=""  className="w-40 h-20"/>
        ) : (
          <img src={isDark ? MobileLogoWhite : MobileLogo} alt="" className="w-40 h-20"/>
        )}
      </Link>
    </div>
  );
};

export default Logo;
