"use client"

import { useRef, useEffect, useCallback } from "react"
import { X, Github, Linkedin, Mail, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Mini plexus canvas background ─── */
function MiniPlexus({ color, isVisible }: { color: string; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([])

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    for (let i = 0; i < 80; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
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
      canvas.width = rect.width * window.devicePixelRatio
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
      const connDist = 140

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > rect.width) n.vx *= -1
        if (n.y < 0 || n.y > rect.height) n.vy *= -1
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.12
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
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = color.replace(")", ", 0.5)").replace("rgb", "rgba")
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    if (isVisible) draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [color, isVisible, initNodes])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  )
}

/* ─── Section content ─── */
function AboutContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-sans font-bold tracking-tight text-foreground text-balance">
          Hello, I{"'"}m Alex
        </h2>
        <p className="text-lg text-primary font-mono">
          Full-Stack Developer & Creative Technologist
        </p>
      </div>
      <div className="h-px bg-foreground/10" />
      <p className="text-muted-foreground leading-relaxed">
        I build accessible, pixel-perfect digital experiences for the web.
        My favorite work lies at the intersection of design and development,
        creating experiences that not only look great but are meticulously
        built for performance and usability.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        With a passion for emerging technologies and neural interfaces,
        I explore the boundaries between human interaction and digital systems.
        This portfolio itself is a reflection of that philosophy -- a living
        neural network you can explore.
      </p>
      <div className="flex gap-4 pt-2">
        <a href="#" className="flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors" aria-label="GitHub profile">
          <Github className="h-4 w-4" /><span>GitHub</span>
        </a>
        <a href="#" className="flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors" aria-label="LinkedIn profile">
          <Linkedin className="h-4 w-4" /><span>LinkedIn</span>
        </a>
      </div>
    </div>
  )
}

