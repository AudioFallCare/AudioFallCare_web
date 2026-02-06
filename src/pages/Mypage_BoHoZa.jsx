import React, { useEffect, useState } from "react";
import api from "../apis/api";
import { useNavigate } from "react-router-dom";
import { logout } from "../apis/auth";

const Mypage_BoHoZa = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recorders, setRecorders] = useState([]);
  const [recorder, setRecorder] = useState(null);
  const [recorderCode, setRecorderCode] = useState("");
  const [username, setUsername] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recentFallCount, setRecentFallCount] = useState(0);

  const fetchRecorders = async () => {
    const res = await api.get("/recorders");
    return res?.data?.data || [];
  };

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const list = await fetchRecorders();
        setRecorders(list);

        if (list.length > 0) {
          const savedId = localStorage.getItem("selectedRecorderId");

          let selected = null;

          if (savedId) {
            selected = list.find((r) => String(r.id) === savedId);
          }

          if (!selected) {
            selected = list.find((r) => r.status === "CONNECTED") || list[0];
          }

          console.log("✅ 최종 선택된 리코더 =", selected);

          setRecorder(selected);
          setDeviceName(selected?.deviceName || "");

          const userRes = await api.get(`/recorders/${selected.id}/user`);
          setUsername(userRes?.data?.data?.username || "");
        }

        const codeRes = await api.get("/code");
        setRecorderCode(codeRes?.data?.data?.code || "");

        const statsRes = await api.get("/histories/stats");
        setRecentFallCount(statsRes?.data?.data?.recentWeekCount || 0);
      } catch (e) {
        console.error("마이페이지 데이터 조회 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  const handleUpdateDeviceName = async () => {
    if (!recorder) return;

    try {
      await api.patch(`/recorders/${recorder.id}`, { deviceName });

      localStorage.setItem("selectedRecorderId", recorder.id);

      const list = await fetchRecorders();
      const updated = list.find((r) => r.id === recorder.id);

      setRecorder(updated);
      setDeviceName(updated?.deviceName || "");
      setIsEditing(false);

      alert("리코더 이름이 수정되었습니다.");
    } catch (e) {
      console.error("리코더 이름 수정 실패", e);
      alert("리코더 이름 수정 실패");
    }
  };

  const handleLogout = async () => {
    const deviceInfo = localStorage.getItem("deviceInfo");
    await logout(deviceInfo);
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  if (loading) return <div>로딩중...</div>;
  if (!recorder) return <div>연결된 리코더 없음</div>;

  return (
    <div className="w-full px-6 pt-6 flex flex-col min-h-full">
      <div className="border-b-2 border-black py-4 text-center font-bold">
        마이페이지
      </div>

      <p className="mt-6 font-semibold">
        {username}님의 지인이 설정되었습니다.
      </p>

      <p className="text-sm text-gray-400">
        {recorder.deviceName
          ? `‘${recorder.deviceName}’의 알림이 옵니다.`
          : "리코더 주소 기준으로 알림이 옵니다."}
      </p>

      <div className="flex gap-2 mt-3">
        {isEditing ? (
          <>
            <input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="border px-2 py-1 flex-1"
            />
            <button onClick={handleUpdateDeviceName}>완료</button>
          </>
        ) : (
          <>
            <input
              disabled
              value={recorder.deviceName || recorderCode}
              className="border px-2 py-1 flex-1 bg-gray-100"
            />
            <button onClick={() => setIsEditing(true)}>수정</button>
          </>
        )}
      </div>

      <p className="mt-3 font-bold">리코더 주소 : {recorderCode}</p>
      <div className="mt-6">최근 감지된 낙상 {recentFallCount}건</div>

      <button onClick={handleLogout} className="mt-auto underline text-sm">
        로그아웃
      </button>
    </div>
  );
};

export default Mypage_BoHoZa;
