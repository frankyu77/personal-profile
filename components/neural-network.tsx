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
}

/* Purple → indigo → fuchsia palette, cohesive with the dark-violet theme */
const SECTIONS: SectionDef[] = [
  { id: "about",      label: "About Me",   origin: [0,    0.4,   0],   color: "#c4b5fd", emissive: "#7c3aed" },
  { id: "skills",     label: "Skills",     origin: [-3,   1.8,  -0.3], color: "#a5b4fc", emissive: "#4f46e5" },
  { id: "experience", label: "Experience", origin: [2.8,  1.5,  -0.2], color: "#d8b4fe", emissive: "#9333ea" },
  { id: "projects",   label: "Projects",   origin: [-2,  -1.4,   0.2], color: "#f0abfc", emissive: "#c026d3" },
  { id: "contact",    label: "Contact",    origin: [2.5, -1.6,  -0.1], color: "#fda4af", emissive: "#be185d" },
]

/* ─── Constants ─── */
const SEC_BZ = 0.08
const AMB_BZ = 1.5
const AMBIENT_COUNT = 280
const CONNECTION_DIST = 1.6
const TRIANGLE_DIST = 1.1

/* ─── Physics node ─── */
interface PhysicsNode {
  pos: THREE.Vector3
  vel: THREE.Vector3
  base: THREE.Vector3
}

function createAmbientNodes(): PhysicsNode[] {
  const nodes: PhysicsNode[] = []
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const x = (Math.random() - 0.5) * 16
    const y = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * AMB_BZ * 2 - 1
    const pos = new THREE.Vector3(x, y, z)
    nodes.push({
      pos: pos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.001
      ),
      base: new THREE.Vector3(0, 0, z),
    })
  }
  return nodes
}

function createSectionPhysics(): PhysicsNode[] {
  return SECTIONS.map((s) => {
    const pos = new THREE.Vector3(...s.origin)
    return {
      pos: pos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.010,
        (Math.random() - 0.5) * 0.010,
        0
      ),
      base: pos.clone(),
    }
  })
}

