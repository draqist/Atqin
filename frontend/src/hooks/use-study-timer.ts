"use client";

import api from "@/lib/axios";
import { useEffect, useRef } from "react";

export function useStudyTimer(bookId: string, isUserLoggedIn: boolean) {
  const activityRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isUserLoggedIn || !bookId) return;

    // 1. Activity Listeners
    const handleActivity = () => { activityRef.current = true; };

    // We attach these to window to catch any movement
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // 2. The Heartbeat (Every 1 minute)
    const interval = setInterval(() => {
      if (activityRef.current && document.hasFocus()) {
        // User moved mouse AND tab is focused -> Send Ping
        // We send "1 minute" of credit
        api.post("/analytics/heartbeat", { bookId, minutes: 1 }).catch(e => console.error("Ping failed", e));

        // Reset flag
        activityRef.current = false;
      }
    }, 60000); // 60 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [bookId, isUserLoggedIn]);
}