import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import BasicArea from "../chart/appex-chart/BasicArea";
import NoImage from "@/assets/images/all-img/404.svg";

const Profile = () => {
  const [user, setUser] = useState(null);

  //  Load user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="text-center text-gray-500 mt-10">Loading profile...</div>
    );
  }

  //  Build proper image URL or fallback
  const profileImage = user.image
    ? `${import.meta.env.VITE_APP_BASE_URL}/${user.image}`
    : NoImage;

  return (
    <div>
      <div className="space-y-5 profile-page">
        {/* Profile Header */}
        <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]">
          <div className="bg-primary-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg"></div>

          <div className="profile-box flex-none md:text-start text-center">
            <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
              {/* Profile Image */}
              <div className="flex-none">
                <div className="md:h-[186px] md:w-[186px] h-[140px] w-[140px] mx-auto mb-4 rounded-full ring-4 ring-slate-100 relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => (e.target.src = NoImage)} // fallback if broken
                  />
                  <Link
                    to="/edit-profile"
                    className="absolute right-2 h-8 w-8 bg-slate-50 text-slate-600 rounded-full shadow-sm flex flex-col items-center justify-center md:top-[140px] top-[100px]"
                  >
                    <Icon icon="heroicons:pencil-square" />
                  </Link>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]">
                  {user.name}
                </div>
                <div className="text-sm font-light text-slate-600 dark:text-slate-400 capitalize">
                  {user.type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-4 col-span-12 w-full">
            <Card title="User Info">
              <ul className="list space-y-8">
                {/* Username */}
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:user" />
                  </div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1">
                      USERNAME
                    </div>
                    <div className="text-base text-slate-600 dark:text-slate-50">
                      {user.username || "N/A"}
                    </div>
                  </div>
                </li>

                {/* Name */}
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:identification" />
                  </div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1">
                      NAME
                    </div>
                    <div className="text-base text-slate-600 dark:text-slate-50">
                      {user.name}
                    </div>
                  </div>
                </li>

                {/* Email */}
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:envelope" />
                  </div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1">
                      EMAIL
                    </div>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-base text-slate-600 dark:text-slate-50"
                    >
                      {user.email}
                    </a>
                  </div>
                </li>

                {/* Type */}
                <li className="flex space-x-3 rtl:space-x-reverse">
                  <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                    <Icon icon="heroicons:tag" />
                  </div>
                  <div className="flex-1">
                    <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1">
                      ROLE
                    </div>
                    <div className="text-base text-slate-600 dark:text-slate-50 capitalize">
                      {user.type}
                    </div>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-8 col-span-12">
            <Card title="User Overview">
              <BasicArea height={190} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