function bounceNode(
  node: PhysicsNode,
  bx: number,
  by: number,
  bz: number,
  maxDrift: number,
  springStrength: number
) {
  node.pos.x += node.vel.x
  node.pos.y += node.vel.y
  node.pos.z += node.vel.z

  if (node.pos.x > bx) { node.pos.x = bx; node.vel.x = -Math.abs(node.vel.x) }
  if (node.pos.x < -bx) { node.pos.x = -bx; node.vel.x = Math.abs(node.vel.x) }
  if (node.pos.y > by) { node.pos.y = by; node.vel.y = -Math.abs(node.vel.y) }
  if (node.pos.y < -by) { node.pos.y = -by; node.vel.y = Math.abs(node.vel.y) }
  if (node.pos.z > bz) { node.pos.z = bz; node.vel.z = -Math.abs(node.vel.z) }
  if (node.pos.z < -bz) { node.pos.z = -bz; node.vel.z = Math.abs(node.vel.z) }

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

/* ─── Plexus edges ─── */
function PlexusEdges({
  ambientNodes,
  sectionPhysics,
  hoveredNode,
}: {
  ambientNodes: PhysicsNode[]
  sectionPhysics: PhysicsNode[]
  hoveredNode: string | null
}) {
  const MAX_EDGES = 4000
  const posArr = useMemo(() => new Float32Array(MAX_EDGES * 6), [])
  const colArr = useMemo(() => new Float32Array(MAX_EDGES * 6), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)

  useFrame(() => {
    if (!geomRef.current) return
    const allPos = [...sectionPhysics.map(s => s.pos), ...ambientNodes.map(n => n.pos)]

    let hoverPos: THREE.Vector3 | null = null
    if (hoveredNode) {
      const idx = SECTIONS.findIndex(s => s.id === hoveredNode)
      if (idx >= 0) hoverPos = sectionPhysics[idx].pos
    }

    let ei = 0
    for (let i = 0; i < allPos.length && ei < MAX_EDGES; i++) {
      for (let j = i + 1; j < allPos.length && ei < MAX_EDGES; j++) {
        const d = allPos[i].distanceTo(allPos[j])
        if (d < CONNECTION_DIST) {
          const o = ei * 6
          posArr[o]     = allPos[i].x; posArr[o + 1] = allPos[i].y; posArr[o + 2] = allPos[i].z
          posArr[o + 3] = allPos[j].x; posArr[o + 4] = allPos[j].y; posArr[o + 5] = allPos[j].z

          const fade = 1 - d / CONNECTION_DIST

          // Only boost edges whose MIDPOINT is very close to the hovered node,
          // preventing random edges far away from lighting up.
          let boost = 1.0
          if (hoverPos) {
            const mx = (allPos[i].x + allPos[j].x) / 2
            const my = (allPos[i].y + allPos[j].y) / 2
            const mz = (allPos[i].z + allPos[j].z) / 2
            const dh = Math.sqrt((mx - hoverPos.x) ** 2 + (my - hoverPos.y) ** 2 + (mz - hoverPos.z) ** 2)
            if (dh < 1.6) boost = 1 + (1 - dh / 1.6) * 1.4
          }

          // Clamp alpha so no RGB channel exceeds 1.0 (blue is highest at 0.75×alpha)
          const alpha = Math.min(fade * 0.38 * boost, 1.0 / 0.75)
          colArr[o]     = 0.36 * alpha; colArr[o + 1] = 0.26 * alpha; colArr[o + 2] = 0.75 * alpha
          colArr[o + 3] = 0.36 * alpha; colArr[o + 4] = 0.26 * alpha; colArr[o + 5] = 0.75 * alpha
          ei++
        }
      }
    }

    geomRef.current.setDrawRange(0, ei * 2)
    geomRef.current.attributes.position.needsUpdate = true
    geomRef.current.attributes.color.needsUpdate = true
  })

  return (
    <lineSegments renderOrder={0}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-color" args={[colArr, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} depthTest={false} />
    </lineSegments>
  )
}

/* ─── Plexus triangular faces ─── */
function PlexusFaces({
  ambientNodes,
  sectionPhysics,
}: {
  ambientNodes: PhysicsNode[]
  sectionPhysics: PhysicsNode[]
}) {
  const MAX_TRIS = 1600
  const posArr = useMemo(() => new Float32Array(MAX_TRIS * 9), [])
  const colArr = useMemo(() => new Float32Array(MAX_TRIS * 9), [])
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
            const brightness = (1 - avgD / TRIANGLE_DIST) * 0.5
            for (let v = 0; v < 3; v++) {
              colArr[o + v * 3]     = 0.26 * brightness
              colArr[o + v * 3 + 1] = 0.18 * brightness
              colArr[o + v * 3 + 2] = 0.58 * brightness
            }
            fi++
          }
        }
      }
    }

    geomRef.current.setDrawRange(0, fi * 3)
    geomRef.current.attributes.position.needsUpdate = true
    geomRef.current.attributes.color.needsUpdate = true
  })

  return (
    <mesh renderOrder={0}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-color" args={[colArr, 3]} />
      </bufferGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/* ─── Dot cloud ─── */
function DotCloud({ ambientNodes }: { ambientNodes: PhysicsNode[] }) {
  const positions = useMemo(() => new Float32Array(AMBIENT_COUNT * 3), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)

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
      <pointsMaterial size={0.04} color="#8b5cf6" transparent opacity={0.55} sizeAttenuation depthWrite={false} depthTest={false} />
    </points>
  )
}

/* ─── Section sphere with label ─── */
interface AnimState { scale: number; haloScale: number; haloOpacity: number; coreOpacity: number }

