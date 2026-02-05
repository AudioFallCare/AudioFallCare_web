import React from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./component/Bottom_Nav";

const Layout = ({ children }) => {
  const location = useLocation();
  const showNavList = ["/mypage1", "/mypage2", "/falllog"];
  const showNav = showNavList.includes(location.pathname);

  return (
    <div className="w-full h-[100dvh] bg-gray-100 flex justify-center overflow-hidden">
      {/* 앱 프레임 */}
      <div className="relative w-full max-w-[430px] h-full bg-white flex flex-col">
        {/* 실제 페이지 내용 */}
        <div className="flex-1 overflow-y-auto pb-[84px]">
          {children}
        </div>

        {/* BottomNav */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;
