"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import ContentPanel from "@/components/content-panel"

const Scene = dynamic(() => import("@/components/scene"), { ssr: false })

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
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Scene activeNode={activeNode} onNodeClick={handleNodeClick} />
      </div>

      {/* Top overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex flex-col gap-1 p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-foreground">
            Alex Chen
          </h1>
          <p className="text-sm font-mono text-primary">
            Full-Stack Developer & Creative Technologist
          </p>
        </div>
      </header>

      {/* Bottom hint */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              Click a glowing node to explore
            </span>
          </div>
        </div>
      </div>

      {/* Full-screen content panel overlay */}
      <ContentPanel activeNode={activeNode} onClose={() => setActiveNode(null)} />
    </main>
  )
}
