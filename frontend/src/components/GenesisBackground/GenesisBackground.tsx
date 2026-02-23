import React from "react";
import { WavyBackground } from "../ui/wavy-background";

export const GenesisBackground = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <WavyBackground
      containerClassName="pt-64 md:pt-24 pb-32 md:pb-24 px-6 min-h-[90vh] flex items-start md:items-center justify-center"
      colors={["#8b5cf6", "#a855f7", "#ec4899", "#c084fc", "#f43f5e"]}
      waveWidth={70}
      backgroundFill="#0a0a1a"
      blur={12}
      speed="slow"
      waveOpacity={0.3}
      centerY={0.5}
      centerSpread={0.06}
    >
      <div className="container mx-auto relative z-1" style={{ zIndex: 2 }}>
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(10,10,26,0) 0%, rgba(10,10,26,0.15) 35%, rgba(10,10,26,0.55) 60%, rgba(10,10,26,0.92) 100%)",
        }}
      />
    </WavyBackground>
  );
};