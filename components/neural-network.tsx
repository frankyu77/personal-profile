"use client"

import { useRef, useMemo, useState, useCallback, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

/* ─── Types ─── */
interface SectionDef {
  id: string
  label: string
  origin: [number, number, number]
  color: string
  emissive: string
  accentHex: string
  preview: string[]
}

const SECTIONS: SectionDef[] = [
  { id: "about",      label: "About Me",    origin: [0,    0.4,   0],   color: "#c4b5fd", emissive: "#7c3aed", accentHex: "#8b5cf6", preview: ["UBC Computer Science", "Minor in Commerce", "Building Tech × Business"]    },
  { id: "skills",     label: "Skills",      origin: [-3,   1.8,  -0.3], color: "#67e8f9", emissive: "#0891b2", accentHex: "#22d3ee", preview: ["Java, Python & C++", "AWS, Docker & Kubernetes", "Distributed Systems & APIs"]  },
  { id: "experience", label: "Experience",  origin: [2.8,  1.5,  -0.2], color: "#93c5fd", emissive: "#1d4ed8", accentHex: "#3b82f6", preview: ["2 companies", "2+ years", "Team lead"]                     },
  { id: "projects",   label: "Projects",    origin: [-2,  -1.4,   0.2], color: "#d8b4fe", emissive: "#7c3aed", accentHex: "#8b5cf6", preview: ["click me hehe"]                },
  { id: "contact",    label: "Contact",     origin: [2.5, -1.6,  -0.1], color: "#f9a8d4", emissive: "#be185d", accentHex: "#ec4899", preview: ["frankkaiwen.yu@gmail.com", "github.com/frankyu77", "linkedin.com/in/frankyu77"] },
  { id: "life",       label: "Beyond Code", origin: [0.4, -2.4,   0.2], color: "#fde68a", emissive: "#d97706", accentHex: "#f59e0b", preview: ["Skiing & snowboarding", "Hiking BC trails", "Exploring the world"] },
]

/* ─── Constants ─── */
const SEC_BZ          = 0.35   // Section node z-depth range
const AMB_BZ          = 3.5    // Ambient node z-depth range
const AMBIENT_COUNT   = 280
const CONNECTION_DIST = 1.6
const TRIANGLE_DIST   = 1.0
const REPEL_RADIUS    = 2.0    // Mouse repulsion radius (world units)
const REPEL_STRENGTH  = 0.00045

/* ─── Physics node ─── */
interface PhysicsNode {
  pos: THREE.Vector3
  vel: THREE.Vector3
  base: THREE.Vector3
}

function createAmbientNodes(): PhysicsNode[] {
  const nodes: PhysicsNode[] = []
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 6
    const z = (Math.random() - 0.5) * 7 - 0.5   // z in [-4, 3] for true 3D depth
    nodes.push({
      pos:  new THREE.Vector3(x, y, z),
      vel:  new THREE.Vector3((Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.001),
      base: new THREE.Vector3(0, 0, z),
    })
  }
  return nodes
}

function createSectionPhysics(): PhysicsNode[] {
  return SECTIONS.map((s) => {
    const pos = new THREE.Vector3(...s.origin)
    return {
      pos:  pos.clone(),
      vel:  new THREE.Vector3((Math.random() - 0.5) * 0.010, (Math.random() - 0.5) * 0.010, 0),
      base: pos.clone(),
    }
  })
}

function bounceNode(node: PhysicsNode, bx: number, by: number, bz: number, maxDrift: number, springStrength: number) {
  node.pos.x += node.vel.x
  node.pos.y += node.vel.y
  node.pos.z += node.vel.z

  if (node.pos.x >  bx) { node.pos.x =  bx; node.vel.x = -Math.abs(node.vel.x) }
  if (node.pos.x < -bx) { node.pos.x = -bx; node.vel.x =  Math.abs(node.vel.x) }
  if (node.pos.y >  by) { node.pos.y =  by; node.vel.y = -Math.abs(node.vel.y) }
  if (node.pos.y < -by) { node.pos.y = -by; node.vel.y =  Math.abs(node.vel.y) }
  if (node.pos.z >  bz) { node.pos.z =  bz; node.vel.z = -Math.abs(node.vel.z) }
  if (node.pos.z < -bz) { node.pos.z = -bz; node.vel.z =  Math.abs(node.vel.z) }

  const dx = node.pos.x - node.base.x
  const dy = node.pos.y - node.base.y
  const dz = node.pos.z - node.base.z
  if (Math.abs(dx) > maxDrift) node.vel.x -= Math.sign(dx) * springStrength
  if (Math.abs(dy) > maxDrift) node.vel.y -= Math.sign(dy) * springStrength
  if (Math.abs(dz) > maxDrift) node.vel.z -= Math.sign(dz) * springStrength * 0.5

  const maxSpeed = 0.008
  node.vel.x = Math.max(-maxSpeed, Math.min(maxSpeed, node.vel.x))
  node.vel.y = Math.max(-maxSpeed, Math.min(maxSpeed, node.vel.y))
  node.vel.z = Math.max(-maxSpeed, Math.min(maxSpeed, node.vel.z))
}

/* ─── Starfield — two parallax layers ─── */
function Starfield() {
  const farRef = useRef<THREE.Group>(null)
  const midRef = useRef<THREE.Group>(null)

  const farPositions = useMemo(() => {
    const arr = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 120
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 20   // far behind
    }
    return arr
  }, [])

  const midPositions = useMemo(() => {
    const arr = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 70
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 10    // mid distance
    }
    return arr
  }, [])

  useFrame((state) => {
    const p = state.pointer
    if (farRef.current) {
      farRef.current.position.x += (-p.x * 0.18 - farRef.current.position.x) * 0.04
      farRef.current.position.y += (-p.y * 0.18 - farRef.current.position.y) * 0.04
    }
    if (midRef.current) {
      midRef.current.position.x += (-p.x * 0.40 - midRef.current.position.x) * 0.04
      midRef.current.position.y += (-p.y * 0.40 - midRef.current.position.y) * 0.04
    }
  })

  return (
    <>
      <group ref={farRef}>
        <points renderOrder={-2}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[farPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.02} color="#7070cc" transparent opacity={0.28} sizeAttenuation depthWrite={false} />
        </points>
      </group>
      <group ref={midRef}>
        <points renderOrder={-1}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[midPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.03} color="#9090dd" transparent opacity={0.18} sizeAttenuation depthWrite={false} />
        </points>
      </group>
    </>
  )
}

