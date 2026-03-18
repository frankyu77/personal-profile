"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { X, Github, Linkedin, Mail, ExternalLink, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ProfileImage from "@/components/profile-image"

/* ─── Section accent palette ─── */
const SECTION_ACCENT: Record<string, { hex: string; rgb: string }> = {
  about:      { hex: "#8b5cf6", rgb: "139,92,246"  },
  skills:     { hex: "#22d3ee", rgb: "34,211,238"  },
  experience: { hex: "#3b82f6", rgb: "59,130,246"  },
  projects:   { hex: "#8b5cf6", rgb: "139,92,246"  },
  contact:    { hex: "#ec4899", rgb: "236,72,153"  },
  life:       { hex: "#f59e0b", rgb: "245,158,11"  },
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

const FOCUS_AREAS = [
  "Scalable backend systems",
  "Developer tooling & infrastructure",
  "Data pipelines & performance",
  "Full-stack applications",
]

const QUICK_FACTS = [
  { label: "Location",  value: "Calgary, AB"           },
  { label: "School",    value: "UBC"                   },
  { label: "Degree",    value: "CS + Commerce"         },
  { label: "Interests", value: "Systems · infra · product" },
  { label: "Status",    value: "Open to opportunities", highlight: true },
]

function AboutContent() {
  const accent    = SECTION_ACCENT.about.hex
  const accentRgb = SECTION_ACCENT.about.rgb
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* ── Eyebrow ── */}
      <div style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.45s ease 0.04s, transform 0.45s cubic-bezier(0.16,1,0.3,1) 0.04s",
      }}>
        <p style={{ margin: 0, fontSize: "9.5px", fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: accent, marginBottom: "3px" }}>
          About / Profile
        </p>
        <p style={{ margin: 0, fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.22)", letterSpacing: "0.04em" }}>
          A quick overview of who I am and what I build
        </p>
      </div>

      <div style={{ height: "1px", background: `linear-gradient(90deg, ${accent}40, transparent)` }} />

      {/* ── 2-column body ── */}
      <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── LEFT: text ── */}
        <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>

          {/* Headline block */}
          <div style={{
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.45s ease 0.10s, transform 0.45s cubic-bezier(0.16,1,0.3,1) 0.10s",
          }}>
            {/* Name + inline AVAILABLE badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontFamily: "sans-serif", fontWeight: 700, color: "white", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Hello, I&apos;m Frank
              </h2>
              <span style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           "5px",
                padding:       "3px 9px 3px 7px",
                borderRadius:  "100px",
                background:    `rgba(${accentRgb},0.12)`,
                border:        `1px solid rgba(${accentRgb},0.28)`,
                fontSize:      "7.5px",
                fontFamily:    "monospace",
                letterSpacing: "0.13em",
                color:         "rgba(167,139,250,0.85)",
                flexShrink:    0,
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: accent, boxShadow: `0 0 6px ${accent}`,
                  display: "inline-block", flexShrink: 0,
                  animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                }} />
                AVAILABLE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", color: `rgba(${accentRgb},0.70)`, letterSpacing: "0.01em" }}>
              CS @ UBC · Building scalable systems &amp; developer tools
            </p>
          </div>

          {/* Short intro */}
          <p style={{
            margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.52)", lineHeight: 1.72, fontFamily: "sans-serif",
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.45s ease 0.18s, transform 0.45s cubic-bezier(0.16,1,0.3,1) 0.18s",
          }}>
            I&apos;m a software developer focused on <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>scalable systems</strong>,{" "}
            <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>developer tooling</strong>, and data-driven applications.
            I thrive at the intersection of engineering and product — turning complex problems into clean, reliable solutions.
          </p>

          {/* Focus areas */}
          <div style={{
            opacity:    mounted ? 1 : 0,
            transition: "opacity 0.4s ease 0.24s",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: `rgba(${accentRgb},0.55)` }}>
              What I Work On
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {FOCUS_AREAS.map((area, i) => (
                <div key={i} style={{
                  display:    "flex",
                  gap:        "9px",
                  alignItems: "center",
                  opacity:    mounted ? 1 : 0,
                  transform:  mounted ? "translateX(0)" : "translateX(-10px)",
                  transition: `opacity 0.38s ease ${0.28 + i * 0.07}s, transform 0.38s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.07}s`,
                }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "1px", background: accent, flexShrink: 0, opacity: 0.7 }} />
                  <span style={{ fontSize: "11.5px", fontFamily: "monospace", color: "rgba(255,255,255,0.50)", letterSpacing: "0.01em" }}>
                    {area}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact statement */}
          <p style={{
            margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.36)", lineHeight: 1.72, fontFamily: "sans-serif", fontStyle: "italic",
            borderLeft: `2px solid ${accent}30`,
            paddingLeft: "12px",
            opacity:    mounted ? 1 : 0,
            transition: "opacity 0.4s ease 0.58s",
          }}>
            Especially drawn to fast-paced environments where ambitious ideas turn into products
            used at scale. Long term, I want to build the software that quietly powers how
            people work, collaborate, and decide.
          </p>

          {/* CTA row */}
          <div style={{
            display: "flex", gap: "8px", flexWrap: "wrap",
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.4s ease 0.64s, transform 0.4s ease 0.64s",
          }}>
            {[
              { href: "https://github.com/frankyu77",       icon: <Github   className="h-3.5 w-3.5" />, label: "GitHub"   },
              { href: "https://linkedin.com/in/frankyu77", icon: <Linkedin className="h-3.5 w-3.5" />, label: "LinkedIn" },
            ].map(({ href, icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  fontSize: "11px", fontFamily: "monospace",
                  background: `rgba(${accentRgb},0.10)`,
                  color: `rgba(${accentRgb},0.85)`,
                  border: `1px solid rgba(${accentRgb},0.22)`,
                  textDecoration: "none",
                  transition: "background 0.18s ease, border-color 0.18s ease",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `rgba(${accentRgb},0.20)`; el.style.borderColor = `rgba(${accentRgb},0.40)` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = `rgba(${accentRgb},0.10)`; el.style.borderColor = `rgba(${accentRgb},0.22)` }}
              >
                {icon}{label}
              </a>
            ))}
          </div>

        </div>

        {/* ── RIGHT: image + quick facts ── */}
        <div style={{
          flexShrink: 0,
          display:    "flex",
          flexDirection: "column",
          gap:        "12px",
          alignItems: "stretch",
          width:      "clamp(180px, 22vw, 230px)",
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.12s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.12s",
        }}>

          <ProfileImage />

          {/* ── Quick Facts card ── */}
          <div style={{
            borderRadius:   "14px",
            padding:        "13px 14px",
            background:     "rgba(255,255,255,0.03)",
            border:         `1px solid rgba(${accentRgb},0.15)`,
            backdropFilter: "blur(12px)",
            boxShadow:      `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`,
            display:        "flex",
            flexDirection:  "column",
            gap:            "9px",
          }}>
            <p style={{ margin: 0, fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: `rgba(${accentRgb},0.45)`, marginBottom: "2px" }}>
              Quick Facts
            </p>
            {QUICK_FACTS.map((fact, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "8.5px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", flexShrink: 0, paddingTop: "1px" }}>
                  {fact.label}
                </span>
                <span style={{
                  fontSize:      "8.5px",
                  fontFamily:    "monospace",
                  letterSpacing: "0.02em",
                  textAlign:     "right",
                  color:         fact.highlight ? accent : "rgba(255,255,255,0.58)",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "4px",
                }}>
                  {fact.highlight && (
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}`, display: "inline-block", flexShrink: 0 }} />
                  )}
                  {fact.value}
                </span>
              </div>
            ))}
          </div>

        </div>

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

/* ─── Experience data ─── */
interface ExpItem {
  id: string; role: string; team: string; company: string
  period: string; isCurrent: boolean; color: string
  bullets: string[]; tech: string[]
}

const EXP_DATA: ExpItem[] = [
  {
    id: "tier3",
    role: "Software Developer Intern",
    team: "Tier 3 / Systems Engineering",
    company: "Pason Systems",
    period: "Jan 2024 — Present", 
    isCurrent: true,
    color: "#8b5cf6",
    bullets: [
      "Automated provisioning & diagnostics for 300+ distributed Linux workstations — 50% less setup time",
      "Built Splunk pipelines processing 10K+ logs/day — reduced incident resolution time by 30%",
      "Debugged production issues via complex SQL across distributed multi-site environments",
    ],
    tech: ["Python", "Linux", "Splunk", "SQL", "Systems Debugging"],
  },
    {
    id: "build",
    role: "Software Developer Intern",
    team: "Build & Infrastructure",
    company: "Pason Systems",
    period: "May 2024 — Dec 2024",
    isCurrent: false,
    color: "#3b82f6",
    bullets: [
      "Migrated CI/CD pipelines to auto-scaling AWS EC2 Docker runners via Terraform — 60% faster builds",
      "Built Gradle plugins for dependency governance & license compliance, adopted across 20+ repos",
      "Designed caching strategies that cut pipeline execution time and improved team-wide developer velocity",
    ],
    tech: ["Java", "Gradle", "AWS", "Docker", "Terraform", "CI/CD"],
  },
  {
    id: "ta",
    role: "Teaching Assistant — CPSC 304",
    team: "Relational Databases",
    company: "University of British Columbia",
    period: "Jan 2025 — Apr 2025",
    isCurrent: false,
    color: "#22d3ee",
    bullets: [
      "Led weekly labs for 30+ students on schema design, SQL optimization, and scalable architectures",
      "Mentored 500+ students on cloud-ready app design and API-to-database integration patterns",
    ],
    tech: ["SQL", "MySQL", "Oracle", "Database Design"],
  },
]

function ExperienceCard({ exp, index, mounted }: { exp: ExpItem; index: number; mounted: boolean }) {
  const [hovered, setHovered] = useState(false)
  const isFirst = index === 0
  const delay   = `${index * 0.14 + 0.06}s`

  return (
    <div style={{
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 0.5s ease ${delay}, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}`,
    }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:  "relative",
          padding:   "16px 18px",
          borderRadius: "14px",
          background: isFirst
            ? `linear-gradient(145deg, rgba(59,130,246,0.07) 0%, rgba(8,6,20,0.88) 100%)`
            : "rgba(255,255,255,0.025)",
          border: `1px solid ${hovered ? exp.color + "55" : isFirst ? exp.color + "32" : "rgba(255,255,255,0.07)"}`,
          boxShadow:  hovered
            ? `0 8px 28px rgba(0,0,0,0.28), 0 0 28px ${exp.color}08`
            : isFirst ? `0 0 24px ${exp.color}06` : "none",
          transform:  hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        }}
      >
        {/* Top accent line — current role only */}
        {isFirst && (
          <div style={{
            position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
            background: `linear-gradient(90deg, transparent, ${exp.color}55, transparent)`,
          }} />
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "3px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "3px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontFamily: "sans-serif", fontWeight: 700, color: "white", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {exp.role}
              </h3>
              {exp.isCurrent && (
                <span style={{
                  fontSize: "7.5px", fontFamily: "monospace", letterSpacing: "0.12em",
                  padding: "2px 7px", borderRadius: "100px",
                  background: `${exp.color}1a`, color: exp.color,
                  border: `1px solid ${exp.color}45`,
                }}>CURRENT</span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", color: `${exp.color}bb`, letterSpacing: "0.02em" }}>
              {exp.company}{exp.team ? ` — ${exp.team}` : ""}
            </p>
          </div>
          <span style={{
            fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0, paddingTop: "2px",
          }}>
            {exp.period}
          </span>
        </div>

        <div style={{ height: "1px", background: `linear-gradient(90deg, ${exp.color}1a, transparent)`, margin: "10px 0" }} />

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
          {exp.bullets.map((bullet, j) => (
            <div key={j} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <div style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: exp.color, flexShrink: 0, marginTop: "5px",
                boxShadow: `0 0 4px ${exp.color}55`,
              }} />
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.52)", fontFamily: "monospace", lineHeight: 1.68 }}>
                {bullet}
              </p>
            </div>
          ))}
        </div>

        {/* Tech pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {exp.tech.map(t => (
            <span key={t} style={{
              fontSize: "8.5px", fontFamily: "monospace", letterSpacing: "0.04em",
              padding: "2.5px 8px", borderRadius: "100px",
              background: `${exp.color}0e`, color: `${exp.color}cc`,
              border: `1px solid ${exp.color}22`,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExperienceContent() {
  const accent = SECTION_ACCENT.experience.hex
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Experience</p>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
          Professional Experience
        </h2>
        <p className="text-xs font-mono mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.30)" }}>
          Building scalable systems, developer tools, and production infrastructure.
        </p>
      </div>
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />

      {/* ── Vertical timeline ── */}
      <div style={{ position: "relative" }}>

        {/* Vertical gradient line — draws from top on mount */}
        <div style={{
          position:        "absolute",
          left:            "4px",
          top:             "25px",
          bottom:          "0",
          width:           "1px",
          background:      "linear-gradient(to bottom, #3b82f6 0%, #8b5cf6 45%, #22d3ee 78%, transparent 100%)",
          opacity:          mounted ? 0.28 : 0,
          transform:        mounted ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "top",
          transition:      "transform 0.95s cubic-bezier(0.16,1,0.3,1) 0.08s, opacity 0.5s ease 0.08s",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {EXP_DATA.map((exp, i) => (
            <div key={exp.id} style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>

              {/* Timeline dot */}
              <div style={{
                flexShrink: 0,
                width:      "10px",
                height:     "10px",
                borderRadius: "50%",
                marginTop:  "20px",
                background: exp.color,
                boxShadow:  `0 0 ${exp.isCurrent ? "10px" : "6px"} ${exp.color}${exp.isCurrent ? "80" : "50"}`,
                position:   "relative",
                zIndex:     1,
                opacity:    mounted ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.14 + 0.05}s`,
              }} />

              {/* Card */}
              <div style={{ flex: 1 }}>
                <ExperienceCard exp={exp} index={i} mounted={mounted} />
              </div>
            </div>
          ))}
        </div>
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
        <div className="absolute pointer-events-none" style={{ width: "276px", height: "172px", border: `1px solid ${accent}60`, borderRadius: "50%", boxShadow: `0 0 12px ${accent}18, inset 0 0 12px ${accent}08` }} />
        <div className="absolute pointer-events-none" style={{ width: "144px", height: "90px",  border: `1px solid ${accent}42`, borderRadius: "50%", boxShadow: `0 0 8px ${accent}12`  }} />

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

/* ─── Life / Beyond Code ─── */
interface LifeItem {
  src: string
  title: string
  description: string
  category: string
  tall?: boolean
}

const LIFE_ITEMS: LifeItem[] = [
  {
    src: "/life/skiing.jpg",
    title: "Skiing Whistler",
    description: "Weekend escapes to BC mountains — my favorite way to reset after a long semester.",
    category: "Adventures",
    tall: false,
  },
  {
    src: "/life/hiking.jpg",
    title: "Garibaldi Lake",
    description: "13km of pure BC alpine beauty. Worth every step and every sore leg the next day.",
    category: "Adventures",
    tall: true,
  },
  {
    src: "/life/japan.jpg",
    title: "Tokyo, Japan",
    description: "Summer trip through Japan — the food, the trains, the vending machines. Unreal city.",
    category: "Travel",
    tall: true,
  },
  {
    src: "/life/bball.jpg",
    title: "Basketball",
    description: "Weekly pickup runs at UBC. Nothing beats a good game with friends after a long week.",
    category: "Sports",
    tall: false,
  },
  {
    src: "/life/hk.jpg",
    title: "Hong Kong",
    description: "Grew up between here and Vancouver. Always feels like coming home.",
    category: "Travel",
    tall: false,
  },
  {
    src: "/life/snowboard.jpg",
    title: "Snowboarding",
    description: "Still learning but making progress. Cypress Mountain every chance I get.",
    category: "Adventures",
    tall: true,
  },
  {
    src: "/life/food.jpg",
    title: "Ramen Research",
    description: "Methodically trying every ramen spot in Vancouver. It's serious work, really.",
    category: "Life",
    tall: false,
  },
  {
    src: "/life/sunset.jpg",
    title: "UBC Sunsets",
    description: "The cliffs at UBC at golden hour. Hard to beat when you need to clear your head.",
    category: "Life",
    tall: false,
  },
]

const FALLBACK_GRADIENTS: Record<string, string> = {
  Adventures: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
  Travel:     "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
  Sports:     "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
  Life:       "linear-gradient(135deg, #451a03 0%, #b45309 100%)",
}

function ImageCard({ item, onClick, accent }: { item: LifeItem; onClick: () => void; accent: string }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const height = item.tall ? "188px" : "132px"

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", height, borderRadius: "12px", overflow: "hidden",
        cursor: "pointer", flexShrink: 0,
        background: FALLBACK_GRADIENTS[item.category] ?? "linear-gradient(135deg, #374151, #1f2937)",
      }}
    >
      {!imgError && (
        <img
          src={item.src}
          alt={item.title}
          onError={() => setImgError(true)}
          loading="lazy"
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, transition: "background 0.3s ease",
        background: hovered
          ? "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)"
          : "linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)",
      }} />

      {/* Text overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px",
        transform: hovered ? "translateY(0)" : "translateY(2px)",
        transition: "transform 0.3s ease",
      }}>
        <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "white", fontFamily: "sans-serif", lineHeight: 1.3 }}>
          {item.title}
        </p>
        <p style={{
          margin: "3px 0 0", fontSize: "9.5px", color: "rgba(255,255,255,0.68)",
          fontFamily: "monospace", lineHeight: 1.45,
          maxHeight: hovered ? "40px" : "0px", overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.3s ease",
          opacity: hovered ? 1 : 0,
        }}>
          {item.description}
        </p>
      </div>

      {/* Category badge */}
      <div style={{
        position: "absolute", top: "8px", right: "8px",
        fontSize: "7.5px", fontFamily: "monospace", letterSpacing: "0.1em",
        padding: "2px 7px", borderRadius: "100px",
        background: `${accent}28`, color: accent,
        border: `1px solid ${accent}50`,
        backdropFilter: "blur(8px)",
      }}>
        {item.category}
      </div>
    </div>
  )
}

function Lightbox({
  item, totalCount, currentIdx, onClose, onPrev, onNext, accent,
}: {
  item: LifeItem; totalCount: number; currentIdx: number
  onClose: () => void; onPrev: () => void; onNext: () => void; accent: string
}) {
  const [imgError, setImgError] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setImgError(false)
    const t = setTimeout(() => setVisible(true), 16)
    return () => clearTimeout(t)
  }, [currentIdx])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.stopImmediatePropagation(); onPrev() }
      if (e.key === "ArrowRight") { e.stopImmediatePropagation(); onNext() }
    }
    window.addEventListener("keydown", handleKey, true)
    return () => window.removeEventListener("keydown", handleKey, true)
  }, [onPrev, onNext])

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.94)", backdropFilter: "blur(16px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px",
        opacity: visible ? 1 : 0, transition: "opacity 0.25s ease",
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "540px" }}>

        {/* Counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: `${accent}99`, letterSpacing: "0.2em" }}>
            {item.category.toUpperCase()}
          </span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            {currentIdx + 1} / {totalCount}
          </span>
        </div>

        {/* Image */}
        <div style={{
          borderRadius: "16px", overflow: "hidden", position: "relative",
          background: FALLBACK_GRADIENTS[item.category] ?? "#1f2937",
          transform: visible ? "scale(1)" : "scale(0.96)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {!imgError && (
            <img
              src={item.src}
              alt={item.title}
              onError={() => setImgError(true)}
              style={{ width: "100%", maxHeight: "52vh", objectFit: "cover", display: "block" }}
            />
          )}
          {imgError && (
            <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
                — photo coming soon —
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ marginTop: "18px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontFamily: "sans-serif", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
            {item.title}
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.52)", fontFamily: "monospace", lineHeight: 1.65 }}>
            {item.description}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          {[
            { label: "← prev", action: onPrev },
            { label: "✕ close", action: onClose, primary: true },
            { label: "next →", action: onNext },
          ].map(({ label, action, primary }) => (
            <button
              key={label}
              onClick={action}
              style={{
                flex: primary ? 2 : 1, padding: "10px 0", borderRadius: "10px", cursor: "pointer",
                fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em",
                background: primary ? `${accent}18` : "rgba(255,255,255,0.05)",
                color: primary ? accent : "rgba(255,255,255,0.45)",
                border: `1px solid ${primary ? accent + "40" : "rgba(255,255,255,0.10)"}`,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = primary ? `${accent}28` : "rgba(255,255,255,0.10)"
                el.style.color      = primary ? accent : "rgba(255,255,255,0.75)"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = primary ? `${accent}18` : "rgba(255,255,255,0.05)"
                el.style.color      = primary ? accent : "rgba(255,255,255,0.45)"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LifeContent() {
  const accent = SECTION_ACCENT.life.hex
  const CATEGORIES = ["All", "Adventures", "Travel", "Sports", "Life"]

  const [filter,   setFilter]   = useState("All")
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = filter === "All" ? LIFE_ITEMS : LIFE_ITEMS.filter(i => i.category === filter)

  const openLightbox = (filteredIdx: number) => {
    // store index into LIFE_ITEMS (not filtered array) so prev/next work on full list
    const globalIdx = LIFE_ITEMS.indexOf(filtered[filteredIdx])
    setLightbox(globalIdx)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-mono tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>Beyond Code</p>
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Life Outside Work</h2>
        </div>
        <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }} />

        <p className="text-xs text-white/40 font-mono leading-relaxed">
          There&apos;s more to me than code. Here&apos;s what keeps me grounded, curious, and human.
        </p>

        {/* Category filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => {
            const active = filter === cat
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontSize: "8.5px", fontFamily: "monospace", letterSpacing: "0.12em",
                  padding: "4px 11px", borderRadius: "100px", cursor: "pointer",
                  background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
                  color:      active ? accent : "rgba(255,255,255,0.35)",
                  border:     `1px solid ${active ? accent + "50" : "rgba(255,255,255,0.09)"}`,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.65)"; el.style.borderColor = "rgba(255,255,255,0.20)" } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(255,255,255,0.35)"; el.style.borderColor = "rgba(255,255,255,0.09)" } }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Masonry grid — CSS columns for zero-JS masonry */}
        <div style={{ columns: "2", gap: "8px" }}>
          {filtered.map((item, i) => (
            <div key={`${item.src}-${i}`} style={{ breakInside: "avoid", marginBottom: "8px" }}>
              <ImageCard item={item} onClick={() => openLightbox(i)} accent={accent} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", padding: "32px 0", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
            NOTHING HERE YET
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          item={LIFE_ITEMS[lightbox]}
          totalCount={LIFE_ITEMS.length}
          currentIdx={lightbox}
          accent={accent}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((lightbox - 1 + LIFE_ITEMS.length) % LIFE_ITEMS.length)}
          onNext={() => setLightbox((lightbox + 1) % LIFE_ITEMS.length)}
        />
      )}
    </>
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
  life:       LifeContent,
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
            "relative w-full max-h-[88vh] flex flex-col rounded-2xl overflow-hidden transition-all duration-500",
            activeNode === "about" ? "max-w-2xl" : "max-w-xl",
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