function SectionSphere({
  section,
  physics,
  isActive,
  isHovered,
  anyNodeActive,
  onHover,
  onUnhover,
  onClick,
}: {
  section: SectionDef
  physics: PhysicsNode
  isActive: boolean
  isHovered: boolean
  anyNodeActive: boolean
  onHover: () => void
  onUnhover: () => void
  onClick: () => void
}) {
  const groupRef   = useRef<THREE.Group>(null)
  const haloRef    = useRef<THREE.Mesh>(null)
  const coreRef    = useRef<THREE.Mesh>(null)
  const highlightRef = useRef<THREE.Mesh>(null)

  // Lerp-able animation state — avoids per-frame React re-renders
  const anim = useRef<AnimState>({ scale: 1, haloScale: 2.0, haloOpacity: 0.05, coreOpacity: 0.72 })

  useFrame((state) => {
    if (!groupRef.current) return
    const t   = state.clock.getElapsedTime()
    const a   = anim.current
    const spd = 0.1

    // Target values based on interaction state
    const tScale       = isActive ? 1.35 : isHovered ? 1.18 : 1.0
    const tHaloScale   = isActive ? 3.6  : isHovered ? 2.9  : 2.1
    const tHaloOpacity = isActive ? 0.22 : isHovered ? 0.14 : 0.05
    const tCoreOpacity = isActive ? 1.0  : isHovered ? 0.92 : 0.72

    // Smooth lerp
    a.scale       += (tScale       - a.scale)       * spd
    a.haloScale   += (tHaloScale   - a.haloScale)   * spd
    a.haloOpacity += (tHaloOpacity - a.haloOpacity) * spd
    a.coreOpacity += (tCoreOpacity - a.coreOpacity) * spd

    // Gentle pulse on top of lerped scale
    const pulse = Math.sin(t * 2.2 + section.origin[0] * 2.8) * 0.028

    groupRef.current.position.copy(physics.pos)
    groupRef.current.scale.setScalar(a.scale + pulse)

    if (haloRef.current) {
      haloRef.current.scale.setScalar(a.haloScale)
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = a.haloOpacity
    }
    if (coreRef.current) {
      ;(coreRef.current.material as THREE.MeshBasicMaterial).opacity = a.coreOpacity
    }
    if (highlightRef.current) {
      ;(highlightRef.current.material as THREE.MeshBasicMaterial).opacity = a.coreOpacity * 0.35
    }
  })

  const showLabel = !anyNodeActive

  return (
    <group ref={groupRef}>
      {/* Soft outer halo — renderOrder 1000 so it draws after the entire plexus */}
      <mesh ref={haloRef} renderOrder={1000}>
        <sphereGeometry args={[0.20, 32, 32]} />
        <meshBasicMaterial
          color={section.emissive}
          transparent
          opacity={0.05}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core sphere — meshBasicMaterial + transparent=true guarantees it enters the
          transparent render queue and respects renderOrder=1001, always on top */}
      <mesh
        ref={coreRef}
        renderOrder={1001}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHover() }}
        onPointerOut={(e)  => { e.stopPropagation(); document.body.style.cursor = "auto";    onUnhover() }}
        onClick={(e)       => { e.stopPropagation(); onClick() }}
      >
        <sphereGeometry args={[0.20, 64, 64]} />
        <meshBasicMaterial
          color={section.emissive}
          transparent
          opacity={0.72}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Small bright highlight at sphere center for depth illusion */}
      <mesh ref={highlightRef} renderOrder={1002}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={0.28}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Label — placed well clear of the glow so it doesn't visually merge with the sphere */}
      {showLabel && (
        <Html
          position={[0, -0.58, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[5, 0]}
        >
          <div
            style={{
              color: isHovered ? "#f0ebff" : "#c4b5fd",
              fontSize: "13px",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 1px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)",
              transition: "color 0.3s",
            }}
          >
            {section.label}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ─── Camera controller ─── */
function CameraController({
  activeNode,
  sectionPhysics,
}: {
  activeNode: string | null
  sectionPhysics: PhysicsNode[]
}) {
  const { camera } = useThree()
  const targetPos  = useRef(new THREE.Vector3(0, 0.5, 9))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const curLook    = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (activeNode) {
      const idx = SECTIONS.findIndex(s => s.id === activeNode)
      if (idx >= 0) {
        const sp = sectionPhysics[idx].pos
        targetPos.current.set(sp.x, sp.y + 0.2, sp.z + 3.5)
        targetLook.current.copy(sp)
      }
    } else {
      targetPos.current.set(Math.sin(t * 0.08) * 0.3, Math.cos(t * 0.06) * 0.2 + 0.5, 9)
      targetLook.current.set(0, 0, 0)
    }

    camera.position.lerp(targetPos.current, 0.04)
    curLook.current.lerp(targetLook.current, 0.04)
    camera.lookAt(curLook.current)
  })

  return null
}