/* ─── Particle trails — data-flow packets along edges ─── */
interface Trail { fromIdx: number; toIdx: number; t: number; speed: number }

function ParticleTrails({ ambientNodes }: { ambientNodes: PhysicsNode[] }) {
  const MAX_TRAILS = 18
  const trails = useMemo<Trail[]>(() => {
    return Array.from({ length: MAX_TRAILS }, () => ({
      fromIdx: Math.floor(Math.random() * AMBIENT_COUNT),
      toIdx:   Math.floor(Math.random() * AMBIENT_COUNT),
      t:       Math.random(),
      speed:   0.003 + Math.random() * 0.004,
    }))
  }, [])

  const posArr  = useMemo(() => new Float32Array(MAX_TRAILS * 3), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)
  const matRef  = useRef<THREE.PointsMaterial>(null)

  useFrame(() => {
    if (!geomRef.current) return

    for (let i = 0; i < trails.length; i++) {
      const tr = trails[i]
      tr.t += tr.speed

      if (tr.t >= 1) {
        tr.fromIdx = tr.toIdx
        let next = Math.floor(Math.random() * AMBIENT_COUNT)
        while (next === tr.fromIdx) next = Math.floor(Math.random() * AMBIENT_COUNT)
        tr.toIdx = next
        tr.t     = 0
        tr.speed = 0.003 + Math.random() * 0.004
      }

      const from = ambientNodes[tr.fromIdx].pos
      const to   = ambientNodes[tr.toIdx].pos
      const dx   = to.x - from.x
      const dy   = to.y - from.y
      // Skip trails between nodes that are too far apart
      if (dx * dx + dy * dy > (CONNECTION_DIST * 1.8) ** 2) { tr.t = 1; continue }

      posArr[i * 3]     = from.x + dx * tr.t
      posArr[i * 3 + 1] = from.y + (to.y - from.y) * tr.t
      posArr[i * 3 + 2] = from.z + (to.z - from.z) * tr.t
    }

    geomRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points renderOrder={3}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.075}
        color="#22d3ee"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ─── Skill constellation — orbiting tech nodes around the Skills node ─── */
const ORBIT_COUNT = 6

function SkillConstellation({
  skillPhysics,
  isSkillHovered,
  anyNodeActive,
}: {
  skillPhysics: PhysicsNode
  isSkillHovered: boolean
  anyNodeActive: boolean
}) {
  const nodePositions = useMemo(() => new Float32Array(ORBIT_COUNT * 3),      [])
  const linePositions = useMemo(() => new Float32Array(ORBIT_COUNT * 2 * 6),  [])  // ring: 6 segments × 2 verts × 3 floats
  const nodeGeomRef   = useRef<THREE.BufferGeometry>(null)
  const lineGeomRef   = useRef<THREE.BufferGeometry>(null)
  const nodeMatRef    = useRef<THREE.PointsMaterial>(null)
  const lineMatRef    = useRef<THREE.LineBasicMaterial>(null)

  useFrame((state) => {
    const t       = state.clock.getElapsedTime()
    const orbitRx = isSkillHovered ? 1.12 : 0.88
    const orbitRy = orbitRx * 0.72
    const center  = skillPhysics.pos

    for (let i = 0; i < ORBIT_COUNT; i++) {
      const angle          = (i / ORBIT_COUNT) * Math.PI * 2 + t * 0.22
      nodePositions[i * 3]     = center.x + Math.cos(angle) * orbitRx
      nodePositions[i * 3 + 1] = center.y + Math.sin(angle) * orbitRy
      nodePositions[i * 3 + 2] = center.z
    }
    if (nodeGeomRef.current) nodeGeomRef.current.attributes.position.needsUpdate = true

    // Build ring line segments
    for (let i = 0; i < ORBIT_COUNT; i++) {
      const next = (i + 1) % ORBIT_COUNT
      linePositions[i * 6]     = nodePositions[i * 3]
      linePositions[i * 6 + 1] = nodePositions[i * 3 + 1]
      linePositions[i * 6 + 2] = nodePositions[i * 3 + 2]
      linePositions[i * 6 + 3] = nodePositions[next * 3]
      linePositions[i * 6 + 4] = nodePositions[next * 3 + 1]
      linePositions[i * 6 + 5] = nodePositions[next * 3 + 2]
    }
    if (lineGeomRef.current) lineGeomRef.current.attributes.position.needsUpdate = true

    // Smooth opacity transitions
    if (nodeMatRef.current) {
      const tgt = anyNodeActive ? 0 : isSkillHovered ? 0.88 : 0.42
      nodeMatRef.current.opacity += (tgt - nodeMatRef.current.opacity) * 0.06
    }
    if (lineMatRef.current) {
      const tgt = anyNodeActive ? 0 : isSkillHovered ? 0.32 : 0.12
      lineMatRef.current.opacity += (tgt - lineMatRef.current.opacity) * 0.06
    }
  })

  return (
    <>
      <points renderOrder={2}>
        <bufferGeometry ref={nodeGeomRef}>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={nodeMatRef}
          size={0.048}
          color="#22d3ee"
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments renderOrder={1}>
        <bufferGeometry ref={lineGeomRef}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMatRef}
          color="#22d3ee"
          transparent
          opacity={0.12}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  )
}

/* ─── Plexus edges — with time-based pulsing ─── */
function PlexusEdges({
  ambientNodes,
  sectionPhysics,
  hoveredNode,
  activeNode,
}: {
  ambientNodes: PhysicsNode[]
  sectionPhysics: PhysicsNode[]
  hoveredNode: string | null
  activeNode: string | null
}) {
  const MAX_EDGES = 4000
  const posArr  = useMemo(() => new Float32Array(MAX_EDGES * 6), [])
  const colArr  = useMemo(() => new Float32Array(MAX_EDGES * 6), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)

  useFrame((state) => {
    if (!geomRef.current) return
    const time   = state.clock.getElapsedTime()
    const allPos = [...sectionPhysics.map(s => s.pos), ...ambientNodes.map(n => n.pos)]

    let hoverPos: THREE.Vector3 | null = null
    if (hoveredNode) {
      const idx = SECTIONS.findIndex(s => s.id === hoveredNode)
      if (idx >= 0) hoverPos = sectionPhysics[idx].pos
    }

    let activePos: THREE.Vector3 | null = null
    if (activeNode) {
      const idx = SECTIONS.findIndex(s => s.id === activeNode)
      if (idx >= 0) activePos = sectionPhysics[idx].pos
    }

    let ei = 0
    for (let i = 0; i < allPos.length && ei < MAX_EDGES; i++) {
      for (let j = i + 1; j < allPos.length && ei < MAX_EDGES; j++) {
        const d = allPos[i].distanceTo(allPos[j])
        if (d < CONNECTION_DIST) {
          const o    = ei * 6
          posArr[o]     = allPos[i].x; posArr[o + 1] = allPos[i].y; posArr[o + 2] = allPos[i].z
          posArr[o + 3] = allPos[j].x; posArr[o + 4] = allPos[j].y; posArr[o + 5] = allPos[j].z

          const fade  = 1 - d / CONNECTION_DIST
          // Subtle per-edge pulse — different phase per edge pair so they pulse independently
          const pulse = 0.82 + Math.sin(time * 0.65 + (i * 7 + j * 13) * 0.06) * 0.18

          let boost = 1.0
          if (hoverPos) {
            const mx = (allPos[i].x + allPos[j].x) / 2
            const my = (allPos[i].y + allPos[j].y) / 2
            const mz = (allPos[i].z + allPos[j].z) / 2
            const dh = Math.sqrt((mx - hoverPos.x) ** 2 + (my - hoverPos.y) ** 2 + (mz - hoverPos.z) ** 2)
            if (dh < 1.6) boost = 1 + (1 - dh / 1.6) * 1.4
          }

          if (activePos) {
            const mx = (allPos[i].x + allPos[j].x) / 2
            const my = (allPos[i].y + allPos[j].y) / 2
            const mz = (allPos[i].z + allPos[j].z) / 2
            const dh = Math.sqrt((mx - activePos.x) ** 2 + (my - activePos.y) ** 2 + (mz - activePos.z) ** 2)
            if (dh < 2.0) boost = Math.max(boost, 1 + (1 - dh / 2.0) * 2.4)
          }

          const alpha = Math.min(fade * 0.58 * boost * pulse, 1.0 / 0.75)
          colArr[o]     = 0.36 * alpha; colArr[o + 1] = 0.26 * alpha; colArr[o + 2] = 0.75 * alpha
          colArr[o + 3] = 0.36 * alpha; colArr[o + 4] = 0.26 * alpha; colArr[o + 5] = 0.75 * alpha
          ei++
        }
      }
    }

    geomRef.current.setDrawRange(0, ei * 2)
    geomRef.current.attributes.position.needsUpdate = true
    geomRef.current.attributes.color.needsUpdate    = true
  })

  return (
    <lineSegments renderOrder={0}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colArr, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} depthTest={false} />
    </lineSegments>
  )
}

