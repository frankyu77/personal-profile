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

/* ─── Section content components ─── */
function AboutContent() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: SECTION_ACCENT.about.hex }}>About Me</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white leading-tight mb-3" style={{ letterSpacing: "-0.02em" }}>
          Hello, I&apos;m Frank
        </h2>
        <p className="text-sm text-white/40 font-mono">
          Computer Science @ UBC • Minor in Commerce
        </p>
      </div>

      <div className="h-px" style={{ background: `linear-gradient(90deg, ${SECTION_ACCENT.about.hex}40, transparent)` }} />

      <p className="text-sm text-white/55 leading-relaxed">
        I&apos;m a third-year Computer Science student at the University of British Columbia, minoring in Commerce. 
        I enjoy building software that doesn&apos;t just work, but also solves meaningful problems and creates real value 
        for the people who use it.
      </p>

      <p className="text-sm text-white/55 leading-relaxed">
        My interests lies at the intersection of technology and business. I&apos;m fascinated by how great products 
        are created, where strong engineering meets thoughtful product thinking. Whether I&apos;m designing systems, 
        building applications, or experimenting with new ideas, I focus on creating tools that are scalable, 
        intuitive, and impactful.
      </p>

      <p className="text-sm text-white/55 leading-relaxed">
        I&apos;m especially drawn to fast-moving environments where ambitious ideas turn into products used by millions. 
        Long term, I want to build technology that shapes industries, the kind of software that quietly powers how 
        people work, connect, and create.
      </p>

      <p className="text-sm text-white/55 leading-relaxed">
        This website is a reflection of the ideas, projects, and experiments I&apos;ve worked on 
        while exploring the intersection of technology and business. Feel free to explore 
        the projects and experiences that have shaped my journey so far, and thanks for stopping by 😈.
      </p>

      <div className="flex gap-3 pt-1">
        {[
          { href: "https://github.com/frankyu77", icon: <Github className="h-4 w-4" />, label: "GitHub" },
          { href: "https://linkedin.com/in/frankyu77", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
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
    {
      category: "Languages",
      skills: [
        "Java",
        "Python",
        "C++",
        "C",
        "C#",
        "JavaScript",
        "TypeScript",
        "SQL",
        "Kotlin"
      ]
    },
    {
      category: "Frameworks & Libraries",
      skills: [
        "React",
        "Angular",
        "Spring Boot",
        "Express.js",
        "Scikit-learn",
        "PyTorch",
        "Java Swing"
      ]
    },
    {
      category: "Cloud & DevOps",
      skills: [
        "AWS",
        "Docker",
        "Kubernetes",
        "Jenkins",
        "Gradle",
        "Git",
        "Linux",
        "CI/CD"
      ]
    },
    {
      category: "Databases & APIs",
      skills: [
        "MySQL",
        "Oracle",
        "ArangoDB",
        "Firebase",
        "GraphQL",
        "REST APIs"
      ]
    },
    {
      category: "Systems & Engineering",
      skills: [
        "Distributed Systems",
        "System Design",
        "Concurrency",
        "Caching",
        "Unit Testing",
        "Integration Testing"
      ]
    },
    {
      category: "Data & Observability",
      skills: [
        "Machine Learning",
        "Reinforcement Learning",
        "Splunk",
        "Monitoring",
        "Logging Pipelines"
      ]
    }
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
      role: "Software Developer Intern", 
      company: "Pason Systems — Build & Infrastructure Team", 
      period: "Jan 2024 — Present",
      description:
        "Designed and scaled CI/CD infrastructure by migrating pipelines to auto-scaling AWS EC2 Docker runners using Terraform, improving build performance and reliability. Developed custom Gradle plugins for dependency governance, license compliance, and CI policy enforcement, adopted across 20+ repositories. Optimized build pipelines and caching strategies, reducing execution time and improving developer velocity across teams.",
      tech: ["Java", "Gradle", "AWS", "Docker", "Terraform", "CI/CD"],
    },
    {
      role: "Software Developer Intern", 
      company: "Pason Systems — Tier 3 / Systems Engineering Team", 
      period: "May 2024 - Dec 2024",
      description:
        "Built Python automation and diagnostic tooling for 300+ distributed Linux workstations, reducing provisioning and troubleshooting time by 50% and improving field reliability. Engineered and optimized Splunk pipelines processing 10K+ daily logs and metrics, enabling faster root cause analysis and reducing incident resolution time by 30%. Investigated production issues using complex SQL queries and system-level debugging across distributed environments.",
      tech: ["Python", "Linux", "Splunk", "SQL", "Systems Debugging"],
    },
    {
      role: "Teaching Assistant — CPSC 304", 
      company: "University of British Columbia", 
      period: "Jan 2025 — Apr 2025",
      description:
        "Taught database systems concepts including schema design, SQL, and scalable architectures to 30+ students. Mentored 500+ students building cloud-ready applications, with focus on performance tuning, query optimization, and API-to-database integration.",
      tech: ["SQL", "MySQL", "Oracle", "Database Design"],
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

const PROJECTS = [
  {
    name: "UBC Insight",
    shortDescription: "SQL-like query engine over 10,000+ course records",
    description: "Full-stack academic data query engine built on UBC's course and room datasets. Implements a custom SQL-like query language parser with support for complex filtering, grouping, and sorting. Features a REST API backend with persistent data management and a dynamic frontend for real-time query results.",
    tech: ["TypeScript", "Node.js", "REST API", "Mocha"],
    github: "https://github.com/frankyu77/UBC-Insight",
    icon: "🎓",
  },
  {
    name: "Nova",
    shortDescription: "Top-down 2D pixel art game in C — no engine",
    description: "Feature-complete top-down 2D pixel art adventure game written in C. Implements a custom game loop, sprite rendering pipeline, tile-based collision detection, and entity state machines from scratch, no game engine. Manages a 232MB asset pipeline including sprite sheets, tilemaps, and audio.",
    tech: ["C", "SDL2", "Game Physics", "Pixel Art"],
    github: "https://github.com/frankyu77/Nova",
    icon: "🎮",
  },
  {
    name: "Maze Pathfinder",
    shortDescription: "Visual comparison of BFS, DFS, Dijkstra's, and A*",
    description: "Interactive visualizer for classic graph traversal algorithms including BFS, DFS, Dijkstra's, and A*. Built in C++ with real-time animated rendering, allowing side-by-side comparison of algorithm efficiency across procedurally generated mazes.",
    tech: ["C++", "Algorithms", "Graph Theory"],
    github: "https://github.com/frankyu77/Maze_Pathfinder",
    icon: "🧩",
  },
  {
    name: "Gemini Hackathon",
    shortDescription: "Android + Gemini AI app shipped under hackathon time",
    description: "Android application built at a competitive hackathon integrating Google's Gemini AI API. Designed and shipped a working Kotlin app under time constraints, demonstrating rapid prototyping ability and applied LLM integration with on-device mobile UX.",
    tech: ["Kotlin", "Android", "Gemini API", "Jetpack Compose"],
    github: "https://github.com/frankyu77/geminihackathon",
    icon: "🤖",
  },
  {
    name: "Pokémon Tracker",
    shortDescription: "Full PokéAPI web app with team builder and stat viewer",
    description: "Full-featured web app consuming the PokéAPI to browse, search, and track Pokémon across all generations. Implements client-side filtering, dynamic rendering of stats and type matchups, and persistent team-building state.",
    tech: ["JavaScript", "REST API", "HTML/CSS"],
    github: "https://github.com/frankyu77/Pokemon-Tracker",
    icon: "⚡",
  },
  {
    name: "Tetris",
    shortDescription: "Tetris clone with SRS rotation and custom renderer in C#",
    description: "Full clone of Tetris built in C# with a custom rendering engine, piece rotation logic using the Super Rotation System (SRS), progressive difficulty scaling, and a high-score system. Clean separation between game logic, state, and rendering layers.",
    tech: ["C#", "OOP", "Game Logic"],
    github: "https://github.com/frankyu77/Tetris",
    icon: "🟦",
  },
  {
    name: "Blackjack",
    shortDescription: "Blackjack engine with splits, doubles, and dealer AI",
    description: "Console-based Blackjack engine in Java implementing the full ruleset including splits, doubles, and dealer AI. Architected with clean OOP principles with separated deck, hand, player, and game controller classes.",
    tech: ["Java", "OOP", "Design Patterns"],
    github: "https://github.com/frankyu77/Blackjack",
    icon: "🃏",
  },
  {
    name: "Personal Profile",
    shortDescription: "This interactive 3D neural network portfolio site",
    description: "This portfolio site is a modern, animated developer profile built with TypeScript and React Three Fiber. Features an interactive 3D neural network, glassmorphism panels, particle trails, and a starfield with mouse parallax.",
    tech: ["TypeScript", "React", "Three.js", "Tailwind"],
    github: "https://github.com/frankyu77/personal-profile",
    icon: "🌐",
  },
]

// Ring layout: outer 5 nodes, inner 3 nodes
const ORBIT_LAYOUT = PROJECTS.map((_, i) => {
  if (i < 5) {
    return { rx: 138, ry: 86, startAngle: (i / 5) * Math.PI * 2 - Math.PI / 2, duration: 34, dir: 1  }
  }
  const j = i - 5
  return   { rx: 72,  ry: 45, startAngle: (j / 3) * Math.PI * 2 - Math.PI / 2 + Math.PI / 3, duration: 22, dir: -1 }
})

function ProjectsContent() {
  const accent   = SECTION_ACCENT.projects.hex
  const accentRg = SECTION_ACCENT.projects.rgb

  const [focusedIdx,  setFocusedIdx]  = useState<number | null>(null)
  const [activeIdx,   setActiveIdx]   = useState<number | null>(null)
  const [cardVisible, setCardVisible] = useState(false)   // drives enter animation

  const nodeRefs  = useRef<(HTMLDivElement | null)[]>([])
  const pausedRef = useRef(false)
  const rafRef    = useRef(0)

  // Card enter animation — small delay so CSS transition fires after mount
  useEffect(() => {
    if (activeIdx !== null) {
      const t = setTimeout(() => setCardVisible(true), 16)
      return () => clearTimeout(t)
    } else {
      setCardVisible(false)
    }
  }, [activeIdx])

  // RAF orbit — direct DOM writes only, zero React re-renders per frame
  useEffect(() => {
    let acc = 0, last = performance.now()
    const tick = (now: number) => {
      if (!pausedRef.current) acc += now - last
      last = now
      nodeRefs.current.forEach((el, i) => {
        if (!el) return
        const { rx, ry, startAngle, duration, dir } = ORBIT_LAYOUT[i]
        const theta = startAngle + (acc / 1000) * (Math.PI * 2 / duration) * dir
        el.style.transform = `translate(calc(-50% + ${Math.cos(theta) * rx}px), calc(-50% + ${Math.sin(theta) * ry}px))`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleHover   = (i: number) => { setFocusedIdx(i); pausedRef.current = true }
  const handleUnhover = ()           => { setFocusedIdx(null); if (activeIdx === null) pausedRef.current = false }
  const handleClick   = (i: number) => {
    const next = activeIdx === i ? null : i
    setActiveIdx(next)
    setFocusedIdx(null)
    pausedRef.current = next !== null
  }
  const handleClose = () => { setActiveIdx(null); pausedRef.current = false }

  const proj = activeIdx !== null ? PROJECTS[activeIdx] : focusedIdx !== null ? PROJECTS[focusedIdx] : null

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Projects</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Selected Work</h2>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />

      {/* ── Orbital system ── */}
      <div className="relative flex items-center justify-center select-none" style={{ height: "300px", overflow: "visible" }}>
        {/* Ring outlines */}
        <div className="absolute pointer-events-none" style={{ width: "276px", height: "172px", border: `1px solid ${accent}14`, borderRadius: "50%" }} />
        <div className="absolute pointer-events-none" style={{ width: "144px", height: "90px",  border: `1px solid ${accent}0c`, borderRadius: "50%" }} />

        {/* Central hub */}
        <div className="absolute z-10 flex items-center justify-center"
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: `${accent}0e`, border: `1px solid ${accent}30`, boxShadow: `0 0 18px ${accent}18` }}>
          <Code2 style={{ width: "14px", height: "14px", color: accent, opacity: 0.65 }} />
        </div>

        {/* Orbit nodes */}
        {PROJECTS.map((p, i) => {
          const isFocused = focusedIdx === i
          const isActive  = activeIdx  === i
          const isDimmed  = (focusedIdx !== null && !isFocused) || (activeIdx !== null && !isActive)
          const isLit     = isFocused || isActive
          return (
            <div
              key={p.name}
              ref={el => { nodeRefs.current[i] = el }}
              className="absolute"
              style={{ top: "50%", left: "50%", zIndex: isLit ? 15 : 5 }}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={handleUnhover}
              onClick={() => handleClick(i)}
            >
              {/*
                Outer div: only has position (RAF updates its transform).
                Inner div: handles scale + opacity (React state).
              */}
              <div style={{
                transform: `translate(-50%, -50%) scale(${isLit ? 1.15 : 1})`,
                opacity: isDimmed ? 0.18 : 1,
                transition: "opacity 0.28s ease, transform 0.22s cubic-bezier(0.16,1,0.3,1)",
                cursor: "pointer",
                position: "relative",
              }}>
                {/* Ambient glow — separate element so it doesn't affect layout */}
                <div style={{
                  position: "absolute", inset: "-12px", borderRadius: "50%", pointerEvents: "none",
                  background: isLit ? `radial-gradient(circle, ${accent}18 0%, transparent 70%)` : "none",
                  boxShadow: isLit ? `0 0 20px ${accent}45` : `0 0 6px ${accent}14`,
                  transition: "box-shadow 0.28s ease, background 0.28s ease",
                }} />

                {/* Node circle */}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: isLit
                    ? `radial-gradient(circle at 38% 38%, ${accent}30, ${accent}12)`
                    : `radial-gradient(circle at 38% 38%, ${accent}14, ${accent}08)`,
                  border: `1.5px solid ${isLit ? accent + "65" : accent + "25"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.28s ease, border-color 0.28s ease",
                }}>
                  {/*
                    Fixed 20×20 bounding box so every emoji occupies the same space.
                    fontSize slightly below box height so tall glyphs don't clip.
                  */}
                  <span style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "20px", height: "20px",
                    fontSize: "13px", lineHeight: "20px",
                    marginTop: "1px",   /* optical correction for emoji baseline */
                  }}>
                    {p.icon}
                  </span>
                </div>

                {/* Label — hidden by default, fades in on hover/active */}
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  marginTop: "7px", whiteSpace: "nowrap", pointerEvents: "none",
                  fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.88)",
                  opacity: isLit ? 1 : 0,
                  transition: "opacity 0.2s ease",
                }}>
                  {p.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Info / Detail panel ── */}
      <div style={{ minHeight: "72px" }}>

        {/* ── Expanded project card ── */}
        {activeIdx !== null && proj && (
          <div style={{
            position: "relative", overflow: "hidden",
            borderRadius: "18px",
            background: `linear-gradient(145deg, rgba(18,12,36,0.98), rgba(10,7,22,0.98))`,
            border: `1px solid rgba(${accentRg}, 0.28)`,
            boxShadow: `0 0 48px rgba(${accentRg}, 0.08), 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
            opacity:    cardVisible ? 1 : 0,
            transform:  cardVisible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.97)",
            transition: "opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`, opacity: 0.7 }} />
            {/* Ambient radial glow */}
            <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "280px", height: "180px", borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${accentRg},0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ padding: "22px 22px 20px" }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Project icon — same fixed bounding box as orbit node */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                    background: `radial-gradient(circle at 38% 38%, ${accent}28, ${accent}10)`,
                    border: `1px solid ${accent}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", fontSize: "14px", lineHeight: "20px", marginTop: "1px" }}>
                      {proj.icon}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontFamily: "var(--font-space, sans-serif)", fontWeight: 700, color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      {proj.name}
                    </h3>
                    <p style={{ margin: "3px 0 0", fontSize: "10px", fontFamily: "monospace", color: `rgba(${accentRg}, 0.6)`, letterSpacing: "0.08em" }}>
                      {proj.shortDescription}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    flexShrink: 0, width: "26px", height: "26px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)" }}
                >×</button>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: `linear-gradient(90deg, rgba(${accentRg},0.2), transparent)`, marginBottom: "14px" }} />

              {/* Description */}
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.75 }}>
                {proj.description}
              </p>

              {/* Tech tags — full pill */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                {proj.tech.map(t => (
                  <span key={t} style={{
                    fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.05em",
                    padding: "4px 10px", borderRadius: "100px",
                    background: `rgba(${accentRg}, 0.09)`,
                    color: `rgba(${accentRg}, 0.9)`,
                    border: `1px solid rgba(${accentRg}, 0.22)`,
                    boxShadow: `0 0 6px rgba(${accentRg}, 0.06)`,
                  }}>{t}</span>
                ))}
              </div>

              {/* CTA */}
              {proj.github && (
                <a
                  href={proj.github} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.75)",
                    background: `rgba(${accentRg}, 0.10)`,
                    border: `1px solid rgba(${accentRg}, 0.30)`,
                    padding: "9px 16px", borderRadius: "10px",
                    textDecoration: "none",
                    transition: "background 0.2s, border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `rgba(${accentRg}, 0.18)`; el.style.borderColor = `rgba(${accentRg}, 0.55)`; el.style.color = "white" }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = `rgba(${accentRg}, 0.10)`; el.style.borderColor = `rgba(${accentRg}, 0.30)`; el.style.color = "rgba(255,255,255,0.75)" }}
                >
                  <ExternalLink style={{ width: "11px", height: "11px", flexShrink: 0 }} />
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Hover preview bar ── */}
        {activeIdx === null && focusedIdx !== null && proj && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "4px" }}>
            {/* Left accent + name row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "2px", height: "28px", borderRadius: "2px", background: `linear-gradient(to bottom, ${accent}, ${accent}44)`, flexShrink: 0 }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontFamily: "sans-serif", fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>{proj.name}</span>
                  <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>CLICK TO EXPAND</span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.42)", lineHeight: 1.4 }}>{proj.shortDescription}</p>
              </div>
            </div>
            {/* Tags */}
            <div style={{ display: "flex", gap: "5px", paddingLeft: "12px" }}>
              {proj.tech.slice(0, 3).map(t => (
                <span key={t} style={{ fontSize: "9px", fontFamily: "monospace", padding: "3px 9px", borderRadius: "100px", background: `rgba(${accentRg}, 0.09)`, color: `rgba(${accentRg}, 0.85)`, border: `1px solid rgba(${accentRg}, 0.20)` }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Default hint ── */}
        {activeIdx === null && focusedIdx === null && (
          <p style={{ textAlign: "center", paddingTop: "22px", fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.16)", letterSpacing: "0.18em" }}>
            HOVER TO PREVIEW · CLICK TO EXPAND
          </p>
        )}
      </div>
    </div>
  )
}

function ContactContent() {
  const accent = SECTION_ACCENT.contact.hex
  const links = [
    { href: "mailto:frankkaiwen.yu@gmail.com", icon: <Mail className="h-4 w-4" />, label: "Email", sub: "frankkaiwen.yu@gmail.com" },
    { href: "https://github.com/frankyu77", icon: <Github className="h-4 w-4" />, label: "GitHub", sub: "github.com/frankyu77" },
    { href: "https://linkedin.com/in/frankyu77", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn", sub: "linkedin.com/in/frankyu77" },
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
              Press <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>Esc</kbd> or click 'x' to return
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
