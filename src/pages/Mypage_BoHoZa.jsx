import React from 'react';

const Mypage_BoHoZa = () => {
  const userData = {
    username: "고앵이",
    email: "meow@email.com",
    recorderCode: "25252"
  };

  return (
    <div className="fixed inset-0 w-full bg-white flex flex-col">

        {/* Header */}
        <header className="relative flex justify-center items-center py-5 border-b-2 border-black bg-white z-10">
          <h1 className="text-xl font-bold text-black">마이페이지</h1>
        </header>

        {/* 리코더 코드, email */}
        <main className="flex-1 px-6 pt-8 flex flex-col pb-24 overflow-y-auto">
          
          <div className="mb-1">
            <span className="text-lg font-bold text-black block">
              {userData.username}님의 리코더 코드는
            </span>
          </div>

          <div className="mb-4">
            <span className="text-sm text-gray-400">
              {userData.email}
            </span>
          </div>

          <div className="mb-2">
            <span className="text-4xl font-bold text-black mr-2">
              {userData.recorderCode}
            </span>
            <span className="text-xl font-normal text-black">
              입니다
            </span>
          </div>

          <div>
            <span className="text-sm text-gray-400">
              해당 코드를 전달해주세요
            </span>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="mt-auto pt-10 text-center">
            <button className="text-gray-300 underline text-sm hover:text-gray-500 transition-colors">
              로그아웃
            </button>
          </div>
        </main>
    </div>
  );
};

export default Mypage_BoHoZa;