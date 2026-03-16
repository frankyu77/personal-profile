"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { X, Github, Linkedin, Mail, ExternalLink, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Section accent palette ─── */
const SECTION_ACCENT: Record<string, { hex: string; rgb: string }> = {
  about:      { hex: "#8b5cf6", rgb: "139,92,246"  },
  skills:     { hex: "#22d3ee", rgb: "34,211,238"  },
  experience: { hex: "#3b82f6", rgb: "59,130,246"  },
  projects:   { hex: "#8b5cf6", rgb: "139,92,246"  },
  contact:    { hex: "#ec4899", rgb: "236,72,153"  },
}

/* ─── Mini plexus canvas background ─── */
function MiniPlexus({ color, isVisible }: { color: string; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const nodesRef  = useRef<{ x: number; y: number; vx: number; vy: number }[]>([])

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    for (let i = 0; i < 60; i++) {
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 })
    }
    nodesRef.current = nodes
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initNodes(rect.width, rect.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      const nodes = nodesRef.current

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > rect.width)  n.vx *= -1
        if (n.y < 0 || n.y > rect.height) n.vy *= -1
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            const alpha = (1 - d / 120) * 0.10
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba")
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = color.replace(")", ", 0.35)").replace("rgb", "rgba")
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(draw)
    }

    if (isVisible) draw()
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize) }
  }, [color, isVisible, initNodes])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 }} />
}

