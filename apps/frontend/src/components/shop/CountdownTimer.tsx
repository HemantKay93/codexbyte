import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 24, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            hours = Math.max(0, hours - 1);
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <span className="text-xs text-stitch-error uppercase font-bold tracking-widest flex items-center gap-1.5 bg-stitch-error/10 px-4 py-2 rounded-full border border-stitch-error/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
        <Clock className="w-4 h-4" /> ENDS IN
      </span>
      <div className="flex items-center gap-2">
        <div className="bg-stitch-surface-container-high border border-stitch-outline-variant/30 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-inner">
          <span className="text-2xl font-black text-white leading-none font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stitch-outline font-bold tracking-wider mt-1">HRS</span>
        </div>
        <span className="text-stitch-error font-black text-xl animate-pulse">:</span>
        <div className="bg-stitch-surface-container-high border border-stitch-outline-variant/30 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-inner">
          <span className="text-2xl font-black text-white leading-none font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stitch-outline font-bold tracking-wider mt-1">MIN</span>
        </div>
        <span className="text-stitch-error font-black text-xl animate-pulse">:</span>
        <div className="bg-stitch-error/20 border border-stitch-error/40 px-3 py-2 rounded-lg min-w-[54px] flex flex-col items-center shadow-[0_0_15px_rgba(239,68,68,0.25)]">
          <span className="text-2xl font-black text-stitch-error leading-none font-mono">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stitch-error font-bold tracking-wider mt-1">SEC</span>
        </div>
      </div>
    </div>
  );
}