/* ─── Plexus triangular faces ─── */
function PlexusFaces({ ambientNodes, sectionPhysics }: { ambientNodes: PhysicsNode[]; sectionPhysics: PhysicsNode[] }) {
  const MAX_TRIS = 1600
  const posArr  = useMemo(() => new Float32Array(MAX_TRIS * 9), [])
  const colArr  = useMemo(() => new Float32Array(MAX_TRIS * 9), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)

  useFrame(() => {
    if (!geomRef.current) return
    const allPos = [...sectionPhysics.map(s => s.pos), ...ambientNodes.map(n => n.pos)]
    let fi = 0
    for (let i = 0; i < allPos.length && fi < MAX_TRIS; i++) {
      for (let j = i + 1; j < allPos.length && fi < MAX_TRIS; j++) {
        if (allPos[i].distanceTo(allPos[j]) > TRIANGLE_DIST) continue
        for (let k = j + 1; k < allPos.length && fi < MAX_TRIS; k++) {
          const dik = allPos[i].distanceTo(allPos[k])
          const djk = allPos[j].distanceTo(allPos[k])
          if (dik < TRIANGLE_DIST && djk < TRIANGLE_DIST) {
            const o = fi * 9
            posArr[o]     = allPos[i].x; posArr[o + 1] = allPos[i].y; posArr[o + 2] = allPos[i].z
            posArr[o + 3] = allPos[j].x; posArr[o + 4] = allPos[j].y; posArr[o + 5] = allPos[j].z
            posArr[o + 6] = allPos[k].x; posArr[o + 7] = allPos[k].y; posArr[o + 8] = allPos[k].z
            const avgD = (allPos[i].distanceTo(allPos[j]) + dik + djk) / 3
            const b    = (1 - avgD / TRIANGLE_DIST) * 0.5
            for (let v = 0; v < 3; v++) {
              colArr[o + v * 3] = 0.26 * b; colArr[o + v * 3 + 1] = 0.18 * b; colArr[o + v * 3 + 2] = 0.58 * b
            }
            fi++
          }
        }
      }
    }
    geomRef.current.setDrawRange(0, fi * 3)
    geomRef.current.attributes.position.needsUpdate = true
    geomRef.current.attributes.color.needsUpdate    = true
  })

  return (
    <mesh renderOrder={0}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colArr, 3]} />
      </bufferGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/* ─── Dot cloud ─── */
