import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apis/api";
import { logout } from "../apis/auth";

const Mypage_PeBoHoZa = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [guardianName, setGuardianName] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [connectionCode, setConnectionCode] = useState("");
  const [isPaired, setIsPaired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  // 레퍼런스
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchPairedGuardian = async () => {
      try {
        const recorderId = localStorage.getItem("recorderId");
        if (!recorderId) {
          setLoading(false);
          return;
        }

        const userRes = await api.get(`/recorders/${recorderId}/user`);
        // API 응답 구조에 맞게 수정 필요 (username, id, code가 다 있다고 가정)
        const { username, id, code } = userRes?.data?.data || {};

        if (username) {
          setGuardianName(username);
          if (id) setGuardianId(id);
          if (code) setConnectionCode(code);
          setIsPaired(true);
        }
      } catch (e) {
        console.error("보호자 정보 조회 실패 =", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPairedGuardian();

    return () => {
      stopStreaming();
    };
  }, []);

  const startStreaming = async () => {
    try {
      // 1. 마이크 권한 획득
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorderId = localStorage.getItem("recorderId");

      // 2. 웹소켓 연결
      const wsUrl = `wss://audiofallcare-ai-test.onrender.com/ws/audio/stream?code=${connectionCode}&guardianId=${guardianId}&recorderId=${recorderId}`;
      console.log("연결 시도 URL == ", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 3. 소켓 이벤트 핸들러
      ws.onopen = () => {
        console.log("✅ WebSocket 연결 성공!");
        setIsStreaming(true);

        // 오디오 포맷 설정
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        // 4. 3초마다 오디오 청크
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {

            console.log(" [전송] 오디오 청크 보냄 == ", event.data);

            ws.send(event.data);
          }
        };

        recorder.start(3000); // 3초마다 청크
      };

      // 5. 서버 응답
      ws.onmessage = (event) => {
        console.log(" [수신] 서버 응답 == ", event.data);
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket 오류 == ", error);
        alert("서버 연결 중 오류가 발생했습니다.");
        stopStreaming();
      };

      ws.onclose = () => {
        console.log("WebSocket 연결 종료");
        stopStreaming();
      };

    } catch (err) {
      console.error("마이크 권한 거부 또는 오류 =", err);
      alert("마이크 권한을 허용해야 서비스를 이용할 수 있습니다.");
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleToggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const handleLogout = async () => {
    try {
      stopStreaming();
      const deviceInfo = localStorage.getItem("deviceInfo");
      await logout(deviceInfo);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("recorderId");
      navigate("/");
    } catch (e) {
      alert("로그아웃 실패");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  if (!isPaired) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-400 mb-2">피보호자</p>
        <p>보호자와 연결되지 않았습니다.</p>
        <button onClick={() => navigate("/")}>돌아가기</button>
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
        {isStreaming ? "실시간 감지 중... (콘솔 확인)" : "버튼을 눌러 시작하세요"}
      </p>
      <button
        onClick={handleToggleStreaming}
        className={`mt-10 w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl transition-colors duration-300 ${isStreaming
          ? "border-green-500 bg-green-100 text-green-600 animate-pulse"
          : "border-red-400 bg-white text-black"
          }`}
      >
        {isStreaming ? "■" : "⏻"}
      </button>
    </div>
  );
};

export default Mypage_PeBoHoZa;