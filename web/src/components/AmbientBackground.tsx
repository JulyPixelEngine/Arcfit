"use client"

import { motion } from "framer-motion"

const blobs = [
  { className: "bg-pastel-lavender", size: 520, top: "-10%", left: "-8%", duration: 22 },
  { className: "bg-dopamine-sky/40", size: 420, top: "55%", left: "70%", duration: 26 },
  { className: "bg-pastel-peach", size: 460, top: "60%", left: "-12%", duration: 30 },
  { className: "bg-dopamine-pink/30", size: 380, top: "-5%", left: "65%", duration: 24 },
]

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-pastel-cream">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl opacity-70 ${b.className}`}
          style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Soft light sheen for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20" />
    </div>
  )
}