function SkillsContent() {
  const skillCategories = [
    { category: "Frontend", skills: ["React", "Next.js", "TypeScript", "Three.js", "Tailwind CSS"] },
    { category: "Backend", skills: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"] },
    { category: "Tools & Practices", skills: ["Git", "Docker", "CI/CD", "Agile", "Testing"] },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-sans font-bold tracking-tight text-foreground">Skills</h2>
      <div className="h-px bg-foreground/10" />
      {skillCategories.map((cat) => (
        <div key={cat.category} className="flex flex-col gap-3">
          <h3 className="text-sm font-mono uppercase tracking-widest text-primary">{cat.category}</h3>
          <div className="flex flex-wrap gap-2">
            {cat.skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 text-sm font-mono rounded-md bg-foreground/5 text-secondary-foreground border border-foreground/10 hover:border-primary/50 transition-colors">
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
  const experiences = [
    { role: "Senior Frontend Engineer", company: "NeuralTech Inc.", period: "2023 -- Present", description: "Build and maintain critical UI components powering the company's AI dashboard. Lead a team of 4 engineers on accessibility initiatives.", tech: ["React", "TypeScript", "Three.js", "WebGL"] },
    { role: "Full-Stack Developer", company: "DataFlow Systems", period: "2021 -- 2023", description: "Developed real-time data visualization tools and API infrastructure serving 100K+ daily users.", tech: ["Next.js", "Node.js", "PostgreSQL", "D3.js"] },
    { role: "Frontend Developer", company: "CreativeStudio", period: "2019 -- 2021", description: "Crafted interactive web experiences and marketing sites for enterprise clients across industries.", tech: ["React", "GSAP", "Sass", "WordPress"] },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-sans font-bold tracking-tight text-foreground">Experience</h2>
      <div className="h-px bg-foreground/10" />
      {experiences.map((exp) => (
        <div key={exp.role} className="flex flex-col gap-2 p-4 rounded-lg bg-foreground/5 border border-foreground/10 hover:border-primary/30 transition-colors">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="text-base font-sans font-semibold text-foreground">{exp.role}</h3>
            <span className="text-xs font-mono text-muted-foreground">{exp.period}</span>
          </div>
          <p className="text-sm font-mono text-primary">{exp.company}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {exp.tech.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs font-mono rounded bg-primary/10 text-primary">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsContent() {
  const projects = [
    { name: "Neural Canvas", description: "An interactive 3D data visualization platform that maps complex datasets into navigable neural landscapes.", tech: ["Three.js", "React", "WebGL"], link: "#" },
    { name: "SynthFlow", description: "Real-time audio synthesis tool built with Web Audio API and custom DSP algorithms.", tech: ["TypeScript", "Web Audio", "Canvas"], link: "#" },
    { name: "DataGrid Pro", description: "High-performance data table component handling 1M+ rows with virtual scrolling and custom renderers.", tech: ["React", "TypeScript", "WASM"], link: "#" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-sans font-bold tracking-tight text-foreground">Projects</h2>
      <div className="h-px bg-foreground/10" />
      {projects.map((proj) => (
        <a key={proj.name} href={proj.link} className="group flex flex-col gap-2 p-4 rounded-lg bg-foreground/5 border border-foreground/10 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-sans font-semibold text-foreground group-hover:text-primary transition-colors">{proj.name}</h3>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{proj.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {proj.tech.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs font-mono rounded bg-primary/10 text-primary">{t}</span>
            ))}
          </div>
        </a>
      ))}
    </div>
  )
}

function ContactContent() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-sans font-bold tracking-tight text-foreground">Contact</h2>
      <div className="h-px bg-foreground/10" />
      <p className="text-muted-foreground leading-relaxed">
        I{"'"}m always interested in hearing about new projects and opportunities.
        Whether you have a question or just want to say hello, feel free to reach out.
      </p>
      <div className="flex flex-col gap-4">
        <a href="mailto:hello@example.com" className="flex items-center gap-3 p-4 rounded-lg bg-foreground/5 border border-foreground/10 hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-sans font-medium text-foreground group-hover:text-primary transition-colors">Email</p>
            <p className="text-xs text-muted-foreground font-mono">hello@example.com</p>
          </div>
        </a>
        <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-foreground/5 border border-foreground/10 hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
            <Github className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-sans font-medium text-foreground group-hover:text-primary transition-colors">GitHub</p>
            <p className="text-xs text-muted-foreground font-mono">github.com/yourusername</p>
          </div>
        </a>
        <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-foreground/5 border border-foreground/10 hover:border-primary/50 transition-all group">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
            <Linkedin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-sans font-medium text-foreground group-hover:text-primary transition-colors">LinkedIn</p>
            <p className="text-xs text-muted-foreground font-mono">linkedin.com/in/yourusername</p>
          </div>
        </a>
      </div>
    </div>
  )
}

/* ─── Color map ─── */
const SECTION_COLORS: Record<string, string> = {
  about:      "rgb(124, 58, 237)",   // violet
  skills:     "rgb(79, 70, 229)",    // indigo
  experience: "rgb(147, 51, 234)",   // purple
  projects:   "rgb(217, 70, 239)",   // fuchsia
  contact:    "rgb(219, 39, 119)",   // pink-magenta
}

const CONTENT_MAP: Record<string, () => React.JSX.Element> = {
  about: AboutContent,
  skills: SkillsContent,
  experience: ExperienceContent,
  projects: ProjectsContent,
  contact: ContactContent,
}

export default function ContentPanel({
  activeNode,
  onClose,
}: {
  activeNode: string | null
  onClose: () => void
}) {
  const ContentComponent = activeNode ? CONTENT_MAP[activeNode] : null
  const plexusColor = activeNode ? SECTION_COLORS[activeNode] : "rgb(167, 139, 250)"

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-700 ease-out",
        activeNode
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      {/* Full-screen dark backdrop with mini plexus */}
      <div className="absolute inset-0 bg-background/85">
        <MiniPlexus color={plexusColor} isVisible={activeNode !== null} />
      </div>

      {/* Content overlay - centered card with semi-transparent background */}
      <div className="relative h-full flex items-center justify-center p-6 md:p-10">
        <div
          className={cn(
            "relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-foreground/10 overflow-hidden transition-all duration-700",
            activeNode ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
          )}
          style={{
            background: "rgba(8, 7, 20, 0.75)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: plexusColor }}
              />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {activeNode ? `node.${activeNode}` : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6">
            {ContentComponent && <ContentComponent />}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <div className="h-px bg-foreground/10 mb-4" />
            <p className="text-xs font-mono text-muted-foreground text-center">
              Press Escape or click outside to return
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
