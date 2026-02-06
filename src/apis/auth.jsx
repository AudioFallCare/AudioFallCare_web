import api from "./api";

// deviceInfo (UUID) 생성 or 저장 == login 떄 사용
const DEVICE_INFO_KEY = "deviceInfo";
const getOrCreateDeviceInfo = () => {
  if (typeof window === "undefined" || !window.localStorage) return "";

  let deviceInfo = localStorage.getItem(DEVICE_INFO_KEY);
  if (deviceInfo) return deviceInfo;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    deviceInfo = crypto.randomUUID();
  } else {
    deviceInfo = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  localStorage.setItem(DEVICE_INFO_KEY, deviceInfo);
  return deviceInfo;
};


// A. 리코더 관련
// ================================================================================================

// GET : 연결된 리코더 목록 조회
export const getRecorders = async () => {
  try {
    console.log("GET : 연결된 리코더 목록 조회 요청");
    const res = await api.get("/recorders");
    console.log("GET : 연결된 리코더 목록 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("리코더 목록 조회 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 리코더 코드 등록
export const registerRecorder = async (connectionCode) => {
  try {
    console.log("POST : 리코더 코드 등록 요청 = ", { code: connectionCode });
    const res = await api.post("/recorders", {
      code: connectionCode,
    });
    console.log("POST : 리코더 코드 등록 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("리코더 코드 등록 예외 터짐 = ", error);
    throw error;
  }
};

// DELETE : 리코더 연결 해제
export const disconnectRecorder = async (id) => {
  try {
    console.log("DELETE : 리코더 연결 해제 요청 = ", { id });
    const res = await api.delete(`/recorders/${id}`);
    console.log("DELETE : 리코더 연결 해제 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("리코더 연결 해제 예외 터짐 = ", error);
    throw error;
  }
};

// PATCH : 리코더 정보 수정
export const updateRecorder = async (id, deviceName) => {
  try {
    console.log("PATCH : 리코더 정보 수정 요청 = ", { id, deviceName });
    const res = await api.patch(`/recorders/${id}`, {
      deviceName,
    });
    console.log("PATCH : 리코더 정보 수정 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("리코더 정보 수정 예외 터짐 = ", error);
    throw error;
  }
};

// GET : 리코더 상태 조회
export const getRecorderStatus = async (id) => {
  try {
    console.log("GET : 리코더 상태 조회 요청 = ", { id });
    const res = await api.get(`/recorders/${id}/status`);
    console.log("GET : 리코더 상태 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("리코더 상태 조회 예외 터짐 = ", error);
    throw error;
  }
};


// B. 내부 통신 / FCM
// ================================================================================================

// POST : 낙상 감지 결과 수신 (AI 서버 → Spring)
export const receiveFallDetectionResult = async ({
  recorderId,
  confidence,
  soundType,
  detectedAt,
}) => {
  try {
    const body = { recorderId, confidence, soundType, detectedAt };
    console.log("POST : 낙상 감지 결과 수신 요청 = ", body);

    const res = await api.post("/internal/fall", body);

    console.log("POST : 낙상 감지 결과 수신 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("낙상 감지 결과 수신 예외 터짐 = ", error);
    throw error;
  }
};

// POST : FCM 토큰 등록 및 갱신
export const registerFcmToken = async ({ token, deviceInfo }) => {
  try {
    const body = { token, deviceInfo };
    console.log("POST : FCM 토큰 등록 요청 = ", body);

    const res = await api.post("/fcm/token", body);

    console.log("POST : FCM 토큰 등록 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("FCM 토큰 등록 예외 터짐 = ", error);
    throw error;
  }
};


// C. 인증 (login, signup, token)
// ================================================================================================

// POST : 회원가입
export const signup = async (data) => {
  const payload = {
    ...data,
    zipcode: data.zipcode ? Number(data.zipcode) : null,
  };

  const res = await api.post("/auth/signup", payload, {
    headers: {
      Authorization: undefined,
    },
  });

  return res.data;
};


// POST : 토큰 재발급
export const refreshToken = async (deviceInfo) => {
  try {
    const body = { deviceInfo };
    console.log("POST : 토큰 재발급 요청 = ", body);

    const res = await api.post("/auth/refresh", body);

    console.log("POST : 토큰 재발급 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("토큰 재발급 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 로그아웃
export const logout = async (deviceInfo) => {
  try {
    const body = { deviceInfo };
    console.log("POST : 로그아웃 요청 = ", body);

    const res = await api.post("/auth/logout", body);

    console.log("POST : 로그아웃 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("로그아웃 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 로그인
export const login = async (username, password) => {
  const deviceInfo = getOrCreateDeviceInfo();
  console.log("POST : 로그인 요청 = ", { username, password, deviceInfo });
  const res = await api.post("/auth/login", {
    username,
    password,
    deviceInfo
  });

  const token = res.data?.data?.accessToken;

  if (token) {
    localStorage.setItem("accessToken", token);
    console.log("토큰 저장 완 = ", token);
  } else {
    console.warn("로그인은 성공했으나 토큰이 응답에 없습니다.");
  }

  console.log("POST : 로그인 응답 = ", res);
  return res.data;
};


// D. 헬스체크 / 연결코드
// ================================================================================================

// GET : 서버상태 확인 (헬스체크)
export const checkServerHealth = async () => {
  try {
    console.log("GET : 서버상태(헬스체크) 확인 요청");

    const res = await api.get("/health");

    console.log("GET : 서버상태(헬스체크) 확인 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("서버상태(헬스체크) 확인 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 연결코드 검증
export const verifyConnectionCode = async (code) => {
  try {
    const body = { code };
    console.log("POST : 연결 코드 검증 요청 = ", body);

    const res = await api.post("/code/verify", body);

    console.log("POST : 연결 코드 검증 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("연결 코드 검증 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 연결코드 재발급
export const regenerateConnectionCode = async () => {
  try {
    console.log("POST : 연결 코드 재발급 요청");

    const res = await api.post("/code/regenerate");

    console.log("POST : 연결 코드 재발급 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("연결 코드 재발급 예외 터짐 = ", error);
    throw error;
  }
};

// POST : 연결코드 발급
export const generateConnectionCode = async () => {
  try {
    console.log("POST : 연결 코드 발급 요청");

    const res = await api.post("/code/generate");

    console.log("POST : 연결 코드 발급 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("연결 코드 발급 예외 터짐 = ", error);
    throw error;
  }
};

// GET : 현재 사용자 연결 코드 조회
export const getConnectionCode = async () => {
  try {
    console.log("GET : 연결 코드 조회 요청");

    const res = await api.get("/code");

    console.log("GET : 연결 코드 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("연결 코드 조회 예외 터짐 = ", error);
    throw error;
  }
};


// E. 낙상 이력
// ================================================================================================

// GET : 낙상목록 조회
export const getFallHistories = async () => {
  try {
    console.log("GET : 낙상목록 조회 요청");
    const res = await api.get("/histories");
    console.log("GET : 낙상목록 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("낙상목록 조회 예외 터짐 = ", error);
    throw error;
  }
};


// GET : 낙상이력 상세조회
export const getFallHistoryDetail = async (id) => {
  try {
    console.log("GET : 낙상이력 상세조회 요청 = ", { id });

    const res = await api.get(`/histories/${id}`);

    console.log("GET : 낙상이력 상세조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("낙상이력 상세조회 예외 터짐 = ", error);
    throw error;
  }
};

// DELETE : 낙상이력 삭제
export const deleteFallHistory = async (id) => {
  try {
    console.log("DELETE : 낙상이력 삭제 요청 = ", { id });

    const res = await api.delete(`/histories/${id}`);

    console.log("DELETE : 낙상이력 삭제 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("낙상이력 삭제 예외 터짐 = ", error);
    throw error;
  }
};

// GET : 낙상 통계 조회
export const getFallHistoryStats = async () => {
  try {
    console.log("GET : 낙상통계 조회 요청");

    const res = await api.get("/histories/stats");

    console.log("GET : 낙상통계 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("낙상통계 조회 예외 터짐 = ", error);
    throw error;
  }
};


// F. 알림
// ================================================================================================

// PATCH : 알림 읽음 처리
export const markAlertAsRead = async (id) => {
  try {
    console.log("PATCH : 알림 읽음 처리 요청 = ", { id });

    const res = await api.patch(`/alerts/${id}`);

    console.log("PATCH : 알림 읽음 처리 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("알림 읽음 처리 예외 터짐 = ", error);
    throw error;
  }
};

// GET : 알림 목록 조회
export const getAlerts = async () => {
  try {
    console.log("GET : 알림 목록 조회 요청");

    const res = await api.get("/alerts");

    console.log("GET : 알림 목록 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("알림 목록 조회 예외 터짐 = ", error);
    throw error;
  }
};

// GET : 읽지 않은 알림 개수 조회
export const getUnreadAlertCount = async () => {
  try {
    console.log("GET : 읽지 않은 알림 개수 조회 요청");

    const res = await api.get("/alerts/unread/count");

    console.log("GET : 읽지 않은 알림 개수 조회 응답 = ", res);
    return res.data;
  } catch (error) {
    console.error("읽지 않은 알림 개수 조회 예외 터짐 = ", error);
    throw error;
  }
}