import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LOGO from "../../public/LOGO.png";
import EYESONME from "../../public/Eye.png";
import { login, registerRecorder } from "../apis/auth";

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

  const handleRegisterRecorder = async () => {
    if (!recorderCode.trim()) {
      alert("리코더 코드 입력칸이 비어있습니다");
      return;
    }

    try {
        const res = await registerRecorder(recorderCode.trim());

 const recorderId = res?.data?.id;  
   console.log("등록된 recorderId =", recorderId);

   if (recorderId) {
     localStorage.setItem("recorderId", recorderId);
   }
      alert("리코더 코드 등록 완료");
      navigate("/mypage2"); 
    } catch (e) {
      console.error(e);
      alert("리코더 코드 등록 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8 text-neutral-900 font-pretendard">
      <div className="w-full max-w-md bg-white rounded-3xl px-8 py-10 sm:px-9">

        <div className="text-center mb-7">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img src={LOGO} alt="logo" className="h-20 w-20 object-contain" />
          </div>

          <h1 className="text-[30px] font-[700] tracking-tight leading-none">
            로그인
          </h1>
          <p className="mt-3 text-[15px] font-[500] text-teal-400">
            실시간 낙상 감지 알리미
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full h-14 px-5 rounded-2xl border border-gray-300"
          />

          <div className="relative mt-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-5 pr-14 rounded-2xl border border-gray-300"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10"
            >
              <img src={EYESONME} alt="" className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 w-full h-14 rounded-2xl bg-black text-white font-bold"
          >
            로그인
          </button>
        </form>

        <button
          className="mt-5 mx-auto block w-fit text-[13px] font-bold text-gray-300 underline"
          type="button"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </button>

        <div className="mt-11 flex items-center gap-3">
          <input
            type="text"
            placeholder="리코더 코드 입력"
            value={recorderCode}
            onChange={(e) => setRecorderCode(e.target.value)}
            className="min-w-0 flex-1 h-12 px-5 rounded-2xl border border-gray-300"
          />
          <button
            type="button"
            className="h-12 min-w-[72px] px-5 rounded-2xl bg-black text-white font-[600]"
            onClick={handleRegisterRecorder}   
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
