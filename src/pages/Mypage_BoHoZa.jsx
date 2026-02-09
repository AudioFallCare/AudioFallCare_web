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
  const [alerts, setAlerts] = useState([]);

  const formatAlertTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
    } catch {
      return "";
    }
  };

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

          setRecorder(selected);
          setDeviceName(selected?.deviceName || "");

          const userRes = await api.get(`/recorders/${selected.id}/user`);
          setUsername(userRes?.data?.data?.username || "");
        }

        const codeRes = await api.get("/code");
        setRecorderCode(codeRes?.data?.data?.code || "");

        const statsRes = await api.get("/histories/stats");
        setRecentFallCount(statsRes?.data?.data?.recentWeekCount || 0);

        // 알림 목록 조회
        try {
          const alertRes = await getAlerts();
          const alertList = Array.isArray(alertRes?.data)
            ? alertRes.data
            : Array.isArray(alertRes?.data?.data)
              ? alertRes.data.data
              : [];

          setAlerts(alertList);
        } catch (err) {
          console.error("알림 목록 조회 실패", err);
          setAlerts([]);
        }
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

  if (recorders.length === 0 && recorderCode) {
    return (
      <div className="w-full px-6 pt-6 flex flex-col min-h-full">
        <div className="border-b-2 border-black py-4 text-center font-bold">
          마이페이지
        </div>

        <p className="mt-10 text-center font-semibold">
          사용자의 리코더 코드는
        </p>
        <p className="mt-2 text-center text-xl font-bold">
          {recorderCode}
        </p>

        <p className="mt-4 text-center text-gray-400 text-sm">
          해당 코드를 리코더에 입력해주세요.
        </p>

        {/* 알림 */}
        <div className="mt-10">
          <p className="font-bold mb-3">알림</p>

          <div className="space-y-6">
            {alerts.length === 0 ? (
              <div className="text-sm text-gray-400">표시할 알림이 없습니다.</div>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.id}
                  className="w-full bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-gray-100 p-5 flex items-center"
                >
                  {/* 박스 */}
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-6 h-6 text-red-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                  </div>

                  {/* 내용 */}
                  <span className="text-gray-600 text-sm">
                    {item.message || "알림"}
                    {item.createdAt ? (
                      <span className="ml-2 text-xs text-gray-400">
                        ({formatAlertTime(item.createdAt)})
                      </span>
                    ) : null}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }


  if (!recorder) {
    return <div>리코더 정보 불러오기 실패</div>;
  }

  const isCustomName =
    recorder.deviceName && recorder.deviceName !== recorderCode;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="border-b border-black py-4 text-center text-lg font-bold">
        마이페이지
      </div>

      <div className="px-6 pt-8 flex flex-col flex-1">
        <p className="font-semibold text-base">
          {username}님의 지인이 설정되었습니다.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          {isCustomName
            ? `‘${recorder.deviceName}’의 알림이 옵니다.`
            : "리코더코드 or 수정된 이름의 알림이 옵니다."}
        </p>

        <div className="flex items-center gap-2 mt-4">
          {isEditing ? (
            <>
              <input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleUpdateDeviceName}
                className="text-sm font-semibold"
              >
                완료
              </button>
            </>
          ) : (
            <>
              <input
                disabled
                value={isCustomName ? recorder.deviceName : recorderCode}
                className="flex-1 rounded-full border px-4 py-2 text-sm bg-gray-100 text-gray-700"
              />
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold"
              >
                수정
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-sm font-bold">
          리코더 주소 : {recorderCode}
        </p>

        <div className="mt-8 space-y-4">
          <div
            className="w-full rounded-xl shadow-md border p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition"
            onClick={() => navigate("/falllog")}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400 text-red-500 font-bold">
              i
            </div>
            <p className="text-sm">
              최근 감지된 낙상이 {recentFallCount}건 있습니다
            </p>
          </div>

          <div className="w-full rounded-xl shadow-md border p-4 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400 text-red-500 font-bold">
              i
            </div>
            <p className="text-sm">이번달 낙상횟수가 지난달보다 더 많습니다</p>
          </div>
        </div>

        {/* 알림 */}
        <div className="mt-6">
          <p className="font-bold mb-3">알림</p>

          <div className="space-y-6">
            {alerts.length === 0 ? (
              <div className="text-sm text-gray-400">표시할 알림이 없습니다.</div>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.id}
                  className="w-full bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-gray-100 p-5 flex items-center"
                >
                  {/* 박스 */}
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-6 h-6 text-red-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                  </div>

                  {/* 내용 */}
                  <span className="text-gray-600 text-sm">
                    {item.message || "알림"}
                    {item.createdAt ? (
                      <span className="ml-2 text-xs text-gray-400">
                        ({formatAlertTime(item.createdAt)})
                      </span>
                    ) : null}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-auto mb-6 text-gray-300 text-sm underline"
        >
          로그아웃
        </button>
      </div>

      <div className="border-t h-14 flex items-center justify-center gap-16 text-gray-400">
        <div className="text-red-500">🏠</div>
        <div>📊</div>
      </div>
    </div>
  );
};

export default Mypage_BoHoZa;
