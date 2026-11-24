"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as T from "three";
import type { OrbitControls as Orbit } from "three-stdlib";
import { Component, type ReactNode } from "react";
import { Waves } from "lucide-react";
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <Waves />
        The interactive view is unavailable on this device.
      </div>
    ) : (
      this.props.children
    );
  }
}
type V = [number, number, number];
const TAU = 2 * Math.PI;
function Disc({
  at,
  r,
  depth,
  color,
  scale = [1, 1, 1],
}: {
  at: V;
  r: number;
  depth: number;
  color: string;
  scale?: V;
}) {
  return (
    <mesh position={at} scale={scale}>
      <cylinderGeometry args={[r, r * 0.98, depth, 64]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Branch({ a, b, r, color }: { a: V; b: V; r: number; color: string }) {
  const start = new T.Vector3(...a),
    end = new T.Vector3(...b),
    axis = end.clone().sub(start);
  return (
    <mesh
      position={start.lerp(end, 0.5)}
      quaternion={new T.Quaternion().setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        axis.clone().normalize(),
      )}
    >
      <cylinderGeometry args={[r * 0.67, r, axis.length(), 7]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Bulb({ at, r = 0.045 }: { at: V; r?: number }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[r, 8, 6]} />
      <meshBasicMaterial color="#ffe2a0" toneMapped={false} />
    </mesh>
  );
}
function Tree({ day }: { day: boolean }) {
  return (
    <group position={[-1, 0.12, -0.48]}>
      <Branch a={[0, 0, 0]} b={[0.12, 2.25, 0.03]} r={0.2} color="#704930" />
      {Array.from({ length: 13 }, (_, i) => {
        const angle = i * 2.4,
          reach = 1.15 + 0.5 * Math.sin(i * 4.1),
          y = 2.15 + 0.48 * Math.sin(i * 1.8);
        const tip: V = [Math.cos(angle) * reach, y, Math.sin(angle) * reach],
          bend: V = [tip[0] * 0.42, y - 0.46, tip[2] * 0.5];
        return (
          <group key={i}>
            <Branch
              a={[0.08, 1.1 + i * 0.047, 0]}
              b={bend}
              r={0.085}
              color="#755032"
            />
            <Branch a={bend} b={tip} r={0.047} color="#92623d" />
            <mesh
              position={[tip[0], y + 0.43, tip[2]]}
              scale={[0.73, 0.34, 0.63]}
              rotation={[i, i * 0.6, 0]}
            >
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color={i % 2 ? "#376b53" : "#4c7754"}
                roughness={0.92}
              />
            </mesh>
            {[0.25, 0.52, 0.84, 1].map((s, j) => (
              <Bulb
                key={j}
                at={[
                  tip[0] * s,
                  y - 0.42 + 0.4 * s - 0.09 * (j % 2),
                  tip[2] * s,
                ]}
              />
            ))}
          </group>
        );
      })}
      <Sparkles
        opacity={day ? 0.12 : 0.95}
        count={45}
        scale={[3.6, 1.8, 3]}
        position={[0, 1.9, 0]}
        size={2.8}
        speed={0.24}
        color="#ffc269"
      />
    </group>
  );
}
function StringLights({ a, b, sag = 0.24 }: { a: V; b: V; sag?: number }) {
  const points = useMemo(
    () =>
      Array.from({ length: 17 }, (_, i) => {
        const t = i / 16;
        return new T.Vector3(...a)
          .lerp(new T.Vector3(...b), t)
          .add(new T.Vector3(0, -4 * sag * t * (1 - t), 0));
      }),
    [a, b, sag],
  );
  const wire = useMemo(() => new T.CatmullRomCurve3(points), [points]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[wire, 24, 0.012, 4, false]} />
        <meshStandardMaterial color="#75603e" />
      </mesh>
      {points
        .filter((_, i) => i % 2 === 0)
        .map((point, i) => (
          <Bulb key={i} at={[point.x, point.y - 0.035, point.z]} r={0.048} />
        ))}
    </group>
  );
}
function PlaceSetting({ at }: { at: V }) {
  return (
    <group position={at}>
      <Disc at={[0, 0, 0]} r={0.098} depth={0.018} color="#f7ecce" />
      <Disc at={[0, 0.014, 0]} r={0.069} depth={0.011} color="#d9c9a5" />
    </group>
  );
}
function Water({ day }: { day: boolean }) {
  const time = useRef({ value: 0 });
  useFrame((_, dt) => {
    time.current.value += Math.min(dt, 0.08);
  });
  const geometry = useMemo(() => {
    const g = new T.PlaneGeometry(2, 2, 64, 52),
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      p.setXYZ(
        i,
        x * Math.sqrt(1 - (y * y) / 2) * 4.75,
        0,
        -y * Math.sqrt(1 - (x * x) / 2) * 3.4,
      );
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} position-y={0.04}>
      <meshPhysicalMaterial
        color={day ? "#39b5a7" : "#146f79"}
        metalness={0.23}
        roughness={0.22}
        clearcoat={1}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = time.current;
          shader.vertexShader =
            "uniform float uTime;\n" +
            shader.vertexShader
              .replace(
                "#include <beginnormal_vertex>",
                "#include <beginnormal_vertex>\nobjectNormal.x += .12*cos(position.x*6. + uTime); objectNormal.z += .08*sin(position.z*7. + uTime*.8);",
              )
              .replace(
                "#include <begin_vertex>",
                "#include <begin_vertex>\ntransformed.y += .015*sin(position.x*6. + uTime)+.012*cos(position.z*7. + uTime*.8);",
              );
        }}
      />
    </mesh>
  );
}
function Pod() {
  return (
    <group position={[-1.55, 0.12, 1.2]}>
      <Disc at={[0, 0.04, 0]} r={1.08} depth={0.19} color="#d2b78b" />
      {Array.from({ length: 11 }, (_, i) => {
        const a = 0.24 + i * 0.45;
        return (
          <group
            key={i}
            position={[Math.sin(a) * 0.87, 0.23, Math.cos(a) * 0.87]}
            rotation={[0, a, 0]}
          >
            <mesh>
              <boxGeometry args={[0.4, 0.36, 0.28]} />
              <meshStandardMaterial color="#d6c7ad" />
            </mesh>
            <mesh position={[0, 0.2, 0.09]}>
              <boxGeometry args={[0.38, 0.25, 0.095]} />
              <meshStandardMaterial color="#ebe0c7" />
            </mesh>
          </group>
        );
      })}
      <Disc at={[0, 0.27, 0]} r={0.1} depth={0.38} color="#754f38" />
      <Disc at={[0, 0.48, 0]} r={0.5} depth={0.07} color="#926f4a" />
      <PlaceSetting at={[0.28, 0.53, 0.09]} />
      <PlaceSetting at={[-0.28, 0.53, -0.09]} />
      <Disc at={[0, 0.57, 0]} r={0.055} depth={0.12} color="#c28d42" />
      <Bulb at={[0, 0.65, 0]} r={0.044} />
    </group>
  );
}
function Tent({ day }: { day: boolean }) {
  return (
    <group position={[2, 0.06, -1.12]}>
      <Disc at={[0, 0.09, 0]} r={1.32} depth={0.24} color="#a28158" />
      <Disc at={[0, 0.235, 0]} r={1.15} depth={0.08} color="#e1c69b" />
      <mesh position-y={1.38} rotation-y={0.6}>
        <coneGeometry args={[1.27, 2.38, 16, 1, true, 0.52, TAU - 1.28]} />
        <meshStandardMaterial
          color="#fff1d5"
          side={T.DoubleSide}
          roughness={0.92}
        />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = 0.99 + (i * (TAU - 1.28)) / 6;
        return (
          <Branch
            key={i}
            a={[1.24 * Math.sin(a), 0.24, 1.24 * Math.cos(a)]}
            b={[-0.09 * Math.sin(a), 2.76, -0.09 * Math.cos(a)]}
            r={0.032}
            color="#a97945"
          />
        );
      })}
      <Disc at={[0, 0.36, 0]} r={0.54} depth={0.16} color="#a85448" />
      <Bulb at={[0, 1.38, 0.24]} r={0.12} />
      <pointLight
        position={[0, 1, 0.45]}
        intensity={day ? 0.65 : 7}
        distance={4}
        color="#ffae4b"
      />
    </group>
  );
}
function Boat() {
  const points = useMemo(
    () =>
      [
        [0.06, 0],
        [0.48, 0.09],
        [0.68, 0.34],
        [0.6, 0.35],
        [0.42, 0.14],
        [0.02, 0.11],
      ].map(([x, y]) => new T.Vector2(x, y)),
    [],
  );
  return (
    <group position={[2.06, 0.08, 1.25]} rotation-y={-0.55}>
      <mesh scale={[1.9, 1, 0.78]}>
        <latheGeometry args={[points, 32]} />
        <meshStandardMaterial color="#ae7446" side={T.DoubleSide} />
      </mesh>
      {[-0.69, 0.69].map((x) => (
        <mesh key={x} position={[x, 0.29, 0]}>
          <boxGeometry args={[0.2, 0.09, 0.67]} />
          <meshStandardMaterial color="#dac292" />
        </mesh>
      ))}
      <Disc at={[0, 0.36, 0]} r={0.34} depth={0.09} color="#d3aa77" />
      <Bulb at={[0, 0.46, 0]} />
    </group>
  );
}
const zones: V[] = [
  [-1.5, 0.4, 1.0],
  [2, 0.7, -1.1],
  [2, 0.25, 1.2],
];
function Camera({ zone }: { zone: number }) {
  const c = useRef<Orbit>(null),
    blend = useRef(1),
    prev = useRef(zone),
    lastScroll = useRef(0);
  const { gl } = useThree();
  useFrame(({ camera }, dt) => {
    if (prev.current !== zone) {
      prev.current = zone;
      blend.current = 1;
    }
    const rect = gl.domElement.getBoundingClientRect(),
      progress = T.MathUtils.clamp(
        (window.innerHeight * 0.5 - rect.top) / window.innerHeight,
        -1,
        1,
      );
    if (c.current) {
      camera.position.y += (progress - lastScroll.current) * 0.45;
      lastScroll.current = progress;
      if (blend.current > 0.012) {
        const target =
            zone < 0
              ? new T.Vector3(0, 0.55, 0)
              : new T.Vector3(...zones[zone]),
          offset =
            zone < 0
              ? new T.Vector3(6.2, 7.1, 8.9)
              : new T.Vector3(3.9, 3.4, 5.5);
        const k = 1 - Math.exp(-dt * 4.2);
        c.current.target.lerp(target, k);
        camera.position.lerp(target.add(offset), k);
        blend.current *= 1 - k;
      }
      c.current.update();
    }
  });
  return (
    <OrbitControls
      ref={c}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={0.42}
      maxPolarAngle={1.22}
      enableDamping
      onStart={() => {
        blend.current = 0;
      }}
    />
  );
}
export default function LagoonScene3D({
  zone,
  active,
  day,
}: {
  day: boolean;
  zone: number;
  active: boolean;
}) {
  return (
    <SceneBoundary>
      <Canvas
        aria-label="Interactive 3D lagoon with dining pod, teepee cabana and boat table"
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [6.2, 7.7, 8.9], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[day ? "#dae9e2" : "#10252d"]} />
        <hemisphereLight args={[day ? "#fff5dc" : "#b8d8f4", "#476964", day ? 2.1 : 0.85]} />
        <directionalLight
          position={[-3, 7, 5]}
          intensity={day ? 2.5 : 1.15}
          color={day ? "#fff1d5" : "#a8c6ea"}
        />
        <directionalLight
          position={[3, 4, -4]}
          intensity={day ? 1.5 : 3.2}
          color="#ffb957"
        />
        <Disc
          at={[0, -0.24, 0]}
          r={1}
          scale={[4.95, 1, 3.56]}
          depth={0.5}
          color="#9c805a"
        />
        <Water day={day} />
        <Disc at={[-1, 0.045, -0.48]} r={0.68} depth={0.13} color="#9f9562" />
        <Tree day={day} />
        <Branch
          a={[-2.9, 0.06, -1.7]}
          b={[-2.9, 1.85, -1.7]}
          r={0.039}
          color="#85653c"
        />
        <StringLights a={[-2.9, 1.85, -1.7]} b={[-1, 2.08, -0.51]} />
        <StringLights a={[-1, 2.08, -0.51]} b={[2, 2.65, -1.12]} sag={0.46} />
        <StringLights
          a={[-2.39, 2.08, 0.19]}
          b={[-0.22, 2.1, 0.62]}
          sag={0.31}
        />
        <Pod />
        <Tent day={day} />
        <Boat />
        {Array.from({ length: 8 }, (_, i) => (
          <Disc
            key={i}
            at={[-3.5 + i * 0.51, 0.066, -0.25 + Math.sin(i * 0.64) * 0.42]}
            r={0.22}
            depth={0.08}
            color="#dfccb0"
          />
        ))}
        <Camera zone={zone} />
      </Canvas>
    </SceneBoundary>
  );
}
