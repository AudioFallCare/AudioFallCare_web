import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LOGO from "../../public/LOGO.png";
import EYESONME from "../../public/Eye.png";
import { login } from "../apis/auth";
import { registerRecorder } from "../apis/auth";

const Login = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recorderCode, setRecorderCode] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!userId || !password) {
    alert("아이디와 비밀번호를 입력해주세요");
    return;
  }

  try {
    const data = await login(userId, password);

    console.log("로그인 성공", data);


    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    // 🔹 로그인 성공 후 이동 -> 현재 / 추후 mainpage로 바꿔야됨
    // 네~ 해드렸습니다~
    navigate("/mypage1"); 

  } catch (err) {
    console.error("로그인 실패", err);

    if (err.response?.status === 401) {
      alert("아이디 또는 비밀번호가 틀렸습니다");
    } else {
      alert("로그인 중 오류가 발생했습니다");
    }
  }
};

// (GET : 연결된 리코더 목록 조회) 호출
const handleRegisterRecorder = async () => {
  if (!recorderCode.trim()) {
    alert("리코더 코드 입력칸이 비어있습니다");
    return;
  }

  try {
    const res = await registerRecorder(recorderCode.trim());
    alert("리코더 코드 등록완");
  } catch (e) {
    alert("리코더 코드 등록 실패");
  }
};

  return (
    // pretendard 폰트 추가
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8 text-neutral-900 font-pretendard">
      <div className="w-full max-w-md bg-white rounded-3xl px-8 py-10 sm:px-9">


      
        {/* 로고, "로그인", "실시간 낙상 감지 알리미" */}
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img
              src={LOGO}
              alt="logo"
              className="h-20 w-20 object-contain"
            />
          </div>

          <h1 className="text-[30px] font-[700] tracking-tight leading-none cursor-default">로그인</h1>
          <p className="mt-3 text-[15px] font-[500] text-teal-400 cursor-default">실시간 낙상 감지 알리미</p>
        </div>


        {/* 아이디, 비번 input */}
        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 bg-white text-[16px] font-medium text-neutral-700 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/60"
          />

          <div className="relative mt-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-5 pr-14 rounded-2xl border border-gray-300 bg-white text-[16px] font-medium text-neutral-700 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/60"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-[0.98]"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              <img src={EYESONME} alt="" className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 w-full h-14 rounded-2xl bg-black text-white text-[16px] font-bold hover:bg-neutral-900 active:translate-y-[1px] cursor-pointer"
          >
            로그인
          </button>
        </form>

        <button
          className="mt-5 mx-auto block w-fit text-[13px] font-bold text-gray-300 underline underline-offset-[6px] hover:text-gray-500 transition-colors duration-300 cursor-pointer"
          type="button"
          onClick = {() => navigate("/signup")}
        >
          회원가입
        </button>

        <div className="mt-11 flex items-center gap-3">
          <input
            type="text"
            placeholder="리코더 코드 입력"
            value={recorderCode}
            onChange={(e) => setRecorderCode(e.target.value)}
            className="min-w-0 flex-1 h-12 px-5 rounded-2xl border border-gray-300 bg-white text-[15px] font-medium text-neutral-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/60"
          />
          <button
            type="button"
            className="h-12 min-w-[72px] px-5 rounded-2xl bg-black text-white font-[600] hover:bg-neutral-900 active:translate-y-[1px] cursor-pointer"
            onClick={() => handleRegisterRecorder }   // 리코더 코드 등록
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;