/* ─── Main export ─── */
export default function NeuralNetwork({
  activeNode,
  onNodeClick,
}: {
  activeNode: string | null
  onNodeClick: (id: string | null) => void
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [mounted, setMounted]         = useState(false)

  const ambientNodes   = useMemo(() => createAmbientNodes(),   [])
  const sectionPhysics = useMemo(() => createSectionPhysics(), [])

  // Stable per-node random offsets so the initial layout is never a perfect dice pattern
  const jitterOffsets = useRef(
    SECTIONS.map(() => ({
      x: (Math.random() - 0.5) * 2.8,
      y: (Math.random() - 0.5) * 2.0,
    }))
  )
  const hasInitialized = useRef(false)

  const boundsRef = useRef({ ambBx: 8, ambBy: 4.5, secBx: 5, secBy: 3 })
  const { size, camera } = useThree()

  useEffect(() => { setMounted(true) }, [])

  // Recompute world-space bounds + section positions on resize
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const hh = Math.tan((cam.fov / 2) * (Math.PI / 180)) * 9
    const hw = hh * (size.width / size.height)

    boundsRef.current = { ambBx: hw * 1.08, ambBy: hh * 1.08, secBx: hw * 0.90, secBy: hh * 0.84 }

    const newBases: [number, number, number][] = [
      [0,           hh * 0.06,   0  ],   // About — center
      [-hw * 0.62,  hh * 0.62, -0.3],   // Skills — upper-left
      [ hw * 0.62,  hh * 0.62, -0.2],   // Experience — upper-right
      [-hw * 0.54, -hh * 0.62,  0.2],   // Projects — lower-left
      [ hw * 0.54, -hh * 0.62, -0.1],   // Contact — lower-right
    ]
    newBases.forEach(([x, y, z], i) => {
      sectionPhysics[i].base.set(x, y, z)
      if (!hasInitialized.current) {
        // First load: offset starting position by random jitter so nodes
        // never form the symmetric dice-5 pattern
        const j = jitterOffsets.current[i]
        sectionPhysics[i].pos.set(x + j.x, y + j.y, z)
      }
    })
    hasInitialized.current = true
  }, [size.width, size.height, camera, sectionPhysics])

  useFrame(() => {
    const { ambBx, ambBy, secBx, secBy } = boundsRef.current
    for (const n of sectionPhysics) bounceNode(n, secBx, secBy, SEC_BZ, 5.0, 0.00015)
    for (const n of ambientNodes)   bounceNode(n, ambBx, ambBy, AMB_BZ,  20,  0.0001)
  })

  const handleClick = useCallback(
    (id: string) => { onNodeClick(activeNode === id ? null : id) },
    [activeNode, onNodeClick]
  )

  if (!mounted) return null

  return (
    <>
      <CameraController activeNode={activeNode} sectionPhysics={sectionPhysics} />

      <ambientLight intensity={0.04} />
      <pointLight position={[4, 4, 6]}   intensity={0.2}  color="#7c3aed" />
      <pointLight position={[-4, -3, 4]} intensity={0.12} color="#4c1d95" />

      <PlexusEdges  ambientNodes={ambientNodes} sectionPhysics={sectionPhysics} hoveredNode={hoveredNode} />
      <PlexusFaces  ambientNodes={ambientNodes} sectionPhysics={sectionPhysics} />
      <DotCloud     ambientNodes={ambientNodes} />

      {SECTIONS.map((section, i) => (
        <SectionSphere
          key={section.id}
          section={section}
          physics={sectionPhysics[i]}
          isActive={activeNode === section.id}
          isHovered={hoveredNode === section.id}
          anyNodeActive={activeNode !== null}
          onHover={() => setHoveredNode(section.id)}
          onUnhover={() => setHoveredNode(null)}
          onClick={() => handleClick(section.id)}
        />
      ))}
    </>
  )
}
