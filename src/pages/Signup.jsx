import React from "react";

const Signup = () => {
  return (
    <div className="flex flex-col items-center w-full px-4 font-pretendard">
  
      <div className="w-full max-w-md mt-30">
        <span className="block text-3xl font-semibold mb-10">
          회원가입
        </span>

        <div className="space-y-6">
          {/* 아이디 */}
          <input
            placeholder="사용하실 아이디를 작성해주세요"
            className="w-full pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {/* 비밀번호 */}
          <input
            type="password"
            placeholder="사용하실 비밀번호를 작성해주세요"
            className="w-full pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />
          <input
            type="password"
            placeholder="비밀번호를 한 번 더 작성해주세요"
            className="w-full pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
          />

          {/* 이메일 */}
          <div className="flex gap-2">
            <input
              placeholder="사용하실 이메일을 작성해주세요"
              className="flex-1 pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
            />
            <button className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap">
              인증번호 발송
            </button>
          </div>

          {/* 인증번호 */}
          <div className="flex gap-2">
            <input
              placeholder="인증번호를 입력해주세요"
              className="flex-1 pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
            />
            <button className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap">
              인증하기
            </button>
          </div>

          {/* 주소 */}
          <div className="flex gap-2">
            <input
              placeholder="주소를 입력해주세요"
              className="flex-1 pl-3 py-3 border border-[#AFAFAF] rounded-xl focus:outline-none"
            />
            <button className="w-28 rounded-xl bg-black text-white text-sm whitespace-nowrap">
              주소 검색
            </button>
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <button className="w-full max-w-md py-3 mt-16 rounded-xl bg-black text-white text-lg">
        완료
      </button>
    </div>
  );
};

export default Signup;