function DotCloud({ ambientNodes }: { ambientNodes: PhysicsNode[] }) {
  const positions = useMemo(() => new Float32Array(AMBIENT_COUNT * 3), [])
  const geomRef   = useRef<THREE.BufferGeometry>(null)

  useFrame(() => {
    if (!geomRef.current) return
    for (let i = 0; i < ambientNodes.length; i++) {
      positions[i * 3]     = ambientNodes[i].pos.x
      positions[i * 3 + 1] = ambientNodes[i].pos.y
      positions[i * 3 + 2] = ambientNodes[i].pos.z
    }
    geomRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points renderOrder={1}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.065} color="#8b5cf6" transparent opacity={0.55} sizeAttenuation depthWrite={false} depthTest={false} />
    </points>
  )
}

/* ─── Node visual styles per section ─── */
interface NodeStyle {
  ring1R: number; ring1T: number; ring1Segs: number
  ring2R: number; ring2T: number; ring2Segs: number
  ring1Speed: number; ring2Speed: number; orbitN: number
}

const NODE_STYLES: NodeStyle[] = [
  { ring1R: 0.20, ring1T: 0.008, ring1Segs: 64, ring2R: 0.27, ring2T: 0.004, ring2Segs: 48, ring1Speed:  0.005, ring2Speed:  0.003, orbitN: 2 }, // About
  { ring1R: 0.19, ring1T: 0.006, ring1Segs: 64, ring2R: 0.29, ring2T: 0.003, ring2Segs: 32, ring1Speed:  0.008, ring2Speed: -0.004, orbitN: 2 }, // Skills
  { ring1R: 0.19, ring1T: 0.011, ring1Segs: 48, ring2R: 0.26, ring2T: 0.007, ring2Segs: 24, ring1Speed:  0.003, ring2Speed:  0.002, orbitN: 2 }, // Experience
  { ring1R: 0.20, ring1T: 0.012, ring1Segs: 6,  ring2R: 0.28, ring2T: 0.010, ring2Segs: 6,  ring1Speed:  0.012, ring2Speed: -0.007, orbitN: 3 }, // Projects
  { ring1R: 0.20, ring1T: 0.007, ring1Segs: 64, ring2R: 0.27, ring2T: 0.004, ring2Segs: 64, ring1Speed:  0.009, ring2Speed:  0.006, orbitN: 3 }, // Contact
  { ring1R: 0.22, ring1T: 0.006, ring1Segs: 64, ring2R: 0.31, ring2T: 0.004, ring2Segs: 64, ring1Speed:  0.003, ring2Speed: -0.002, orbitN: 3 }, // Life — slow, organic, wide halo
]

