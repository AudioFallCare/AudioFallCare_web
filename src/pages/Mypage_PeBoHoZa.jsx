import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, logout, getConnectionCode } from '../apis/auth';

const Mypage_PeBoHoZa = () => {

  // 알림 관련
  const [alerts, setAlerts] = useState([]);
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState(null);
  const normalizeAlerts = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    return [];
  };

  const alertsList = useMemo(() => alerts, [alerts]);
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsAlertsLoading(true);
        setAlertsError(null);

        const res = await getAlerts();
        const normalized = normalizeAlerts(res);
        setAlerts(normalized);
      } catch (e) {
        console.error('알림 목록 조회 실패 = ', e);
        setAlertsError(e);
        setAlerts([]);
      } finally {
        setIsAlertsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // 리코더 코드 조회
  const [userData, setUserData] = useState({
    username: "고앵이",
    email: "meow@email.com",
    recorderAddress: "",
  });

  useEffect(() => {
    const fetchConnectionCode = async () => {
      try {
        const res = await getConnectionCode();
        const code = res?.data?.code ?? res?.data?.data?.code ?? res?.code ?? "";

        setUserData((prev) => ({
          ...prev,
          recorderAddress: code,
        }));
      } catch (e) {
        console.error('연결 코드 조회 실패 = ', e);
      }
    };

    fetchConnectionCode();
  }, []);

  // 로그아웃
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const deviceInfo = localStorage.getItem('deviceInfo');
      if (!deviceInfo) {
        console.warn('deviceInfo가 로컬스토리지에 없습니다.');
      }

      await logout(deviceInfo);

      localStorage.removeItem('accessToken');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패 = ', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 w-full bg-white flex flex-col">

      {/* Header */}
      <header className="relative flex justify-center items-center py-5 border-b-2 border-black bg-white z-10">
        <h1 className="text-xl font-bold text-black">마이페이지</h1>
      </header>


      <main className="flex-1 px-6 pt-6 flex flex-col pb-24 overflow-y-auto">

        {/* "지인이 설정되었습니다", "알림이 옵니다" */}
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-bold text-black leading-tight">
            사용자의의 지인이 설정되었습니다.
          </h2>
          {/* <p className="text-sm text-gray-400">
            {userData.email}
          </p>
          <h3 className="text-lg font-bold text-black mt-4 leading-tight">
            리코더코드 or 수정된 이름의 알림이 옵니다.
          </h3> */}
        </div>

        {/* 리코더 코드 입력칸 */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="현재 리코더 코드를 지인의 이름으로 설정하세요!"
            className="w-full h-12 pl-4 pr-16 border border-gray-400 rounded-full text-xs placeholder-gray-400 focus:outline-none focus:border-red-400"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
            수정
          </button>
        </div>

        {/* 리코더 주소 */}
        <div className="mb-8">
          <span className="text-lg font-bold text-black">
            리코더 주소 : {userData.recorderAddress || "-"}
          </span>
        </div>


        {/* alert 동적 생성 */}
        <div className="space-y-6">
          {isAlertsLoading && (
            <div className="text-sm text-gray-400 text-center">알림 불러오는 중...</div>
          )}

          {!isAlertsLoading && alertsError && (
            <div className="text-sm text-red-400 text-center">알림 조회 실패.</div>
          )}

          {!isAlertsLoading && !alertsError && (alertsList || []).length === 0 && (
            <div className="text-sm text-gray-400 text-center">알림 없음.</div>
          )}

          {(alertsList || []).map((item) => {
            const message = item?.message ?? item?.content ?? '';
            const isRead = item?.isRead ?? true;

            return (
              <div
                key={item?.id ?? `${message}-${Math.random()}`}
                className="w-full bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-gray-100 p-5 flex items-center"
              >
                {/* 아이콘 박스 */}
                <div
                  className={`w-10 h-10 ${isRead ? 'bg-gray-50' : 'bg-red-50'
                    } rounded-lg flex items-center justify-center flex-shrink-0 mr-4`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className={`w-6 h-6 ${isRead ? 'text-gray-400' : 'text-red-400'}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </div>

                {/* 내용 */}
                <span className="text-gray-600 text-sm">{message}</span>
              </div>
            );
          })}
        </div>

        {/* 로그아웃 버튼 */}
        <div className="mt-auto pt-12 text-center">
          <button
            onClick={handleLogout}
            className="text-gray-300 underline text-sm hover:text-gray-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </main>
    </div>
  );
};

export default Mypage_PeBoHoZa;