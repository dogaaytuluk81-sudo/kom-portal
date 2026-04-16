import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#E81E25', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#fbbf24'];

const randomBetween = (a, b) => Math.random() * (b - a) + a;

const Particle = ({ color, startX, startY, delay }) => {
  const angle = randomBetween(0, Math.PI * 2);
  const velocity = randomBetween(200, 500);
  const dx = Math.cos(angle) * velocity;
  const dy = Math.sin(angle) * velocity - 200;
  const rotation = randomBetween(-720, 720);
  const size = randomBetween(6, 14);
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      initial={{ x: startX, y: startY, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x: startX + dx, y: startY + dy + 400, opacity: 0, scale: 0.3, rotate: rotation }}
      transition={{ duration: randomBetween(1.2, 2.2), delay, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        width: size,
        height: isCircle ? size : size * 0.4,
        borderRadius: isCircle ? '50%' : 2,
        background: color,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    />
  );
};

export const useConfetti = () => {
  const [particles, setParticles] = useState([]);

  const fire = (x, y) => {
    const count = 60;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      startX: x || window.innerWidth / 2,
      startY: y || window.innerHeight / 3,
      delay: Math.random() * 0.15,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  const fireCenter = () => fire(window.innerWidth / 2, window.innerHeight / 3);
  const fireFromTop = () => fire(window.innerWidth / 2, 0);

  const ConfettiCanvas = () => (
    <AnimatePresence>
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
    </AnimatePresence>
  );

  return { fire, fireCenter, fireFromTop, ConfettiCanvas };
};

// Basit bir "splash" efekti — sayfa açılışında büyüyen daire
export const PageSplash = ({ color = '#3b82f6', duration = 0.6 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration * 1000 + 200);
    return () => clearTimeout(t);
  }, [duration]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '50%', left: '50%',
        width: 200, height: 200,
        marginTop: -100, marginLeft: -100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        zIndex: 99998,
        pointerEvents: 'none',
      }}
    />
  );
};

// Yıldız patlaması — daha dramatik
export const StarBurst = ({ count = 12, color = '#fbbf24' }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = randomBetween(80, 200);
        return (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '40vh', opacity: 1, scale: 1 }}
            animate={{
              x: `calc(50vw + ${Math.cos(angle) * dist}px)`,
              y: `calc(40vh + ${Math.sin(angle) * dist}px)`,
              opacity: 0, scale: 0
            }}
            transition={{ duration: 0.8, delay: i * 0.02, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: 8, height: 8, borderRadius: '50%',
              background: color,
              boxShadow: `0 0 12px ${color}`,
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};