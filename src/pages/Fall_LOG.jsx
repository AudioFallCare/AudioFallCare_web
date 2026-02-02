import React from 'react';
import { Link } from 'react-router-dom';

const Fall_LOG = () => {

    // alert 데이터
    const fallalertData = {
        fall_alert_count: 1,
        fall_alert_content: [
            {
                id: 1,
                content: "2026.01.26에 높은 신뢰도의 낙상 감지!"
            }
        ]
    };

    // 낙상 기록 data
    const fallData = {
        fall_count: 3,
        fall_content: [
            {
                id: 1,
                date: '2026.01.27',
                time: '16:21',
                confidence: 97
            },
            {
                id: 2,
                date: '2026.01.26',
                time: '08:58',
                confidence: 40
            },
            {
                id: 3,
                date: '2026.01.01',
                time: '01:11',
                confidence: 20
            }
        ]
    };

    // 신뢰도 수치 color
    const getConfidenceColor = (score) => {
        if (score >= 80) return 'text-red-500';    // 80% >= 빨강
        if (score >= 40) return 'text-yellow-500'; // 40% >= 노랑
        return 'text-green-500';                   // etc 초록
    };

    return (
        <div className="fixed inset-0 w-full bg-white flex flex-col">

            {/* Header */}
            <header className="relative flex justify-center items-center pt-10 pb-5 bg-white z-10">
                <h1 className="text-2xl font-bold text-black">소리 감지 기록</h1>
            </header>


            <main className="flex-1 px-6 flex flex-col pb-24 overflow-y-auto">

                {/* alert 상단 */}
                <div className="mb-6 space-y-4">
                    {fallalertData.fall_alert_content.map((item) => (
                        <div
                            key={item.id}
                            className="w-full bg-white rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-gray-100 px-4 py-2.5 flex items-center"
                        >
                            {/* 아이콘 박스 */}
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-red-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            </div>

                            {/* 알림 내용 */}
                            <span className="text-gray-600 text-sm font-medium">
                                {item.content}
                            </span>
                        </div>
                    ))}
                </div>


                {/* 그리드 표 */}
                {/* border: 테두리, rounded-2xl: 둥근 모서리 */}
                <div className="w-full border border-gray-400 rounded-2xl overflow-hidden flex flex-col h-[600px]">

                    {/* 그리드 head */}
                    <div className="flex bg-gray-200 h-12 border-b border-gray-400">
                        <div className="flex-1 flex items-center justify-center border-r border-gray-400 font-bold text-sm">날짜</div>
                        <div className="flex-1 flex items-center justify-center border-r border-gray-400 font-bold text-sm">감지된 시간</div>
                        <div className="flex-1 flex items-center justify-center font-bold text-sm">신뢰도</div>
                    </div>

                    {/* 그리드 content */}
                    {fallData.fall_content.map((item) => (
                        <div key={item.id} className="flex h-12 border-b border-gray-200 last:border-none">

                            {/* 날짜 */}
                            <div className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm">
                                {item.date}
                            </div>

                            {/* 시간 */}
                            <div className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm">
                                {item.time}
                            </div>

                            {/* 신뢰도 */}
                            <div className={`flex-1 flex items-center justify-center font-bold text-sm ${getConfidenceColor(item.confidence)}`}>
                                {item.confidence}%
                            </div>
                        </div>
                    ))}

                    {/* 아래 여백에 줄 */}
                    <div className="flex-1 flex">
                        <div className="flex-1 border-r border-gray-200"></div>
                        <div className="flex-1 border-r border-gray-200"></div>
                        <div className="flex-1"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Fall_LOG;