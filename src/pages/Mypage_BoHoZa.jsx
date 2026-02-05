import React, { useEffect, useState } from "react";
import api from "../apis/api";

const Mypage_BoHoZa = () => {
  const [recorderCode, setRecorderCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecorderCode = async () => {
      try {
        const res = await api.get("/code");
        setRecorderCode(res.data.data.code);
      } catch (e) {
        setError("연결 코드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecorderCode();
  }, []);

  return (
    <div className="w-full px-6 pt-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="w-full border-b-2 border-black py-4 text-center font-bold text-lg">
        마이페이지
      </div>

      {/* Content */}
      {loading && (
        <p className="mt-10 text-sm text-gray-400">연결 코드 불러오는 중...</p>
      )}

      {error && (
        <p className="mt-10 text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <div className="mt-10">
          <p className="text-sm text-gray-500 mb-1">
            사용자의 리코더 코드는
          </p>
          <p className="text-2xl font-bold mb-2">
            {recorderCode} 입니다
          </p>
          <p className="text-sm text-gray-400">
            해당 코드를 리코더 기기에 입력해주세요
          </p>
        </div>
      )}

      {/* 로그아웃 */}
      <button className="mt-auto mb-50 text-gray-300 underline text-sm self-center">
        로그아웃
      </button>
    </div>
  );
};

export default Mypage_BoHoZa;
