import { useEffect, useRef } from "react";

/**
 * 새로고침/탭 닫기/페이지 이탈 시,
 * localStorage에 저장된 selectedRecorderId로 연결 해제 요청을 keepalive로 전송
 */
export default function useDisconnectRecorderOnRefresh() {
  const sentRef = useRef(false);

  useEffect(() => {
    const handleExit = () => {
      if (sentRef.current) return; // 중복 호출 방지(일부 브라우저에서 이벤트 2번 뜸)
      sentRef.current = true;

      const recorderId = localStorage.getItem("selectedRecorderId");
      if (!recorderId) return;

      const baseUrl = import.meta.env.VITE_API_URL; // 예: https://.../api
      if (!baseUrl) return;

      const accessToken = localStorage.getItem("accessToken");

      // ✅ axios 말고 fetch keepalive 사용 (언로드 시점에 제일 안정적)
      try {
        fetch(`${baseUrl}/recorders/${recorderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "include",
          keepalive: true,
        });
      } catch {
        // 언로드 시점이라 실패해도 어쩔 수 없음 (브라우저가 요청을 끊을 수 있음)
      }
    };

    // pagehide: iOS/Safari 포함해서 가장 안정적인 편
    window.addEventListener("pagehide", handleExit);
    // beforeunload: 일부 환경에서 pagehide가 안 뜰 때 대비(중복 방지 ref로 막음)
    window.addEventListener("beforeunload", handleExit);

    return () => {
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("beforeunload", handleExit);
    };
  }, []);
}