import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface HeroProps {
  onEnter: () => void;
}

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.6 + 0.2,
}));

const HERO_NAME = "Sharvil Patil";
const HERO_SUBTITLE = "Computer Science Engineer · Agentic AI · Full-Stack & Backend";

const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state — everything hidden
      gsap.set([titleRef.current?.querySelectorAll('.char'), subtitleRef.current, btnRef.current, taglineRef.current], {
        opacity: 0,
        y: 40,
      });
      gsap.set(overlayRef.current, { opacity: 1 });

      const tl = gsap.timeline({ delay: 0.3 });

      // Overlay wipe down
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut',
      });

      // Tagline slides in
      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.2');

      // Letters stagger in
      tl.to(titleRef.current?.querySelectorAll('.char') ?? [], {
        opacity: 1,
        y: 0,
        duration: 0.06,
        stagger: 0.045,
        ease: 'power3.out',
      }, '-=0.1');

      // Subtitle fades in
      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.1');

      // Button appears
      tl.to(btnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.4)',
      }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Parallax on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(layer1Ref.current, { x: x * -18, y: y * -12, duration: 1.2, ease: 'power2.out' });
      gsap.to(layer2Ref.current, { x: x * -30, y: y * -20, duration: 1.4, ease: 'power2.out' });
      gsap.to(layer3Ref.current, { x: x * -10, y: y * -7, duration: 1.0, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    setExiting(true);
    gsap.to(heroRef.current, {
      opacity: 0,
      scale: 1.04,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: onEnter,
    });
  };

  const nameChars = HERO_NAME.split('').map((char, i) => (
    <span key={i} className={`char${char === ' ' ? ' space' : ''}`}>{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <div className="hero" ref={heroRef}>
      {/* Dark overlay for initial wipe */}
      <div className="hero-overlay" ref={overlayRef} />

      {/* Parallax particle layer 1 — large slow orbs */}
      <div className="hero-layer" ref={layer1Ref}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Parallax layer 2 — grid / lines */}
      <div className="hero-layer hero-grid" ref={layer2Ref} />

      {/* Parallax particle layer 3 — stars/dots */}
      <div className="hero-layer" ref={layer3Ref}>
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="hero-star"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-tagline" ref={taglineRef}>
          <span className="hero-tag-dot" />
          <span>WELCOME TO MY SPACE</span>
          <span className="hero-tag-dot" />
        </div>

        <div className="hero-title" ref={titleRef}>
          {nameChars}
        </div>

        <p className="hero-subtitle" ref={subtitleRef}>
          {HERO_SUBTITLE}
        </p>

        <button
          ref={btnRef}
          className="hero-enter-btn"
          onClick={handleEnter}
          disabled={exiting}
        >
          <span className="btn-glow" />
          <span className="btn-icon">⏎</span>
          <span>Enter Desktop</span>
          <span className="btn-ping" />
        </button>

        <div className="hero-scroll-hint">
          <div className="scroll-line" />
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="hero-corner hero-corner-tl" />
      <div className="hero-corner hero-corner-tr" />
      <div className="hero-corner hero-corner-bl" />
      <div className="hero-corner hero-corner-br" />
    </div>
  );
};

export default Hero;
