import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const getIconColor = (path) => {
    return location.pathname === path ? "text-red-400" : "text-gray-400";
  };

  return (
    <nav className="absolute bottom-10 left-0 w-full h-[120px] border-t border-gray-300 bg-white z-50">
      <div className="h-full flex items-center justify-around pb-2">
        {/* 왼쪽 버튼 (mypage2) */}
        <Link to="/mypage2" className="p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-8 h-8 ${getIconColor("/mypage2")}`}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </Link>

        {/* 오른쪽 버튼 (fall_log) */}
        <Link to="/falllog" className="p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-8 h-8 ${getIconColor("/falllog")}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <polyline points="21 12 16 12 12 17 8 12 3 12"></polyline>
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
