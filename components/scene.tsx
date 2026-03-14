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
      camera={{ position: [0, 0.5, 9], fov: 50, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#080714" }}
      onPointerMissed={() => onNodeClick(null)}
      raycaster={{ params: { Points: { threshold: 0.2 } } }}
    >
      <color attach="background" args={["#080714"]} />
      <fog attach="fog" args={["#080714", 14, 30]} />
      <NeuralNetwork activeNode={activeNode} onNodeClick={onNodeClick} />
    </Canvas>
  )
}
