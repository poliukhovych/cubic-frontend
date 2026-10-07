// src/components/Sparkline.tsx
import React from "react";

type Props = { data: number[]; width?: number; height?: number; strokeClassName?: string; };
const Sparkline: React.FC<Props> = ({ data, width=96, height=36, strokeClassName }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const nx = (i:number) => (i/(data.length-1)) * (width-4) + 2;
  const ny = (v:number) => {
    if (max===min) return height/2;
    const t = (v-min)/(max-min);
    return (1-t)*(height-4) + 2;
  };
  const d = data.map((v,i)=>`${i?'L':'M'}${nx(i)},${ny(v)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-90">
      <path d={d} fill="none" strokeWidth="2" className={strokeClassName ?? "text-primary"} stroke="currentColor" />
    </svg>
  );
};
export default Sparkline;
