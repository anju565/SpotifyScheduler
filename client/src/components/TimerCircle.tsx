import { formatTime } from "@/lib/utils";

interface TimerCircleProps {
  currentSeconds: number;
  totalSeconds: number;
  isStudyMode: boolean;
  statusText: string;
}

export default function TimerCircle({ 
  currentSeconds, 
  totalSeconds, 
  isStudyMode,
  statusText 
}: TimerCircleProps) {
  // Calculate circle values
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = currentSeconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <div className="relative w-[280px] h-[280px] mb-8">
      <svg width="280" height="280" viewBox="0 0 100 100">
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="none" 
          stroke="#e0e0e0" 
          strokeWidth="12"
          className="timer-circle-bg"
        />
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="none" 
          stroke={isStudyMode ? "#6200ee" : "#1DB954"} 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1s linear"
          }}
          className="timer-circle-progress"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-4xl font-light mb-1">{formatTime(currentSeconds)}</div>
        <div className="text-sm text-neutral-dark opacity-75">{statusText}</div>
      </div>
    </div>
  );
}
