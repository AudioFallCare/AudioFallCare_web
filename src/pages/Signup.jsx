import React from 'react'

const Signup = () => {
  return (
    <div className='flex flex-col font-pretendard justify-center items-center gap-6'>
      <span className='mr-76 mt-30 text-3xl font-semibold'>회원가입</span>
      
      {/* 아이디 작성칸 */}
      <input placeholder='사용하실 아이디를 작성해주세요' className='focus:outline-none focus:ring-0 border w-100 pl-2 py-3 rounded-xl  mt-8 border-[#AFAFAF]'/>

      {/* 비밀번호 작성칸 */}
      <input placeholder='사용하실 비밀번호를 작성해주세요' type='password' className='focus:outline-none focus:ring-0 border w-100 pl-2 py-3 rounded-xl border-[#AFAFAF]'/>
      {/* 비밀번호 확인 작성칸 */}
      <input placeholder='비밀번호를 한 번 더 작성해주세요' type='password' className='focus:outline-none focus:ring-0 border w-100 pl-2 py-3 rounded-xl border-[#AFAFAF]'/>

      {/* 이메일 작성칸 */ }
       <div className='flex flex-row gap-1'>
        <input placeholder='사용하실 이메일을 작성해주세요' className='focus:outline-none focus:ring-0 border w-74 pl-2 py-3 rounded-xl border-[#AFAFAF]'/>
        <button className='text-sm  border rounded-xl px-3 bg-black text-white'>인증번호 발송</button>
       </div>

       { /* 주소 검색 */ }
       <div className='flex flex-row gap-1'>
        <input placeholder='주소를 입력해주세요' className='focus:outline-none focus:ring-0  border w-76 pl-2 py-3 rounded-xl border-[#AFAFAF]'/>
        <button className='text-sm border rounded-xl px-5 bg-black text-white'>주소 검색</button>
       </div>

      {/* 완료 버튼 */}
       <button className='focus:outline-none focus:ring-0 border px-45 rounded-xl py-2 bg-black text-white text-[20px]'>완료</button>
    </div>
  )
}

export default Signup