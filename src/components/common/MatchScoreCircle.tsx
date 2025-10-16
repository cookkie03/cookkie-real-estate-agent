"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MatchScoreCircleProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    circle: 40,
    stroke: 4,
    text: "text-xs",
    label: "text-[10px]",
  },
  md: {
    circle: 60,
    stroke: 5,
    text: "text-sm",
    label: "text-xs",
  },
  lg: {
    circle: 80,
    stroke: 6,
    text: "text-lg",
    label: "text-sm",
  },
};

export function MatchScoreCircle({
  score,
  size = "md",
  showLabel = true,
  label = "Match",
  className,
}: MatchScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = sizeConfig[size];
  const radius = (config.circle - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color based on score
  const getScoreColor = (s: number): string => {
    if (s >= 85) return "hsl(var(--match-excellent))"; // Green
    if (s >= 70) return "hsl(var(--match-good))"; // Yellow-green
    if (s >= 50) return "hsl(var(--match-medium))"; // Orange
    return "hsl(var(--match-low))"; // Red
  };

  const color = getScoreColor(score);

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={config.circle} height={config.circle}>
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke={color}
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.3s ease",
            }}
          />
        </svg>
        {/* Score text in center */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color }}
        >
          <span className={cn("font-bold", config.text)}>{Math.round(animatedScore)}</span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground font-medium", config.label)}>
          {label}
        </span>
      )}
    </div>
  );
}
