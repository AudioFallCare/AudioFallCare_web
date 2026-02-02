import React from "react"
import { useLocation } from "react-router-dom"
import BottomNav from "./component/Bottom_Nav"

const Layout = ({ children }) => {

  const location = useLocation();

  // bottom nav 바
  const showNavList = [
    '/mypage1', 
    '/mypage2', 
    '/falllog'
  ];
  const showNav = showNavList.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <main className="w-full max-w-[600px] bg-white min-h-screen px-4">
        {children}
        {showNav && <BottomNav />}
      </main>
    </div>
  )
}

export default Layout