/* ─── Section node — multi-layer energy core ─── */
interface NodeAnimState { scale: number; clickTime: number }

function SectionSphere({
  section, physics, isActive, isHovered, anyNodeActive, styleIdx, onHover, onUnhover, onClick,
}: {
  section: SectionDef; physics: PhysicsNode; isActive: boolean; isHovered: boolean
  anyNodeActive: boolean; styleIdx: number
  onHover: () => void; onUnhover: () => void; onClick: () => void
}) {
  const style = NODE_STYLES[styleIdx]

  const groupRef     = useRef<THREE.Group>(null)
  const labelRef     = useRef<THREE.Group>(null)
  const tooltipRef   = useRef<THREE.Group>(null)
  const coreRef      = useRef<THREE.Mesh>(null)
  const innerGlowRef = useRef<THREE.Mesh>(null)
  const outerHaloRef = useRef<THREE.Mesh>(null)
  const ring1Ref     = useRef<THREE.Mesh>(null)
  const ring2Ref     = useRef<THREE.Mesh>(null)
  const rippleRef    = useRef<THREE.Mesh>(null)
  const orbitGeomRef = useRef<THREE.BufferGeometry>(null)
  const orbitMatRef  = useRef<THREE.PointsMaterial>(null)

  const anim         = useRef<NodeAnimState>({ scale: 1, clickTime: -999 })
  const clickPending = useRef(false)

  const { orbitN } = style
  const orbitPositions = useMemo(() => new Float32Array(orbitN * 3), [orbitN])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    const a = anim.current

    if (clickPending.current) { a.clickTime = t; clickPending.current = false }

    // Position all groups
    groupRef.current.position.copy(physics.pos)
    if (rippleRef.current)  rippleRef.current.position.copy(physics.pos)
    if (labelRef.current)   labelRef.current.position.set(physics.pos.x, physics.pos.y - 0.42, physics.pos.z)
    if (tooltipRef.current) tooltipRef.current.position.set(physics.pos.x, physics.pos.y + 0.56, physics.pos.z)

    // Breathing scale + hover/active
    const breathe = 1 + Math.sin(t * 1.3 + section.id.charCodeAt(0) * 0.5) * 0.03
    const tScale  = anyNodeActive && !isActive ? 0.82 : isActive ? 1.38 : isHovered ? 1.18 : breathe
    a.scale      += (tScale - a.scale) * 0.08
    groupRef.current.scale.setScalar(a.scale)

    // Core sphere
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      const tOp = anyNodeActive && !isActive ? 0.25 : isActive ? 1.0 : isHovered ? 0.95 : 0.82
      mat.opacity += (tOp - mat.opacity) * 0.10
    }
    // Inner glow sphere
    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial
      const tOp = anyNodeActive && !isActive ? 0.06 : isActive ? 0.55 : isHovered ? 0.40 : 0.20
      mat.opacity += (tOp - mat.opacity) * 0.08
    }
    // Outer halo sphere
    if (outerHaloRef.current) {
      const mat = outerHaloRef.current.material as THREE.MeshBasicMaterial
      const tOp = anyNodeActive && !isActive ? 0.02 : isActive ? 0.22 : isHovered ? 0.14 : 0.06
      mat.opacity += (tOp - mat.opacity) * 0.06
    }

    // Ring 1 — tilted, continuously spinning around Z
    if (ring1Ref.current) {
      const spd = isHovered ? style.ring1Speed * 2.8 : style.ring1Speed
      ring1Ref.current.rotation.x  = Math.PI / 3
      ring1Ref.current.rotation.z += spd
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial
      const tOp = anyNodeActive && !isActive ? 0.05 : isActive ? 0.88 : isHovered ? 0.72 : 0.36
      mat.opacity += (tOp - mat.opacity) * 0.08
    }
    // Ring 2 — counter-tilted, spinning around Y
    if (ring2Ref.current) {
      const spd = isHovered ? style.ring2Speed * 2.8 : style.ring2Speed
      ring2Ref.current.rotation.x  = Math.PI / 6
      ring2Ref.current.rotation.y += spd
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial
      const tOp = anyNodeActive && !isActive ? 0.03 : isActive ? 0.52 : isHovered ? 0.40 : 0.16
      mat.opacity += (tOp - mat.opacity) * 0.08
    }

    // Click ripple — expands outward then fades
    if (rippleRef.current) {
      const mat = rippleRef.current.material as THREE.MeshBasicMaterial
      if (a.clickTime > 0) {
        const elapsed = t - a.clickTime
        if (elapsed < 0.75) {
          const p = elapsed / 0.75
          rippleRef.current.scale.setScalar(1 + p * 7)
          mat.opacity = (1 - p) * 0.55
        } else {
          mat.opacity  = 0
          a.clickTime = -999
        }
      }
    }

    // Orbiting particles — 3-D elliptical orbits at different tilts
    const ORBIT_R = 0.24
    for (let i = 0; i < orbitN; i++) {
      const phase = (i / orbitN) * Math.PI * 2
      const tilt  = (i / orbitN) * Math.PI
      const spd   = (isHovered ? 1.4 : 0.7) * (0.6 + i * 0.25)
      const angle = t * spd + phase
      orbitPositions[i * 3]     = Math.cos(angle) * ORBIT_R
      orbitPositions[i * 3 + 1] = Math.sin(angle) * Math.cos(tilt) * ORBIT_R
      orbitPositions[i * 3 + 2] = Math.sin(angle) * Math.sin(tilt) * ORBIT_R
    }
    if (orbitGeomRef.current) orbitGeomRef.current.attributes.position.needsUpdate = true
    if (orbitMatRef.current) {
      const tOp = anyNodeActive && !isActive ? 0.08 : isActive ? 0.80 : isHovered ? 0.95 : 0.50
      orbitMatRef.current.opacity += (tOp - orbitMatRef.current.opacity) * 0.08
    }
  })

  const showLabel = !anyNodeActive

  return (
    <>
      {/* ── Scaled visual group ── */}
      <group ref={groupRef}>

        {/* Layer 1: outer halo */}
        <mesh ref={outerHaloRef} renderOrder={999}>
          <sphereGeometry args={[0.30, 16, 16]} />
          <meshBasicMaterial color={section.emissive} transparent opacity={0.06} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Layer 2: inner glow */}
        <mesh ref={innerGlowRef} renderOrder={1000}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.20} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Layer 3: solid core — hit target */}
        <mesh ref={coreRef} renderOrder={1001}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover()   }}
          onPointerOut={(e)  => { e.stopPropagation(); document.body.style.cursor = "auto";    onUnhover() }}
          onClick={(e)       => { e.stopPropagation(); clickPending.current = true; onClick()             }}
        >
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.82} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Layer 4a: primary ring — tilted, spinning */}
        <mesh ref={ring1Ref} renderOrder={1002}>
          <torusGeometry args={[style.ring1R, style.ring1T, 8, style.ring1Segs]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.36} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Layer 4b: secondary ring — counter-tilted, counter-spinning */}
        <mesh ref={ring2Ref} renderOrder={1002}>
          <torusGeometry args={[style.ring2R, style.ring2T, 8, style.ring2Segs]} />
          <meshBasicMaterial color={section.emissive} transparent opacity={0.16} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Layer 5: orbiting particles */}
        <points renderOrder={1003}>
          <bufferGeometry ref={orbitGeomRef}>
            <bufferAttribute attach="attributes-position" args={[orbitPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={orbitMatRef} size={0.030} color={section.color} transparent opacity={0.50} sizeAttenuation depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>

      {/* ── Click ripple (world-space, outside scaled group) ── */}
      <mesh ref={rippleRef} renderOrder={1004}>
        <ringGeometry args={[0.10, 0.155, 48]} />
        <meshBasicMaterial color={section.color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* ── Node label ── */}
      {showLabel && (
        <group ref={labelRef}>
          <Html center distanceFactor={6} style={{ pointerEvents: "none", userSelect: "none" }} zIndexRange={[5, 0]}>
            <div style={{ color: isHovered ? "#ffffff" : "#c4b5fd", fontSize: "11px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)", transition: "color 0.25s", opacity: isHovered ? 1 : 0.75 }}>
              {section.label}
            </div>
          </Html>
        </group>
      )}

      {/* ── Hover tooltip ── */}
      <group ref={tooltipRef}>
        <Html center distanceFactor={5} style={{ pointerEvents: "none", userSelect: "none" }} zIndexRange={[10, 0]}>
          <div style={{ opacity: isHovered && !anyNodeActive ? 1 : 0, transform: isHovered && !anyNodeActive ? "translateY(0px)" : "translateY(6px)", transition: "opacity 0.2s ease, transform 0.2s ease", background: "rgba(5,8,22,0.92)", backdropFilter: "blur(16px)", border: `1px solid ${section.accentHex}45`, borderRadius: "10px", padding: "10px 13px", minWidth: "130px", boxShadow: `0 0 30px ${section.accentHex}18, 0 8px 32px rgba(0,0,0,0.5)` }}>
            <div style={{ fontSize: "8px", fontFamily: "monospace", color: section.accentHex, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "7px", opacity: 0.9 }}>{section.label}</div>
            {section.preview.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.55)", lineHeight: "1.7" }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: section.accentHex, opacity: 0.6, flexShrink: 0, display: "inline-block" }} />
                {item}
              </div>
            ))}
          </div>
        </Html>
      </group>
    </>
  )
}

