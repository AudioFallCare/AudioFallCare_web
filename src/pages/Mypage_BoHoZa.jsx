import React, { useEffect, useRef, useState } from "react";
import api from "../apis/api";
import { useNavigate } from "react-router-dom";
import { getFallDiff } from "../apis/auth";

import {
  logout,
  getAlerts,
  markAlertAsRead,
  registerFcmToken,
  getOrCreateDeviceInfo,
} from "../apis/auth";

// Firebase (Web) - v9 modular
import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";


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
  const [fallDiff, setFallDiff] = useState(null);

  const messagingUnsubRef = useRef(null);
  const [pushPreview, setPushPreview] = useState(null); // 최근 수신(포그라운드) 미리보기

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

  const getFirebaseConfig = () => {
    // Vite env: VITE_FIREBASE_...
    // 값이 없으면 FCM 초기화는 건너뜁니다.
    const cfg = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const missing = Object.entries(cfg)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    const rawVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    // .env에 따옴표/공백/개행이 섞이면 Firebase 내부에서 atob 에러가 날 수 있어요.
    const vapidKey = typeof rawVapidKey === "string"
      ? rawVapidKey
        .trim()
        .replace(/^\"|\"$/g, "")
        .replace(/^'|'$/g, "")
      : rawVapidKey;

    return {
      cfg,
      missing,
      vapidKey,
    };
  };

  const safeParseFcmPayload = (payload) => {
    // payload: { notification, data, ... }
    // data는 string map 형태가 일반적
    const data = payload?.data || {};
    return {
      title: payload?.notification?.title || "알림",
      body: payload?.notification?.body || "",
      data,
    };
  };

  const refreshAlerts = async () => {
    try {
      const alertRes = await getAlerts();
      const alertList = Array.isArray(alertRes?.data)
        ? alertRes.data
        : Array.isArray(alertRes?.data?.data)
          ? alertRes.data.data
          : [];
      setAlerts(alertList);
    } catch (err) {
      console.error("알림 목록 재조회 실패", err);
    }
  };

  const initFcmForWeb = async () => {
    try {
      // 로그인 상태가 아니면 등록 스킵
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      // 브라우저 지원 여부
      const supported = await isSupported();
      if (!supported) {
        console.warn("이 브라우저는 Firebase Messaging(FCM Web)을 지원하지 않습니다.");
        return;
      }

      // Firebase config 확인
      const { cfg, missing, vapidKey } = getFirebaseConfig();
      if (typeof vapidKey === "string") {
        console.log("[FCM] vapidKey length:", vapidKey.length);
        const hasWhitespace = /\s/.test(vapidKey);
        if (hasWhitespace) console.warn("[FCM] vapidKey에 공백/개행이 포함되어 있습니다.");
      }
      if (missing.length > 0 || !vapidKey) {
        console.warn(
          "Firebase 환경변수 누락으로 FCM 초기화를 건너뜁니다:",
          { missing, vapidKeyPresent: Boolean(vapidKey) }
        );
        return;
      }

      // 권한 요청
      if (typeof Notification !== "undefined") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          console.warn("알림 권한이 거부되어 FCM 토큰 등록을 건너뜁니다.");
          return;
        }
      }

      // Firebase App init (중복 방지)
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      const messaging = getMessaging(app);

      // SW 등록 (Vite에서는 public/firebase-messaging-sw.js 경로 권장)
      let swReg = null;
      if ("serviceWorker" in navigator) {
        try {
          swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        } catch (e) {
          console.error("FCM 서비스워커 등록 실패", e);
          // SW 없으면 getToken이 실패할 수 있음
        }
      }

      // 토큰 획득
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg || undefined,
      });

      if (!token) {
        console.warn("FCM 토큰을 가져오지 못했습니다.");
        return;
      }

      // 백엔드에 토큰 등록/갱신
      const deviceInfo = getOrCreateDeviceInfo();
      await registerFcmToken({ token, deviceInfo });
      localStorage.setItem("fcmToken", token);

      // 포그라운드 수신 처리 (중복 등록 방지)
      if (messagingUnsubRef.current) {
        try { messagingUnsubRef.current(); } catch { /* ignore */ }
      }
      messagingUnsubRef.current = onMessage(messaging, async (payload) => {
        const parsed = safeParseFcmPayload(payload);
        console.log("📥 [FCM foreground]", parsed);

        // 포그라운드에서도 시스템 알림 띄우기 (원하면)
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(parsed.title || "알림", {
              body: parsed.body || "",
              icon: "/icons/alert-icon.png",
            });
          } catch (e) {
            console.warn("포그라운드 Notification 표시 실패", e);
          }
        }

        // 화면에 간단 미리보기 표시
        setPushPreview({
          title: parsed.title,
          body: parsed.body,
          receivedAt: new Date().toISOString(),
          data: parsed.data,
        });

        // 서버 알림 목록도 갱신
        await refreshAlerts();
      });
    } catch (e) {
      console.error("FCM 초기화/토큰등록 실패", e);
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
          localStorage.setItem("selectedRecorderId", String(selected.id));
          setDeviceName(selected?.deviceName || "");

          const userRes = await api.get(`/recorders/${selected.id}/user`);
          setUsername(userRes?.data?.data?.username || "");
        }

        const codeRes = await api.get("/code");
        setRecorderCode(codeRes?.data?.data?.code || "");

        const statsRes = await api.get("/histories/stats");
        setRecentFallCount(statsRes?.data?.data?.recentWeekCount || 0);

        // 🔽 낙상 빈도 비교 API 추가
        try {
          const diffRes = await getFallDiff();
          setFallDiff(diffRes?.data?.data);  // "INCREASE" | "DECREASE" | "SAME"
        } catch (e) {
          console.error("낙상 빈도 비교 조회 실패", e);
          setFallDiff(null);
        }

        // 🔽 낙상 빈도 비교 API 추가
        try {
          const diffRes = await getFallDiff();
          console.log("낙상 빈도 응답 = ", diffRes);

          setFallDiff(diffRes?.data);  // ✅ 여기 수정
        } catch (e) {
          console.error("낙상 빈도 비교 조회 실패", e);
          setFallDiff(null);
        }


        // 🔽 알림 목록 조회
        try {
          const alertRes = await getAlerts();
          const alertList = Array.isArray(alertRes?.data)
            ? alertRes.data
            : Array.isArray(alertRes?.data?.data)
              ? alertRes.data.data
              : [];

          setAlerts(alertList.slice(0, 4));
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
    initFcmForWeb();

    return () => {
      if (messagingUnsubRef.current) {
        try { messagingUnsubRef.current(); } catch { /* ignore */ }
        messagingUnsubRef.current = null;
      }
    };
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
    localStorage.removeItem("fcmToken");
    navigate("/");
  };

  if (recorders.length === 0 && recorderCode) {
    return (
      <div className="w-full px-6 pt-6 flex flex-col min-h-full">
        <div className="border-b-2 border-black py-4 text-center font-bold">
          마이페이지
        </div>

        <p className="mt-10 text-center font-semibold">사용자의 리코더 코드는</p>
        <p className="mt-2 text-center text-xl font-bold">{recorderCode}</p>

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
                  onClick={async () => {
                    try {
                      await markAlertAsRead(item.id);
                      navigate("/falllog");
                    } catch (e) {
                      console.error("알림 읽음 처리 실패", e);
                    }
                  }}
                  className="w-full rounded-xl shadow-md border p-4 flex items-center gap-3 transition cursor-pointer hover:bg-gray-50"
                >
                  <div
                    className={`w-8 h-8 min-w-8 min-h-8 flex-shrink-0 flex items-center justify-center rounded-full border font-bold
                      ${item.isRead
                        ? "border-gray-400 text-gray-700"
                        : "border-red-400 text-red-500"}`}
                  >
                    i
                  </div>

                  <p className="text-sm text-gray-600">
                    {item.message || "알림"}
                    {item.createdAt ? (
                      <span className="ml-2 text-xs text-gray-400">
                        ({formatAlertTime(item.createdAt)})
                      </span>
                    ) : null}
                  </p>
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

  const isCustomName = recorder.deviceName && recorder.deviceName !== recorderCode;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="border-b border-black py-4 text-center text-lg font-bold">
        마이페이지
      </div>

      <div className="px-6 pt-8 flex flex-col flex-1">
        {pushPreview ? (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">방금 수신된 알림</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{pushPreview.title}</p>
            {pushPreview.body ? (
              <p className="mt-1 text-sm text-gray-600">{pushPreview.body}</p>
            ) : null}
          </div>
        ) : null}

        <p className="font-semibold text-base">{username}님의 지인이 설정되었습니다.</p>

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
              <button onClick={handleUpdateDeviceName} className="text-sm font-semibold">
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
              <button onClick={() => setIsEditing(true)} className="text-sm font-semibold">
                수정
              </button>
            </>
          )}
        </div>


        <p className="mt-4 text-sm font-bold">
          리코더 주소 : {recorderCode}
        </p>

        {fallDiff ? (
          <p className="mt-1 text-sm inline-block text-[#9b9b9b] py-1 rounded">
            {fallDiff === "INCREASE" && "지난달 대비 낙상 빈도가 증가했어요"}
            {fallDiff === "DECREASE" && "지난달 대비 낙상 빈도가 감소했어요"}
            {fallDiff === "SAME" && "지난달과 동일해요"}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">
            낙상 빈도 분석 중...
          </p>
        )}

        {/* Removed the two hard-coded alert cards here */}

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
                  onClick={async () => {
                    try {
                      await markAlertAsRead(item.id);
                      navigate("/falllog");
                    } catch (e) {
                      console.error("알림 읽음 처리 실패", e);
                    }
                  }}
                  className="w-full rounded-xl shadow-md border p-4 flex items-center gap-3 transition cursor-pointer hover:bg-gray-50"
                >
                  <div
                    className={`w-8 h-8 min-w-8 min-h-8 flex-shrink-0 flex items-center justify-center rounded-full border font-bold
                      ${item.isRead
                        ? "border-gray-400 text-gray-700"
                        : "border-red-400 text-red-500"}`}
                  >
                    i
                  </div>

                  <p className="text-sm text-gray-600">
                    {item.message || "알림"}
                    {item.createdAt ? (
                      <span className="ml-2 text-xs text-gray-400">
                        ({formatAlertTime(item.createdAt)})
                      </span>
                    ) : null}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>


        <button onClick={handleLogout} className="mt-auto mb-6 text-gray-300 text-sm underline">
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Mypage_BoHoZa;