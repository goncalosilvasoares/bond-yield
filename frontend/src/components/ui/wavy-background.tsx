import React, { useEffect, useMemo, useRef } from "react";

interface WavyBackgroundProps {
  children: React.ReactNode;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "normal" | "fast";
  waveOpacity?: number;

  /**
   * NEW: controls how tight the waves are around the center.
   * 0.10 = very tight, 0.25 = more spread
   */
  centerSpread?: number;

  /**
   * NEW: shifts the wave pack up/down (0..1 of height)
   * 0.5 = center, 0.45 = a bit higher
   */
  centerY?: number;
}

const speedToFactor = (speed: "slow" | "normal" | "fast") => {
  if (speed === "fast") return 0.018;
  if (speed === "normal") return 0.01;
  return 0.006;
};

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  children,
  containerClassName = "",
  colors = ["#8b5cf6", "#a855f7", "#ec4899", "#c084fc", "#f43f5e"],
  waveWidth = 70,
  backgroundFill = "#0a0a1a",
  blur = 12,
  speed = "slow",
  waveOpacity = 0.3,
  centerSpread = 0.12,
  centerY = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

const waveParams = useMemo(() => {
  return colors.map((_, i) => {
    const r = mulberry32(1337 + i * 999);

    // ✅ fases descoladas (0..2π), estáveis por wave
    const phaseA = randRange(r, 0, Math.PI * 2);
    const phaseB = randRange(r, 0, Math.PI * 2);
    const phaseC = randRange(r, 0, Math.PI * 2);

    // ✅ speed com variação pequena, sem “escadinha”
    const speedMul = randRange(r, 0.85, 1.15) + i * 0.03;

    // ✅ frequências por wavelength, para ficar igual em qualquer resolução
    // ajusta estes números para bater com o original
    const wlA = 900 + i * 140;   // onda grande
    const wlB = 520 + i * 90;    // onda média
    const wlC = 320 + i * 60;    // detalhe pequeno

    const freqA = freqFromWavelength(wlA);
    const freqB = freqFromWavelength(wlB);
    const freqC = freqFromWavelength(wlC);

    // ✅ amplitude mais “controlada”, e menos escalada linear
    const ampBase = 24 + i * 9;

    // ✅ drift lento, para não parecer “ruído”
    const drift = 0.08 + i * 0.03;

    return {
      phaseA,
      phaseB,
      phaseC,
      speedMul,
      freqA,
      freqB,
      freqC,
      ampBase,
      drift,
    };
  });
}, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let resizeRaf: number | null = null;
    let animRaf: number | null = null;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const scheduleResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        resize();
      });
    };

    resize();

    const ro = new ResizeObserver(scheduleResize);
    ro.observe(parent);
    window.addEventListener("resize", scheduleResize);

    const baseSpeed = speedToFactor(speed);
    let t = 0;

    // more aggressive offsets so they start de-synced
    const tOffsets = colors.map((_, i) => i * 73.9);

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (w <= 1 || h <= 1) {
        animRaf = requestAnimationFrame(draw);
        return;
      }

      t += baseSpeed;

      // background
      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, w, h);

      // waves with blur in ctx
      ctx.globalAlpha = waveOpacity;
      ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";

      // ✅ pack waves around a single center band
      const centerLine = h * centerY;
      const spreadPx = h * centerSpread;

      for (let i = 0; i < colors.length; i++) {
        const p = waveParams[i];
        const color = colors[i];

        // ✅ tight distribution around centerLine
        // ranges roughly from -spreadPx/2 to +spreadPx/2
        const norm = colors.length === 1 ? 0 : i / (colors.length - 1); // 0..1
        const offset = (norm - 0.5) * spreadPx;
        const baseY = centerLine + offset;

        const ti = (t + tOffsets[i]) * p.speedMul;

        const amp =
          p.ampBase *
          (0.88 + 0.16 * Math.sin(ti * p.drift + p.phaseC));

        const fA = p.freqA * (0.92 + 0.12 * Math.sin(ti * 0.15 + p.phaseA));
        const fB = p.freqB * (0.92 + 0.12 * Math.sin(ti * 0.11 + p.phaseB));
        const fC = p.freqC * (0.92 + 0.12 * Math.sin(ti * 0.09 + p.phaseC));

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = waveWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(0, baseY);

        const step = 8;

        for (let x = 0; x <= w + step; x += step) {
          const y =
            baseY +
            Math.sin(x * fA + ti * (1.05 + i * 0.07) + p.phaseA) * amp +
            Math.sin(x * fB + ti * 1.55 + p.phaseB) * (amp * 0.42) +
            Math.sin(x * fC + ti * 0.75 + p.phaseC) * (amp * 0.22) +
            Math.sin(ti * 0.6 + x * 0.002) * (amp * 0.08);

          ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.filter = "none";

      animRaf = requestAnimationFrame(draw);
    };

    animRaf = requestAnimationFrame(draw);

    return () => {
      if (animRaf) cancelAnimationFrame(animRaf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener("resize", scheduleResize);
    };
  }, [
    colors,
    waveParams,
    waveWidth,
    backgroundFill,
    blur,
    speed,
    waveOpacity,
    centerSpread,
    centerY,
  ]);

  return (
    <div
      className={containerClassName}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        minHeight: "100vh",
        width: "100%",
        background: backgroundFill,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          display: "block",
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
};

const mulberry32 = (a: number): (() => number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randRange = (r: () => number, min: number, max: number): number =>
  min + (max - min) * r();

const freqFromWavelength = (wlPx: number): number => (2 * Math.PI) / wlPx;

