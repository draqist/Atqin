import { base64ToArrayBuffer, createAudioContent, pcmToAudioBuffer } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { useRef, useState } from "react";


// Define the Book type locally if not imported
interface BookNode {
  id: string;
  content_text: string;
  sequence_index: number;
}

interface UseGeminiLiveProps {
  bookTitle: string;
  currentText: string; // The specific verse/page user is reading
}

export const useGeminiLive = ({ bookTitle, currentText }: UseGeminiLiveProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Contexts
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Gemini Session
  const clientRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  // Audio Queue for smoother playback
  const nextPlayTimeRef = useRef<number>(0);

  // Cleanup function
  const disconnect = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (sessionRef.current) {
        // The SDK doesn't always have a clean 'close' method exposed on the session wrapper,
        // but we drop the reference.
        sessionRef.current = null;
      }
      setIsConnected(false);
      setIsMicOn(false);
      setAiSpeaking(false);
    } catch (e) {
      console.error("Disconnect error:", e);
    }
  };

  const connect = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError("API Key missing");
      return;
    }

    try {
      setError(null);

      // 1. Setup Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini standard output
      });

      // 2. Setup Gemini Client
      const client = new GoogleGenAI({ apiKey });
      clientRef.current = client;

      // 3. Define the Persona
      const systemInstruction = `
        You are a strict but kind Quran Muhaffiz (Teacher). 
        The student is reciting from: "${bookTitle}".
        The specific text they are reciting is: 
        """
        ${currentText}
        """

        Your Job:
        1. Listen to their audio input.
        2. If they recite correctly, stay silent or give a very short "Sahih" (Correct).
        3. If they make a mistake, gently interrupt and correct ONLY the word they missed.
        4. If they stop for 3 seconds, prompt them with the next word.
        5. Do NOT have a long conversation. Be a tool for correction.
      `;

      // 4. Connect via Websocket
      const session = await clientRef.current.live.connect({
        model: "gemini-2.0-flash-exp", // Use the latest experimental live model
        config: {
          generationConfig: {
            responseModalities: ["AUDIO"], // We only want audio back
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
        },
      });

      sessionRef.current = session;
      setIsConnected(true);

      // 5. Start Microphone
      await startMicrophone(session);

      // 6. Listen for Responses (The Loop)
      receiveAudioLoop(session);

    } catch (e: any) {
      console.error("Connection failed:", e);
      setError(e.message || "Failed to connect");
      disconnect();
    }
  };

  const startMicrophone = async (session: any) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000, // Gemini prefers 16k input
      },
    });
    streamRef.current = stream;
    setIsMicOn(true);

    const ctx = new AudioContext({ sampleRate: 16000 });
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert and Send
      const audioContent = createAudioContent(inputData);
      session.sendRealtimeInput([
        {
          mimeType: audioContent.mimeType,
          data: audioContent.data,
        },
      ]);
    };

    source.connect(processor);
    processor.connect(ctx.destination); // Necessary for the processor to run

    sourceRef.current = source;
    processorRef.current = processor;
  };

  const receiveAudioLoop = async (session: any) => {
    // The SDK provides an async iterable for the stream
    try {
      for await (const msg of session.receive()) {
        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          setAiSpeaking(true);
          playAudioChunk(audioData);
        }

        // Turn indicator
        if (msg.serverContent?.turnComplete) {
          setAiSpeaking(false);
        }
      }
    } catch (e) {
      console.error("Stream error:", e);
      disconnect();
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const arrayBuffer = base64ToArrayBuffer(base64Audio);
    const audioBuffer = pcmToAudioBuffer(arrayBuffer, ctx);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Schedule next chunk to play right after the previous one
    const now = ctx.currentTime;
    // If the queue lag is too big (latency), jump to now
    const startTime = Math.max(now, nextPlayTimeRef.current);

    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;

    source.onended = () => {
      // Optional: could implement visualizer cleanup here
    };
  };

  return {
    connect,
    disconnect,
    isConnected,
    isMicOn,
    aiSpeaking,
    error,
  };
};