/* ─── Camera controller — with mouse parallax ─── */
function CameraController({ activeNode, sectionPhysics }: { activeNode: string | null; sectionPhysics: PhysicsNode[] }) {
  const { camera } = useThree()
  const targetPos  = useRef(new THREE.Vector3(0, 0.5, 9))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const curLook    = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const p = state.pointer   // -1 to 1, mouse position

    if (activeNode) {
      const idx = SECTIONS.findIndex(s => s.id === activeNode)
      if (idx >= 0) {
        const sp = sectionPhysics[idx].pos
        targetPos.current.set(sp.x, sp.y + 0.2, sp.z + 3.5)
        targetLook.current.copy(sp)
      }
    } else {
      // Gentle drift + mouse parallax
      targetPos.current.set(
        Math.sin(t * 0.08) * 0.3 + p.x * 0.35,
        Math.cos(t * 0.06) * 0.2 + 0.5 + p.y * -0.25,
        9,
      )
      targetLook.current.set(p.x * 0.45, p.y * -0.2, 0)
    }

    camera.position.lerp(targetPos.current, 0.04)
    curLook.current.lerp(targetLook.current, 0.04)
    camera.lookAt(curLook.current)
  })

  return null
}

/* ─── Main export ─── */
export default function NeuralNetwork({ activeNode, onNodeClick }: { activeNode: string | null; onNodeClick: (id: string | null) => void }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [mounted, setMounted]         = useState(false)

  const ambientNodes   = useMemo(() => createAmbientNodes(),   [])
  const sectionPhysics = useMemo(() => createSectionPhysics(), [])

  const jitterOffsets = useRef(SECTIONS.map(() => ({ x: (Math.random() - 0.5) * 1.0, y: (Math.random() - 0.5) * 0.8 })))
  const hasInitialized = useRef(false)

  const boundsRef = useRef({ ambBx: 5.5, ambBy: 3.2, secBx: 4.5, secBy: 2.4 })
  const { size, camera } = useThree()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const hh  = Math.tan((cam.fov / 2) * (Math.PI / 180)) * 9
    const hw  = hh * (size.width / size.height)

    boundsRef.current = { ambBx: hw * 1.08, ambBy: hh * 1.08, secBx: hw * 0.90, secBy: hh * 0.84 }

    const newBases: [number, number, number][] = [
      [0,           hh * 0.06,   0   ],
      [-hw * 0.74,  hh * 0.72, -0.3 ],
      [ hw * 0.74,  hh * 0.72, -0.2 ],
      [-hw * 0.66, -hh * 0.72,  0.2 ],
      [ hw * 0.66, -hh * 0.72, -0.1 ],
      [ hw * 0.08, -hh * 0.94,  0.15],
    ]
    newBases.forEach(([x, y, z], i) => {
      sectionPhysics[i].base.set(x, y, z)
      if (!hasInitialized.current) {
        const j = jitterOffsets.current[i]
        sectionPhysics[i].pos.set(x + j.x, y + j.y, z)
      }
    })
    hasInitialized.current = true
  }, [size.width, size.height, camera, sectionPhysics])

  useFrame((state) => {
    const { ambBx, ambBy, secBx, secBy } = boundsRef.current

    // Mouse energy field — repel ambient nodes near the cursor
    const ptr  = state.pointer
    const cam  = state.camera as THREE.PerspectiveCamera
    const camZ = cam.position.z
    const halfH = Math.tan((cam.fov / 2) * Math.PI / 180) * camZ
    const halfW = halfH * (size.width / size.height)
    const cx = ptr.x * halfW
    const cy = ptr.y * halfH

    for (const n of ambientNodes) {
      const dx = n.pos.x - cx
      const dy = n.pos.y - cy
      const d2 = dx * dx + dy * dy
      if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 0.01) {
        const d = Math.sqrt(d2)
        const f = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH
        n.vel.x += (dx / d) * f
        n.vel.y += (dy / d) * f
      }
    }

    for (const n of sectionPhysics) bounceNode(n, secBx, secBy, SEC_BZ, 5.0, 0.00015)
    for (const n of ambientNodes)   bounceNode(n, ambBx, ambBy, AMB_BZ, 20,  0.0001)
  })

  const handleClick = useCallback(
    (id: string) => { onNodeClick(activeNode === id ? null : id) },
    [activeNode, onNodeClick]
  )

  if (!mounted) return null

  // Skills section is index 1 in SECTIONS
  const skillsPhysics = sectionPhysics[1]

  return (
    <>
      <CameraController activeNode={activeNode} sectionPhysics={sectionPhysics} />

      <ambientLight intensity={0.04} />
      <pointLight position={[4,  4,  6]} intensity={0.2}  color="#7c3aed" />
      <pointLight position={[-4, -3, 4]} intensity={0.12} color="#4c1d95" />

      <Starfield />
      <ParticleTrails ambientNodes={ambientNodes} />
      <SkillConstellation skillPhysics={skillsPhysics} isSkillHovered={hoveredNode === "skills"} anyNodeActive={activeNode !== null} />

      <PlexusEdges ambientNodes={ambientNodes} sectionPhysics={sectionPhysics} hoveredNode={hoveredNode} activeNode={activeNode} />
      <PlexusFaces ambientNodes={ambientNodes} sectionPhysics={sectionPhysics} />
      <DotCloud    ambientNodes={ambientNodes} />

      {SECTIONS.map((section, i) => (
        <SectionSphere
          key={section.id}
          section={section}
          physics={sectionPhysics[i]}
          isActive={activeNode === section.id}
          isHovered={hoveredNode === section.id}
          anyNodeActive={activeNode !== null}
          styleIdx={i}
          onHover={() => setHoveredNode(section.id)}
          onUnhover={() => setHoveredNode(null)}
          onClick={() => handleClick(section.id)}
        />
      ))}
    </>
  )
}
