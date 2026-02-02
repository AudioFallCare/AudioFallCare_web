import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // useLocation 추가!

const BottomNav = () => {
  const location = useLocation(); // 현재 주소 ㅇㄷ?

  // 아이콘 color 전환
  const getIconColor = (path) => {
    return location.pathname === path ? 'text-red-400' : 'text-gray-400';
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 border-t border-gray-300 flex items-center justify-around pb-2 bg-white z-50">

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
          className={`w-8 h-8 ${getIconColor('/mypage2')}`}
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
          className={`w-8 h-8 ${getIconColor('/falllog')}`}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <polyline points="21 12 16 12 12 17 8 12 3 12"></polyline>
        </svg>
      </Link>
    </nav>
  );
};

export default BottomNav;