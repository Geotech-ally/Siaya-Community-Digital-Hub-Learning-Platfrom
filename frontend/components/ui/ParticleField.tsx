'use client';

import { useEffect, useRef } from 'react';

// Cohesive, bioluminescent (jellyfish-like) palette.
const COLORS = ['#6366f1', '#7c3aed', '#8b5cf6', '#3b82f6', '#06b6d4', '#22d3ee', '#a78bfa', '#ec4899', '#f97316'];

interface Dot {
  phi: number; // 0 = top pole .. PI/2 = rim
  theta: number; // around the bell
  r: number;
  color: string;
  phase: number;
}

/**
 * Particles arranged on an invisible, tilted dome — a jellyfish bell. You only
 * see the dots, concentrated along the rim arc. The bell pulses gently in
 * unison at rest; moving the cursor injects energy so a wave travels across the
 * whole bell, and the dome parallaxes toward the pointer. Pure canvas 2D,
 * behind hero content (pointer-events: none). Static under reduced motion.
 */
export function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Dome geometry (set on resize)
    let cx = 0;
    let cyBase = 0;
    let R = 0;
    const TILT = 1.12; // radians — how far we look "down" onto the bell

    // Pointer state
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, lx: -9999, ly: -9999 };
    let energy = 0;
    let dots: Dot[] = [];

    function build() {
      dots = [];
      const count = Math.min(Math.floor((width * height) / 2600), 820);
      for (let i = 0; i < count; i++) {
        // Bias phi toward PI/2 so dots crowd the rim → the visible arc band.
        const phi = (Math.PI / 2) * Math.pow(Math.random(), 0.4);
        dots.push({
          phi,
          theta: Math.random() * Math.PI * 2,
          r: 1.2 + Math.random() * 1.5,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function layout() {
      cx = width * 0.5;
      R = Math.min(width * 0.34, height * 0.62, 560);
      cyBase = height * 0.30;
      ptr.x = ptr.tx = cx;
      ptr.y = ptr.ty = cyBase;
      domeX = prevDomeX = cx;
      domeY = prevDomeY = cyBase;
    }

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      build();
    }

    function onMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      const margin = 140;
      // If the pointer strays well outside the hero, gently recenter the dome
      // (prevents it flying off / scattering when the cursor leaves the frame).
      if (nx < -margin || ny < -margin || nx > width + margin || ny > height + margin) {
        ptr.tx = cx;
        ptr.ty = cyBase;
        return;
      }
      // Clamp the target inside the hero so the dome never chases off-screen.
      ptr.tx = Math.max(0, Math.min(width, nx));
      ptr.ty = Math.max(0, Math.min(height, ny));
    }
    function recenter() {
      ptr.tx = cx;
      ptr.ty = cyBase;
    }

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);
    const FOLLOW = 0.55; // how strongly the whole dome chases the cursor
    let domeX = 0;
    let domeY = 0;
    let prevDomeX = 0;
    let prevDomeY = 0;
    // Wave phase is integrated per frame (phase += speed * dt) rather than
    // computed as t * speed — otherwise any change in speed multiplies against
    // a large t and snaps every particle to a new point on the wave.
    let wavePhase = 0;
    let smoothAmp = 0.035;
    let lastT = 0;
    let raf = 0;

    function render(t: number) {
      ctx.clearRect(0, 0, width, height);

      // Ease the pointer, then move the ENTIRE dome toward it in unison. The
      // easing lag makes the trailing edge wave as the bell chases the cursor.
      ptr.x += (ptr.tx - ptr.x) * 0.09;
      ptr.y += (ptr.ty - ptr.y) * 0.09;
      const targetX = cx + (ptr.x - cx) * FOLLOW;
      const targetY = cyBase + (ptr.y - cyBase) * FOLLOW;
      domeX += (targetX - domeX) * 0.12;
      domeY += (targetY - domeY) * 0.12;

      // Wave energy comes from how fast the dome is travelling.
      const moveSpeed = Math.hypot(domeX - prevDomeX, domeY - prevDomeY);
      prevDomeX = domeX;
      prevDomeY = domeY;
      energy = Math.min(1.8, energy * 0.9 + Math.min(moveSpeed, 45) * 0.14);

      const px = domeX - cx;
      const py = domeY - cyBase;

      // Advance the wave by speed * dt so speed changes never jump the phase.
      const dt = Math.min(Math.max(t - lastT, 0), 0.05);
      lastT = t;
      wavePhase += (1.3 + energy * 1.4) * dt;

      const breathe = Math.sin(t * 0.9) * 0.02;
      // Smooth the amplitude too, so a sudden stop eases the wave down
      // instead of clipping it.
      smoothAmp += (0.035 + energy * 0.14 - smoothAmp) * 0.08;
      const amp = smoothAmp;

      // Project, collect, sort back-to-front, then draw.
      const buf: { x: number; y: number; s: number; a: number; c: string }[] = [];
      for (const d of dots) {
        const wave = Math.sin(d.theta * 3 + d.phi * 2 - wavePhase + d.phase);
        const Rp = R * (1 + breathe + wave * amp);
        const sinPhi = Math.sin(d.phi);
        const x3 = Rp * sinPhi * Math.cos(d.theta);
        const y3 = Rp * Math.cos(d.phi);
        const z3 = Rp * sinPhi * Math.sin(d.theta);
        // tilt around X axis
        const yt = y3 * cosT - z3 * sinT;
        const zt = y3 * sinT + z3 * cosT;

        const depth = (zt / R) * 0.5 + 0.5; // 0 back .. 1 front
        buf.push({
          x: cx + x3 + px,
          y: cyBase - yt + py,
          s: Math.max(0.4, d.r * (0.55 + depth * 0.95) * (1 + wave * amp * 2)),
          a: 0.22 + depth * 0.78,
          c: d.color,
        });
      }
      buf.sort((p, q) => (p.y > q.y ? 1 : -1)); // simple depth order

      for (const b of buf) {
        ctx.globalAlpha = b.a;
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(now: number) {
      energy *= 0.965;
      render(now * 0.001);
      raf = requestAnimationFrame(frame);
    }

    resize();

    if (reduceMotion) {
      render(0);
    } else {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', recenter);
      window.addEventListener('blur', recenter);
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', recenter);
      window.removeEventListener('blur', recenter);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
