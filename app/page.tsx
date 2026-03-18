"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import ContentPanel from "@/components/content-panel"

const Scene = dynamic(() => import("@/components/scene"), { ssr: false })

const NAV_ITEMS = [
  { id: "skills",     label: "Skills" },
  { id: "projects",   label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "about",      label: "About Me" },
]

export default function Home() {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const handleNodeClick = useCallback((id: string | null) => {
    setActiveNode(id)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveNode(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <main className="relative h-screen w-full overflow-hidden" style={{ background: "#050816" }}>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Scene activeNode={activeNode} onNodeClick={handleNodeClick} />
      </div>

      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 45%, rgba(5,8,22,0.75) 100%)",
        }}
      />

      {/* ── Top bar ── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        {/* Logo / wordmark */}
        <span className="anim-fade-up text-xs font-mono font-medium tracking-[0.25em] uppercase text-white/35 select-none">
          Frank Yu
        </span>

        {/* Nav pill */}
        <nav className="anim-fade-up anim-delay-1">
          <div
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(16px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNode(item.id)}
                className="px-3 py-1 text-xs font-mono tracking-widest uppercase rounded-full transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)"
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)"
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Hero card ── */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        style={{
          opacity: activeNode ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        <div className="pointer-events-auto flex flex-col items-center text-center px-4">
          {/* Status badge */}
          <div
            className="anim-fade-up anim-delay-1 flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-mono tracking-widest uppercase"
            style={{
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "rgba(167,139,250,0.9)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#8b5cf6" }}
            />
            Available for opportunities
          </div>

          {/* Name */}
          <h1
            className="anim-fade-up anim-delay-2 font-sans font-bold text-white leading-none mb-3"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              letterSpacing: "-0.03em",
              textShadow: "0 0 80px rgba(139,92,246,0.3)",
            }}
          >
            Frank Yu
          </h1>

          {/* Title */}
          <p
            className="anim-fade-up anim-delay-2 font-mono mb-4"
            style={{
              fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.08em",
            }}
          >
            Software Developer &amp; Creative Technologist
          </p>

          {/* Tagline */}
          <p
            className="anim-fade-up anim-delay-3 font-sans mb-8 max-w-sm"
            style={{
              fontSize: "clamp(0.85rem, 1.6vw, 0.95rem)",
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.7,
            }}
          >
            Building immersive digital experiences at the intersection of design and technology.
          </p>

          {/* CTA buttons */}
          <div className="anim-fade-up anim-delay-4 flex items-center gap-3">
            <button
              onClick={() => setActiveNode("projects")}
              className="px-6 py-2.5 rounded-lg text-sm font-mono font-medium text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.85), rgba(109,40,217,0.85))",
                border: "1px solid rgba(139,92,246,0.5)",
                boxShadow: "0 0 24px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 40px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)")}
            >
              View Projects
            </button>
            <button
              onClick={() => setActiveNode("contact")}
              className="px-6 py-2.5 rounded-lg text-sm font-mono font-medium transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)"
                e.currentTarget.style.color = "rgba(255,255,255,0.9)"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                e.currentTarget.style.color = "rgba(255,255,255,0.6)"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
              }}
            >
              Contact Me
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none flex items-center justify-center pb-7"
        style={{
          opacity: activeNode ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        <div
          className="anim-fade-up anim-delay-4 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
            Click a node to explore
          </span>
        </div>
      </div>

      {/* Content panel */}
      <ContentPanel activeNode={activeNode} onClose={() => setActiveNode(null)} />
    </main>
  )
}
