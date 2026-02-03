import React, { useState } from "react";
import useSignupForm from "../hooks/useSignupForm";
import AddressSearch from "../components/AddressSearch";

const Signup = () => {
  const {
    form,
    errors,
    emailSent,
    emailVerified,
    isFormValid,
    handleChange,
    sendEmailCode,
    verifyEmailCode,
    signup,
    setForm,
  } = useSignupForm();

  const [openAddress, setOpenAddress] = useState(false);

  const handleSignup = async () => {
    try {
      await signup();
      alert("회원가입 완료");
      window.location.href = "/login";
    } catch {
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
          <div>
            <div className="flex gap-2">
              <input
                name="email"
                placeholder="사용하실 이메일을 작성해주세요"
                onChange={handleChange}
                className="flex-1 px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
              />
              <button
              type="button"
                onClick={sendEmailCode}
                className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap"
              >
                인증번호 발송
              </button>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 인증번호 */}
          {emailSent && (
            <div>
              <div className="flex gap-2">
                <input
                  name="emailCode"
                  placeholder="인증번호를 입력해주세요"
                  onChange={handleChange}
                  className="flex-1 px-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
                />
                <button
                type="button"
                  onClick={verifyEmailCode}
                  className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap"
                >
                  인증하기
                </button>
              </div>

              {errors.emailCode && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emailCode}
                </p>
              )}

              {emailVerified && (
                <p className="mt-1 text-sm text-green-500">
                  이메일 인증이 완료되었습니다.
                </p>
              )}
            </div>
          )}

          {/* 주소 */}
          <div className="flex gap-2">
            <input
              value={form.address}
              placeholder="주소를 입력해주세요"
              readOnly
              className="flex-1 px-3 py-3 border border-[#AFAFAF] rounded-xl bg-gray-50"
            />
            <button
            type="button"
              onClick={() => setOpenAddress(true)}
              className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap"
            >
              주소 검색
            </button>
          </div>

          {openAddress && (
            <div className="border rounded-xl p-2">
              <AddressSearch
                onSelect={(addr) => {
                  setForm((prev) => ({ ...prev, address: addr }));
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
