"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, Canvas } from "@react-three/fiber"
import * as THREE from "three"

// Premium gradient shader with subtle fluid dynamics
const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Ultra-subtle wave distortion
    pos.y += sin(pos.x * 3.0 + time * 0.3) * 0.02;
    pos.x += cos(pos.y * 2.5 + time * 0.25) * 0.015;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  
  // Improved Perlin-like noise
  float noise(vec2 p) {
    return sin(p.x * 0.5 + time * 0.1) * cos(p.y * 0.4 + time * 0.08) * 0.5
         + sin(p.x * 1.2 - time * 0.15) * cos(p.y * 1.5 + time * 0.12) * 0.3
         + sin(p.x * 2.5 + time * 0.2) * cos(p.y * 2.0 - time * 0.1) * 0.2;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Multi-layered noise for depth
    float n1 = noise(uv * 3.0);
    float n2 = noise(uv * 1.5 + vec2(time * 0.05, 0.0));
    float n3 = noise(uv * 0.8 + vec2(0.0, time * 0.03));
    
    float totalNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    totalNoise = smoothstep(-0.5, 0.5, totalNoise);
    
    // Three-color gradient blend with smooth transitions
    vec3 color = mix(color1, color2, totalNoise);
    color = mix(color, color3, abs(sin(totalNoise * 3.14 + time * 0.1)) * 0.4);
    
    // Radial gradient for subtle vignette
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float vignette = smoothstep(0.0, 1.2, 1.0 - dist);
    
    // Subtle glow in center
    float glow = exp(-dist * dist * 2.5) * 0.3;
    color += glow * color3;
    
    // Final blend with ultra-subtle effect
    float alpha = mix(0.15, 0.35, totalNoise) * vignette;
    
    gl_FragColor = vec4(color, alpha);
  }
`

export function PremiumShaderPlane({
  position,
  color1 = "#0a0a0a",
  color2 = "#1a1a2e",
  color3 = "#b8860b",
}: {
  position: [number, number, number]
  color1?: string
  color2?: string
  color3?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
      color3: { value: new THREE.Color(color3) },
    }),
    [color1, color2, color3],
  )

  useFrame((state) => {
    if (mesh.current) {
      uniforms.time.value = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[2.5, 2.5, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Subtle animated light orbs
export function LightOrb({
  position,
  scale = 0.3,
  color = "#d4a574",
}: {
  position: [number, number, number]
  scale?: number
  color?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.08
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[scale, 32, 32]} />
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.15}
        fog={false}
      />
    </mesh>
  )
}

export function AnimatedBackground({
  color1 = "#0a0a0a",
  color2 = "#1a1a2e",
  color3 = "#c68642",
}: {
  color1?: string
  color2?: string
  color3?: string
}) {
  return (
    <Canvas
      className="absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 1.2], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Subtle light orbs scattered throughout */}
      <LightOrb position={[0.5, 0.3, 0.1]} scale={0.4} color="#d4a574" />
      <LightOrb position={[-0.6, -0.4, 0.05]} scale={0.35} color="#c68642" />
      <LightOrb position={[0.2, -0.5, 0.08]} scale={0.3} color="#b8860b" />
      <LightOrb position={[-0.4, 0.5, 0.06]} scale={0.32} color="#daa520" />

      {/* Main shader plane */}
      <PremiumShaderPlane position={[0, 0, 0]} color1={color1} color2={color2} color3={color3} />

      {/* Subtle ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 1]} intensity={0.2} color="#c68642" />
    </Canvas>
  )
}