/* ─── Project card ─── */
function ProjectCard({ name, description, tech, github, demo, accent }: {
  name: string; description: string; tech: string[]
  github?: string; demo?: string; accent: string
}) {
  return (
    <div
      className="group relative flex flex-col gap-3 p-5 rounded-xl transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `${accent}40`
        el.style.boxShadow = `0 0 20px ${accent}10`
        el.style.background = "rgba(255,255,255,0.05)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "rgba(255,255,255,0.07)"
        el.style.boxShadow = "none"
        el.style.background = "rgba(255,255,255,0.03)"
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-md" style={{ background: `${accent}18` }}>
            <Code2 className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
          <h3 className="text-sm font-sans font-semibold text-white">{name}</h3>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center h-6 w-6 rounded-md text-white/50 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-label="GitHub"
            >
              <Github className="h-3 w-3" />
            </a>
          )}
          {demo && (
            <a href={demo} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center h-6 w-6 rounded-md text-white/50 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
              aria-label="Live demo"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <p className="text-xs text-white/45 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {tech.map(t => (
          <span key={t} className="px-2 py-0.5 text-xs font-mono rounded-md" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Section content components ─── */
function AboutContent() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: SECTION_ACCENT.about.hex }}>About Me</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white leading-tight mb-3" style={{ letterSpacing: "-0.02em" }}>
          Hello, I&apos;m Alex
        </h2>
        <p className="text-sm text-white/40 font-mono">Full-Stack Developer & Creative Technologist</p>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${SECTION_ACCENT.about.hex}40, transparent)` }} />
      <p className="text-sm text-white/55 leading-relaxed">
        I build accessible, pixel-perfect digital experiences for the web. My favorite work lives at the intersection of
        design and engineering — where things look great <em>and</em> perform flawlessly.
      </p>
      <p className="text-sm text-white/55 leading-relaxed">
        Passionate about emerging tech and immersive interfaces, this portfolio is a reflection of that philosophy
        — a living neural network you can explore.
      </p>
      <div className="flex gap-3 pt-1">
        {[
          { href: "#", icon: <Github className="h-4 w-4" />, label: "GitHub" },
          { href: "#", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
        ].map(({ href, icon, label }) => (
          <a key={label} href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200"
            style={{ background: `${SECTION_ACCENT.about.hex}15`, color: SECTION_ACCENT.about.hex, border: `1px solid ${SECTION_ACCENT.about.hex}25` }}
            onMouseEnter={e => (e.currentTarget.style.background = `${SECTION_ACCENT.about.hex}25`)}
            onMouseLeave={e => (e.currentTarget.style.background = `${SECTION_ACCENT.about.hex}15`)}
          >
            {icon}{label}
          </a>
        ))}
      </div>
    </div>
  )
}

function SkillsContent() {
  const accent = SECTION_ACCENT.skills.hex
  const skillCategories = [
    { category: "Frontend",          skills: ["React", "Next.js", "TypeScript", "Three.js", "Tailwind CSS"] },
    { category: "Backend",           skills: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"] },
    { category: "Tools & Practices", skills: ["Git", "Docker", "CI/CD", "Agile", "Testing"] },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Skills</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Technical Stack</h2>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />
      {skillCategories.map((cat) => (
        <div key={cat.category}>
          <h3 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: `${accent}cc` }}>{cat.category}</h3>
          <div className="flex flex-wrap gap-2">
            {cat.skills.map((skill) => (
              <span key={skill}
                className="px-3 py-1.5 text-xs font-mono rounded-lg transition-all duration-200 cursor-default"
                style={{ background: `${accent}12`, color: "rgba(255,255,255,0.7)", border: `1px solid ${accent}20` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.95)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}20`; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)" }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExperienceContent() {
  const accent = SECTION_ACCENT.experience.hex
  const experiences = [
    {
      role: "Senior Frontend Engineer", company: "NeuralTech Inc.", period: "2023 — Present",
      description: "Build and maintain critical UI components powering the AI dashboard. Lead a team of 4 on accessibility initiatives.",
      tech: ["React", "TypeScript", "Three.js", "WebGL"],
    },
    {
      role: "Full-Stack Developer", company: "DataFlow Systems", period: "2021 — 2023",
      description: "Developed real-time data visualization tools and API infrastructure serving 100K+ daily users.",
      tech: ["Next.js", "Node.js", "PostgreSQL", "D3.js"],
    },
    {
      role: "Frontend Developer", company: "CreativeStudio", period: "2019 — 2021",
      description: "Crafted interactive web experiences and marketing sites for enterprise clients across industries.",
      tech: ["React", "GSAP", "Sass", "WordPress"],
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Experience</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Work History</h2>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />
      <div className="flex flex-col gap-3">
        {experiences.map((exp) => (
          <div key={exp.role}
            className="flex flex-col gap-2 p-4 rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${accent}35`; el.style.background = "rgba(255,255,255,0.05)" }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.background = "rgba(255,255,255,0.03)" }}
          >
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-sm font-sans font-semibold text-white">{exp.role}</h3>
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{exp.period}</span>
            </div>
            <p className="text-xs font-mono" style={{ color: accent }}>{exp.company}</p>
            <p className="text-xs text-white/45 leading-relaxed">{exp.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {exp.tech.map(t => (
                <span key={t} className="px-2 py-0.5 text-xs font-mono rounded-md" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsContent() {
  const accent = SECTION_ACCENT.projects.hex
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const projects = [
    {
      name: "Neural Canvas",
      description: "Interactive 3D data visualization platform mapping complex datasets into navigable neural landscapes.",
      tech: ["Three.js", "React", "WebGL"],
      github: "#", demo: "#", icon: "🧠",
    },
    {
      name: "SynthFlow",
      description: "Real-time audio synthesis tool built with Web Audio API and custom DSP algorithms.",
      tech: ["TypeScript", "Web Audio", "Canvas"],
      github: "#", icon: "🎵",
    },
    {
      name: "DataGrid Pro",
      description: "High-performance table component handling 1M+ rows with virtual scrolling and custom renderers.",
      tech: ["React", "TypeScript", "WASM"],
      github: "#", demo: "#", icon: "📊",
    },
  ]

  const animNames = ["orbit-a", "orbit-b", "orbit-c"]
  const durations = [13, 16, 11]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Projects</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Selected Work</h2>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />

      {/* ── Orbital system ── */}
      <div className="relative flex items-center justify-center select-none" style={{ height: "280px" }}>
        {/* Orbit ring */}
        <div
          className="absolute pointer-events-none"
          style={{ width: "260px", height: "160px", border: `1px solid ${accent}18`, borderRadius: "50%" }}
        />

        {/* Center hub */}
        <div
          className="absolute z-10 flex flex-col items-center justify-center"
          style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${accent}10`, border: `1px solid ${accent}28`, boxShadow: `0 0 18px ${accent}12` }}
        >
          <span style={{ fontSize: "8px", fontFamily: "monospace", color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>work</span>
        </div>

        {/* Orbiting project cards */}
        {projects.map((proj, i) => (
          <div
            key={proj.name}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              animation: `${animNames[i]} ${durations[i]}s linear infinite`,
              animationPlayState: hoveredIdx === i ? "paused" : "running",
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              style={{
                transform: "translate(-50%, -50%)",
                width: "130px",
                background: hoveredIdx === i ? `${accent}16` : "rgba(255,255,255,0.04)",
                border: `1px solid ${hoveredIdx === i ? accent + "40" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                padding: "8px 10px",
                boxShadow: hoveredIdx === i ? `0 0 20px ${accent}18` : "none",
                transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span style={{ fontSize: "13px" }}>{proj.icon}</span>
                <span style={{ fontSize: "11px", fontFamily: "sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{proj.name}</span>
              </div>
              {hoveredIdx === i && (
                <>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.42)", lineHeight: 1.5, marginBottom: "6px" }}>{proj.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                    {proj.tech.slice(0, 2).map(t => (
                      <span key={t} style={{ fontSize: "9px", fontFamily: "monospace", padding: "1px 6px", borderRadius: "4px", background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {proj.github && <a href={proj.github} style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>gh ↗</a>}
                    {proj.demo   && <a href={proj.demo}   style={{ fontSize: "10px", fontFamily: "monospace", color: accent }}>demo ↗</a>}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <p style={{ position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)", fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
          HOVER TO PAUSE · CLICK TO EXPLORE
        </p>
      </div>

      {/* ── Full project cards ── */}
      <div className="flex flex-col gap-3">
        {projects.map(p => <ProjectCard key={p.name} accent={accent} {...p} />)}
      </div>
    </div>
  )
}

function ContactContent() {
  const accent = SECTION_ACCENT.contact.hex
  const links = [
    { href: "mailto:hello@example.com", icon: <Mail className="h-4 w-4" />, label: "Email",    sub: "hello@example.com" },
    { href: "#",                         icon: <Github className="h-4 w-4" />, label: "GitHub",   sub: "github.com/alexchen" },
    { href: "#",                         icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn", sub: "linkedin.com/in/alexchen" },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Contact</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Get In Touch</h2>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />
      <p className="text-sm text-white/50 leading-relaxed">
        Always interested in new projects and opportunities. Whether you have a question or just want to say hello, my inbox is open.
      </p>
      <div className="flex flex-col gap-2.5">
        {links.map(({ href, icon, label, sub }) => (
          <a key={label} href={href}
            className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${accent}40`; el.style.background = "rgba(255,255,255,0.06)" }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.background = "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0" style={{ background: `${accent}18` }}>
              <span style={{ color: accent }}>{icon}</span>
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-white">{label}</p>
              <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ─── Content map ─── */
const CONTENT_MAP: Record<string, () => React.JSX.Element> = {
  about:      AboutContent,
  skills:     SkillsContent,
  experience: ExperienceContent,
  projects:   ProjectsContent,
  contact:    ContactContent,
}

/* ─── Main panel ─── */
export default function ContentPanel({ activeNode, onClose }: { activeNode: string | null; onClose: () => void }) {
  const ContentComponent = activeNode ? CONTENT_MAP[activeNode] : null
  const accent = activeNode ? SECTION_ACCENT[activeNode] : SECTION_ACCENT.about
  const plexusColor = `rgb(${accent.rgb})`

  return (
    <div
      className={cn("fixed inset-0 z-50 transition-all duration-500 ease-out", activeNode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(5,8,22,0.82)", backdropFilter: "blur(2px)" }}>
        <MiniPlexus color={plexusColor} isVisible={activeNode !== null} />
      </div>

      {/* Click-outside */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Panel */}
      <div className="relative h-full flex items-center justify-center p-4 md:p-10">
        <div
          className={cn(
            "relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden transition-all duration-500",
            activeNode ? "scale-100 translate-y-0" : "scale-95 translate-y-6"
          )}
          style={{
            background: "rgba(8,7,20,0.80)",
            backdropFilter: "blur(28px)",
            border: `1px solid rgba(${accent.rgb}, 0.22)`,
            boxShadow: `0 0 60px rgba(${accent.rgb}, 0.08), 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Top glow line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, rgba(${accent.rgb}, 0.7) 50%, transparent)` }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: accent.hex }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: `rgba(${accent.rgb}, 0.7)` }}>
                {activeNode ? `node.${activeNode}` : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 text-white/30 hover:text-white/80"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              aria-label="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {ContentComponent && <ContentComponent />}
          </div>

          {/* Footer */}
          <div className="px-6 pb-4 flex-shrink-0">
            <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />
            <p className="text-xs font-mono text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
              Press <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>Esc</kbd> or click outside to return
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
