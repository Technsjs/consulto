"use client";

import { useEffect, useState } from "react";
import { getEventAtIso } from "@/lib/site";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const EVENT_AT_MS = new Date(getEventAtIso()).getTime();

export default function Countdown() {
  const [parts, setParts] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, EVENT_AT_MS - now);

      const totalSeconds = Math.floor(diff / 1000);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;
      const totalDays = Math.floor(totalHours / 24);

      let months = 0;
      let days = totalDays;
      const start = new Date();
      while (days > 0) {
        const daysInMonth = new Date(
          start.getFullYear(),
          start.getMonth() + months + 1,
          0,
        ).getDate();
        if (days >= daysInMonth) {
          days -= daysInMonth;
          months += 1;
        } else {
          break;
        }
      }

      setParts({ months, days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "mo", value: parts.months },
    { label: "d", value: parts.days },
    { label: "h", value: pad(parts.hours) },
    { label: "m", value: pad(parts.minutes) },
    { label: "s", value: pad(parts.seconds) },
  ];

  return (
    <div className="landing-countdown">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown-unit">
          <span className="countdown-value">{value}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
