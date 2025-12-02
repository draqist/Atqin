import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Roadmap } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { id: "all", label: "All Topics" },
  { id: "tajweed", label: "Tajweed" },
  { id: "aqeedah", label: "Aqeedah" },
  { id: "hadith", label: "Hadith" },
  { id: "grammar", label: "Arabic Grammar" },
];

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Create the payload for Gemini
export function createAudioContent(inputData: Float32Array) {
  const pcmBuffer = floatTo16BitPCM(inputData);
  const base64 = arrayBufferToBase64(pcmBuffer);
  return {
    mimeType: "audio/pcm;rate=16000",
    data: base64,
  };
}

// Convert Gemini's raw PCM response back to browser audio
export function pcmToAudioBuffer(
  pcmData: ArrayBuffer,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const pcm16 = new Int16Array(pcmData);
  const audioBuffer = audioContext.createBuffer(1, pcm16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < pcm16.length; i++) {
    // Normalize -32768..32767 to -1.0..1.0
    channelData[i] = pcm16[i] / 32768.0;
  }

  return audioBuffer;
}

export const generateTheme = (slug: string) => {
  const gradients = [
    "from-rose-500 to-orange-500",
    "from-emerald-500 to-teal-600",
    "from-blue-600 to-violet-600",
    "from-amber-400 to-orange-600",
    "from-fuchsia-600 to-pink-600",
    "from-sky-500 to-indigo-500",
    "from-lime-500 to-emerald-600",
    "from-violet-600 to-purple-600",
  ];

  // Simple hash function to pick a consistent index
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

export const getCategoryLabel = (slug: string) => {
  if (slug.includes("aqeedah")) return "Aqeedah";
  if (slug.includes("tajweed")) return "Tajweed";
  if (slug.includes("fiqh")) return "Fiqh";
  if (slug.includes("hadith")) return "Hadith";
  if (slug.includes("seerah")) return "Seerah";
  if (slug.includes("quran")) return "Qur'an";
  if (slug.includes("grammar")) return "Arabic Grammar";
  if (slug.includes("tafsir")) return "Tafsir";

  return "Curriculum";
};

export const LEVEL_ORDER: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export const getLevelRange = (nodes: Roadmap["nodes"] = []) => {
  if (!nodes || nodes.length === 0) return "Beginner to Advanced";

  let min = 5;
  let max = 0;

  nodes.forEach((node) => {
    const val = LEVEL_ORDER[node.level?.toLowerCase()] || 0;
    if (val > 0) {
      if (val < min) min = val;
      if (val > max) max = val;
    }
  });

  if (max === 0) return "Beginner to Advanced"; // Fallback

  const levels = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

  if (min === max) return levels[min];
  return `${levels[min]} to ${levels[max]}`;
};