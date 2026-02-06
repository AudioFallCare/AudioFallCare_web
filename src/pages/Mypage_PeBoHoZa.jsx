import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apis/api";
import { logout } from "../apis/auth";

const Mypage_PeBoHoZa = () => {
  const navigate = useNavigate();

  const [guardianName, setGuardianName] = useState("");
  const [isPaired, setIsPaired] = useState(false);
  const [loading, setLoading] = useState(true);

  const requestMicPermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    alert("마이크 권한이 허용되었습니다.");
  } catch (err) {
    console.error("마이크 권한 거부 또는 오류 =", err);
    alert("마이크 권한을 허용해야 서비스 이용이 가능합니다.");
  }
};

  useEffect(() => {
    const fetchPairedGuardian = async () => {
      try {

        const recorderId = localStorage.getItem("recorderId");

        if (!recorderId) {
          setLoading(false);
          return;
        }

   
        const userRes = await api.get(`/recorders/${recorderId}/user`);
        const guardian = userRes?.data?.data?.username;

        if (guardian) {
          setGuardianName(guardian);
          setIsPaired(true);
        }
      } catch (e) {
        console.error("보호자 정보 조회 실패 =", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPairedGuardian();
  }, []);

  const handleLogout = async () => {
    try {
      const deviceInfo = localStorage.getItem("deviceInfo");
      await logout(deviceInfo);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("recorderId");  
      navigate("/");
    } catch (e) {
      alert("로그아웃 실패");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">연결 정보 불러오는 중...</p>
      </div>
    );
  }


  if (!isPaired) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-400 mb-2">피보호자</p>
        <p className="text-center text-sm text-gray-500">
          아직 보호자와 연결되지 않았습니다.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-8 text-gray-300 underline text-sm"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
    

      <h2 className="text-center font-bold text-lg leading-relaxed">
        {guardianName}님이 회원님의 <br />
        낙상 감지 알림을 받고있습니다.
      </h2>

      <p className="mt-3 text-xs text-gray-400">
        아래 버튼을 클릭하여 마이크 설정 권한을 허용해주세요
      </p>

     <button
  onClick={requestMicPermission}
  className="mt-10 w-24 h-24 rounded-full border-4 border-red-400 flex items-center justify-center text-2xl"
>
  ⏻
</button>

      
    </div>
  );
};

export default Mypage_PeBoHoZa;
