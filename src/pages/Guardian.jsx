import React, { useState } from 'react'
import alarm from './../assets/alarm.png'
const Guardian = () => {
    const [nickname, setNickname] = useState("보호자 아이디") // 임시값으로 보호자 아이디

  return (
    <div className='font-pretendard flex flex-col justify-center items-center mt-50'>
        <span className='font-semibold text-xl'>{nickname}님이 회원님의</span>
        <span className='font-semibold text-xl'>낙상을 감지하고 있습니다.</span>

        <span className='text-[#AFAFAF] text-sm mt-8'>아래 버튼을 클릭하여</span>
        <span className='text-[#AFAFAF] text-sm'>마이크 설정 권한을 허용해주세요</span>
        <img src={alarm} className="mt-7"/>
    </div>
  )
}

export default Guardian