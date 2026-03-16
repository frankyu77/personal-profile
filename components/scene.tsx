"use client"

import { Canvas } from "@react-three/fiber"
import NeuralNetwork from "./neural-network"

export default function Scene({
  activeNode,
  onNodeClick,
}: {
  activeNode: string | null
  onNodeClick: (id: string | null) => void
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 9], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#050816" }}
      onPointerMissed={() => onNodeClick(null)}
      raycaster={{ params: { Points: { threshold: 0.2 } } }}
    >
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 14, 30]} />
      <NeuralNetwork activeNode={activeNode} onNodeClick={onNodeClick} />
    </Canvas>
  )
}
