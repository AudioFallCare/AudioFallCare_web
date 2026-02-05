import React, { useState } from "react";
import useSignupForm from "../hooks/useSignupForm";
import AddressSearch from "../components/AddressSearch";

const Signup = () => {
  const {
    form,
    errors,
    isFormValid,
    handleChange,
    signup,
    setForm,
  } = useSignupForm();

  const [openAddress, setOpenAddress] = useState(false);

  const handleSignup = async () => {
    try {
      await signup();
      alert("회원가입 완료");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      alert("회원가입 실패");
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 font-pretendard">
      <div className="w-full max-w-md mt-28">
        <h1 className="text-3xl font-semibold mb-10">회원가입</h1>

        <div className="space-y-6">
          {/* 아이디 */}
          <input
            name="username"
            placeholder="사용하실 아이디를 작성해주세요"
            onChange={handleChange}
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {/* 비밀번호 */}
          <input
            type="password"
            name="password"
            placeholder="사용하실 비밀번호를 작성해주세요"
            onChange={handleChange}
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          <input
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호를 한 번 더 작성해주세요"
            onChange={handleChange}
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {/* 이메일 */}
          <input
            name="email"
            placeholder="사용하실 이메일을 작성해주세요"
            onChange={handleChange}
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {/* 우편번호 + 주소 검색 */}
          <div className="flex gap-2">
            <input
              value={form.zipcode}
              placeholder="우편번호"
              readOnly
              className="w-32 px-3 py-3 border border-[#AFAFAF] rounded-xl bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setOpenAddress(true)}
              className="flex-1 rounded-xl bg-black text-white text-sm whitespace-nowrap"
            >
              우편번호 검색
            </button>
          </div>

          {/* 주소 */}
          <input
            value={form.address}
            placeholder="기본 주소"
            readOnly
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl bg-gray-50"
          />

          {/* 상세 주소 */}
          <input
            name="addressDetail"
            placeholder="상세 주소를 입력해주세요"
            onChange={handleChange}
            className="w-full px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {openAddress && (
            <div className="border rounded-xl p-2">
              <AddressSearch
                onSelect={({ zipcode, address }) => {
                  setForm((prev) => ({
                    ...prev,
                    zipcode,
                    address,
                  }));
                  setOpenAddress(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 완료 버튼 */}
      <button
        type="button"
        disabled={!isFormValid}
        onClick={handleSignup}
        className={`w-full max-w-md py-3 mt-16 rounded-xl text-lg transition
          ${
            isFormValid
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        완료
      </button>
    </div>
  );
};

export default Signup;
