import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apis/api";
import { logout } from "../apis/auth";

const Mypage_PeBoHoZa = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [guardianName, setGuardianName] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [connectionCode, setConnectionCode] = useState("");
  const [isPaired, setIsPaired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  // 레퍼런스
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  // 전처리(정제)용 AudioNode refs
  const highpassRef = useRef(null);
  const lowpassRef = useRef(null);
  const compressorRef = useRef(null);
  const silentGainRef = useRef(null);

  // [핵심] 3초치 데이터를 모으기 위한 임시 저장소
  const audioBufferRef = useRef([]); // 작은 조각들을 모아둘 배열
  const currentSampleCountRef = useRef(0); // 현재 모인 샘플 개수

  // 목표: 16kHz * 3초 = 48,000 샘플
  const TARGET_SAMPLE_RATE = 16000;
  const CHUNK_DURATION_SEC = 3;
  const TARGET_SAMPLE_COUNT = TARGET_SAMPLE_RATE * CHUNK_DURATION_SEC; // 48,000

  useEffect(() => {
    const fetchPairedGuardian = async () => {
      try {
        const recorderId = localStorage.getItem("recorderId");
        if (!recorderId) { setLoading(false); return; }
       const userRes = await api.get(`/recorders/${recorderId}/user`);
        const { username, userId } = userRes?.data?.data || {};
        if (username) {
          setGuardianName(username);
         if (userId) setGuardianId(userId);
           setIsPaired(true);
        }
      } catch (e) { console.error(e);
setIsPaired(true);

     // 보호자 정보는 없으니 기본값 세팅
     const storedGuardianName = localStorage.getItem("guardianUsername");
 const storedGuardianId = localStorage.getItem("guardianId");

 if (storedGuardianName) setGuardianName(storedGuardianName);
 else setGuardianName("보호자");

 if (storedGuardianId) setGuardianId(storedGuardianId);
     setConnectionCode(localStorage.getItem("connectionCode") || "");


       } finally { setLoading(false); }
    };
    fetchPairedGuardian();

    return () => { stopStreaming(); };
  }, []);

  // [유틸] 다운샘플링 함수
  const downsampleTo16k = (buffer, sampleRate) => {
    if (sampleRate === TARGET_SAMPLE_RATE) return buffer;
    const compression = sampleRate / TARGET_SAMPLE_RATE;
    const length = buffer.length / compression;
    const result = new Float32Array(length);

    let index = 0, j = 0;
    while (index < length) {
      result[index] = buffer[Math.floor(j)];
      j += compression;
      index++;
    }
    return result;
  };

  // [유틸] Float32 -> Int16 PCM 변환 함수
  const floatTo16BitPCM = (input) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
  };

  // [유틸] 여러 개의 Float32Array를 하나로 합치는 함수
  const mergeFloat32Arrays = (arrays, totalLength) => {
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  };

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      const recorderId = localStorage.getItem("recorderId");
      const wsUrl = `wss://audiofallcare-ai-test.onrender.com/ws/audio/stream?code=${connectionCode}&guardianId=${guardianId}&recorderId=${recorderId}`;
      console.log("🔗 연결 URL:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log(`✅ WebSocket 연결 성공! (${CHUNK_DURATION_SEC}초 버퍼링 모드)`);
        setIsStreaming(true);

        // 버퍼 초기화
        audioBufferRef.current = [];
        currentSampleCountRef.current = 0;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: TARGET_SAMPLE_RATE,
        });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        // =========================================================
        // [전처리(정제) 체인] HPF(저주파 컷) + LPF(고주파 컷) + Compressor(레벨 안정화)
        //  - HPF: 바람/진동/쿵쿵거림 같은 저주파 성분 완화
        //  - LPF: 치찰음/히스 같은 고주파 성분 완화
        //  - Compressor: 과도하게 큰 소리(충격) 클리핑 완화 및 레벨 안정화
        // =========================================================
        const highpass = audioContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100; // 80~150Hz 범위에서 튜닝 가능
        highpass.Q.value = 0.707;

        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 7500; // 6~8kHz 범위에서 튜닝 가능
        lowpass.Q.value = 0.707;

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24; // dB
        compressor.knee.value = 30;       // dB
        compressor.ratio.value = 12;      // 4~12 사이에서 튜닝
        compressor.attack.value = 0.003;  // sec
        compressor.release.value = 0.25;  // sec

        // 그래프를 "무음"으로 destination에 연결해 Worklet이 안정적으로 동작하도록 유지
        const silentGain = audioContext.createGain();
        silentGain.gain.value = 0;

        // refs 저장
        highpassRef.current = highpass;
        lowpassRef.current = lowpass;
        compressorRef.current = compressor;
        silentGainRef.current = silentGain;

        // Worklet 코드 (동일)
        const workletCode = `
          class RecorderProcessor extends AudioWorkletProcessor {
            constructor() {
              super();
              this.bufferSize = 4096;
              this.buffer = new Float32Array(this.bufferSize);
              this.index = 0;
            }
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input.length > 0) {
                const channelData = input[0];
                for (let i = 0; i < channelData.length; i++) {
                  this.buffer[this.index++] = channelData[i];
                  if (this.index >= this.bufferSize) {
                    this.port.postMessage(this.buffer);
                    this.index = 0; 
                  }
                }
              }
              return true;
            }
          }
          registerProcessor('recorder-processor', RecorderProcessor);
        `;

        const blob = new Blob([workletCode], { type: "application/javascript" });
        const workletUrl = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(workletUrl);

        const workletNode = new AudioWorkletNode(audioContext, "recorder-processor");
        workletNodeRef.current = workletNode;

        // =========================================================
        // [핵심 변경] 데이터 수신 시 바로 보내지 않고 "모으기"
        // =========================================================
        workletNode.port.onmessage = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = event.data; // 약 0.2초 분량의 데이터

            // 1. 다운샘플링 (16k)
            const downsampledData = downsampleTo16k(inputData, audioContext.sampleRate);

            // 2. 임시 저장소에 추가
            audioBufferRef.current.push(downsampledData);
            currentSampleCountRef.current += downsampledData.length;

            // 3. 3초 분량(48,000 샘플)이 모였는지 확인
            if (currentSampleCountRef.current >= TARGET_SAMPLE_COUNT) {

              // A. 모인 조각들을 하나로 합치기
              const mergedBuffer = mergeFloat32Arrays(audioBufferRef.current, currentSampleCountRef.current);

              // B. 정확히 3초 분량(48,000)으로 자르기 (혹시 조금 넘쳤을 경우 대비)
              const finalBuffer = mergedBuffer.slice(0, TARGET_SAMPLE_COUNT);

              // C. PCM 변환
              const pcmData = floatTo16BitPCM(finalBuffer);

              // D. 전송 및 로그
              console.log(`📤 [전송] 3초 데이터 발송 (Size: ${pcmData.byteLength} bytes)`);
              ws.send(pcmData);

              // E. 버퍼 초기화 (다음 3초를 위해)
              // (만약 3초를 넘겨서 남은 자투리 데이터가 있다면 다음 버퍼로 넘기는 로직이 필요할 수도 있지만, 
              // 여기서는 간단히 초기화하여 3초 간격을 맞춥니다.)
              audioBufferRef.current = [];
              currentSampleCountRef.current = 0;
            }
          }
        };

        // source -> (HPF) -> (LPF) -> (Compressor) -> worklet -> (silent) -> destination
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(compressor);
        compressor.connect(workletNode);

        // Worklet을 destination에 직접 연결하면 소리가 재생(피드백 가능)될 수 있어 무음으로 연결
        workletNode.connect(silentGain);
        silentGain.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("📥 [서버 응답]:", response);
        } catch (e) {
          console.log("📥 [서버 응답 (Raw)]:", event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket 오류:", err);
        stopStreaming();
      };

      ws.onclose = () => {
        console.log("🔌 연결 종료");
        stopStreaming();
      };

    } catch (err) {
      console.error(err);
      alert("마이크 권한 오류");
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);

    // 그래프 연결 해제 (순서 무관)
    if (sourceRef.current) sourceRef.current.disconnect();
    if (highpassRef.current) highpassRef.current.disconnect();
    if (lowpassRef.current) lowpassRef.current.disconnect();
    if (compressorRef.current) compressorRef.current.disconnect();
    if (silentGainRef.current) silentGainRef.current.disconnect();
    if (workletNodeRef.current) workletNodeRef.current.disconnect();

    // 리소스 정리
    if (audioContextRef.current) audioContextRef.current.close();
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

    // refs 초기화
    highpassRef.current = null;
    lowpassRef.current = null;
    compressorRef.current = null;
    silentGainRef.current = null;

    // 버퍼 초기화
    audioBufferRef.current = [];
    currentSampleCountRef.current = 0;
  };

  // UI 부분은 동일
  const handleToggleStreaming = () => {
    if (isStreaming) stopStreaming();
    else startStreaming();
  };

  if (loading) return <div>로딩 중...</div>;
  // if (!isPaired) return <div>보호자와 연결되지 않았습니다. <button onClick={() => navigate("/")}>돌아가기</button></div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <h2 className="text-center font-bold text-lg leading-relaxed">
        {guardianName}님이 회원님의 <br />
        낙상 감지 알림을 받고있습니다.
      </h2>
      <p className="mt-3 text-xs text-gray-400">
        {isStreaming ? "3초 단위 데이터 분석 중..." : "버튼을 눌러 시작하세요"}
      </p>
      <button
        onClick={handleToggleStreaming}
        className={`mt-10 w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl transition-colors duration-300 ${isStreaming
          ? "border-green-500 bg-green-100 text-green-600 animate-pulse"
          : "border-red-400 bg-white text-black"
          }`}
      >
        {isStreaming ? "■" : "⏻"}
      </button>
    </div>
  );
};

export default Mypage_PeBoHoZa;