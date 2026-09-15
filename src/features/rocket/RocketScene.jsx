import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import * as THREE from "three";

const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, t) => {
  const p = clamp((t - a) / (b - a), 0, 1);
  return p * p * (3 - 2 * p);
};
// 轨迹参数化：以地心为原点的极坐标。前 9 秒纯垂直上升，之后俯仰角随时间
// 三次方增长，模拟真实的重力转向（gravity turn）。高度 = 平移过的 smoothstep：
// 离台即有稳定初速（快速离塔），随后加速爬升，燃尽时径向速度归零、
// 自然转入水平。全部导数解析计算，航向角无差分噪声。
const LIFTOFF = 9;
const BURNOUT = 80;
const STAGE_SEP = 45;
const FAIRING_SEP = 55;
const TURN_DELAY = 9;
const ASCENT_SPAN = BURNOUT - LIFTOFF;
// alt(s) = ALT_SCALE * (smoothstep((s+8)/79) - ALT_BASE)
const ALT_BASE = 0.028687;
const ALT_SCALE = 122 / (1 - ALT_BASE);
const posAt = (s) => {
  const p = clamp((s + 8) / 79, 0, 1);
  const altitude = ALT_SCALE * (p * p * (3 - 2 * p) - ALT_BASE);
  const turn = Math.max(0, s - TURN_DELAY);
  const angle = 3.57e-6 * turn * turn * turn;
  const radius = 182 + altitude;
  return {
    angle,
    radius,
    x: Math.sin(angle) * radius,
    y: Math.cos(angle) * radius - 182,
    // 解析导数：径向/切向速度分量
    dRadius: ALT_SCALE * (6 * p * (1 - p)) / 79,
    dAngle: 1.071e-5 * turn * turn,
  };
};
const flight = (time) => {
  const s = clamp(time - LIFTOFF, 0, ASCENT_SPAN);
  const base = posAt(s);
  if (time > BURNOUT) {
    const angle = base.angle + (time - BURNOUT) * 0.031;
    return {
      angle,
      heading: angle + Math.PI / 2,
      radius: base.radius,
      x: Math.sin(angle) * base.radius,
      y: Math.cos(angle) * base.radius - 182,
    };
  }
  // 航向 = 轨道角 + 相对当地竖直方向的俯仰角（由速度的径向/切向分量决定）
  const pitch = Math.atan2(base.radius * base.dAngle, base.dRadius);
  return { ...base, heading: base.angle + pitch };
};
function Cylinder({ y, height, radius, color = "#e9edf0", metalness = 0.45 }) {
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 48]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={0.32}
      />
    </mesh>
  );
}
function Satellite({ unfold = 0, packed = false }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.85, 1.05, 0.85]} />
        <meshStandardMaterial
          color="#c99e45"
          metalness={0.85}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0.63, 0]} rotation={[0.3, 0, 0]}>
        <sphereGeometry args={[0.43, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#eef1ee"
          side={THREE.DoubleSide}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {packed
        ? [-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.48, 0, 0]}>
              <boxGeometry args={[0.06, 1, 0.8]} />
              <meshStandardMaterial
                color="#162e59"
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
          ))
        : [-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.48, 0, 0]}
              rotation={[0, 0, side * (1 - unfold) * 1.4]}
            >
              <mesh position={[side * 1.1, 0, 0]}>
                <boxGeometry args={[2.1, 0.05, 0.95]} />
                <meshStandardMaterial
                  color="#122f66"
                  metalness={0.65}
                  roughness={0.23}
                />
              </mesh>
              {Array.from({ length: 7 }, (_, i) => (
                <mesh key={i} position={[side * (0.15 + i * 0.3), 0.03, 0]}>
                  <boxGeometry args={[0.015, 0.012, 0.93]} />
                  <meshBasicMaterial color="#70a4c9" />
                </mesh>
              ))}
            </group>
          ))}
    </group>
  );
}
function Rocket({ time }) {
  const booster = useRef(),
    left = useRef(),
    right = useRef(),
    flame = useRef(),
    satellite = useRef(),
    body = useRef();
  useFrame(() => {
    const t = time.current.time;
    // 一级分离：分离瞬间继承火箭速度，随后在重力下减速、翻滚、坠向地球。
    // 部件挂在火箭组内，每帧把期望的世界坐标换算回火箭局部坐标。
    if (t < STAGE_SEP) {
      booster.current.position.set(0, 0, 0);
      booster.current.rotation.set(0, 0, 0);
      booster.current.visible = true;
    } else {
      const dt = t - STAGE_SEP;
      const p0 = flight(STAGE_SEP);
      const p1 = flight(STAGE_SEP + 0.4);
      const vx = (p1.x - p0.x) / 0.4;
      const vy = (p1.y - p0.y) / 0.4;
      const gDirX = -Math.sin(p0.angle);
      const gDirY = -Math.cos(p0.angle);
      const kickX = Math.sin(p0.heading) * -0.9 + Math.sin(p0.angle) * 0.5;
      const kickY = Math.cos(p0.heading) * -0.9 + Math.cos(p0.angle) * 0.5;
      const G = 3;
      const wx = p0.x + (vx + kickX) * dt + 0.5 * G * gDirX * dt * dt;
      const wy = p0.y + (vy + kickY) * dt + 0.5 * G * gDirY * dt * dt;
      const cur = flight(t);
      const dx = wx - cur.x;
      const dy = wy - cur.y;
      const h = cur.heading;
      booster.current.position.set(
        Math.cos(h) * dx - Math.sin(h) * dy,
        Math.sin(h) * dx + Math.cos(h) * dy,
        0,
      );
      booster.current.rotation.z = dt * 0.5;
      booster.current.rotation.x = dt * 0.2;
      booster.current.visible = dt < 15;
    }
    body.current.visible = t < 132;
    // 点火后、离台前的振动：推力建立时箭体在台上轻微抖动
    const rumble = smooth(7, 7.6, t) * (1 - smooth(8.6, 10.5, t));
    body.current.position.x = rumble * 0.02 * Math.sin(t * 87);
    body.current.position.y = rumble * 0.014 * Math.sin(t * 113);
    // 整流罩：分离后向两侧飘开并翻滚坠落
    const f = Math.max(0, t - FAIRING_SEP);
    left.current.position.set(-f * 0.45, 9 + f * 0.5 - f * f * 0.07, 0);
    right.current.position.set(f * 0.45, 9 + f * 0.5 - f * f * 0.07, 0);
    left.current.rotation.z = f * 0.7;
    right.current.rotation.z = -f * 0.7;
    left.current.rotation.x = f * 0.3;
    right.current.rotation.x = -f * 0.3;
    left.current.visible = right.current.visible = f < 13;
    const burning = t >= 7 && t < BURNOUT && (t < STAGE_SEP || t > STAGE_SEP + 2);
    flame.current.visible = burning;
    flame.current.position.y = t < STAGE_SEP ? -0.4 : 5.6;
    const throttle = t < 9 ? smooth(7, 8.2, t) : 1;
    const flicker = 1 + 0.05 * Math.sin(t * 31) + 0.03 * Math.sin(t * 47.3);
    flame.current.scale.set(throttle * flicker, throttle * (1 + 0.09 * Math.sin(t * 23)), throttle * flicker);
    flame.current.children.forEach((child) => {
      if (child.isPointLight) child.intensity = 120 * throttle * flicker;
    });
    satellite.current.visible = t < BURNOUT;
  });
  return (
    <group ref={body}>
      <group ref={booster}>
        <Cylinder y={3} height={6} radius={0.72} />
        <Cylinder y={0.4} height={0.55} radius={0.75} color="#263039" />
        <Cylinder y={5.6} height={0.55} radius={0.735} color="#25333e" />
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, -0.1, 0]}>
            <cylinderGeometry args={[0.18, 0.25, 0.45, 20]} />
            <meshStandardMaterial
              color="#363f45"
              metalness={0.9}
              roughness={0.4}
            />
          </mesh>
        ))}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((r, i) => (
          <group key={i} rotation={[0, r, 0]}>
            <mesh position={[0.7, 1.15, 0]} rotation={[0, 0, -0.15]}>
              <boxGeometry args={[0.55, 1.5, 0.07]} />
              <meshStandardMaterial color="#b6c0c5" metalness={0.6} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.725, 3.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[1.15, 0.18]} />
          <meshBasicMaterial color="#ce4237" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Cylinder y={7.15} height={2.3} radius={0.68} />
      <Cylinder y={6.15} height={0.25} radius={0.69} color="#202b34" />
      <Cylinder y={8.2} height={0.17} radius={0.7} color="#84949f" />
      <group ref={satellite} position={[0, 9.1, 0]}>
        <Satellite packed />
      </group>
      {[0, 1].map((half) => (
        <group key={half} ref={half ? right : left}>
          <mesh
            position={[0, 0.02, 0]}
            rotation={[0, half * Math.PI, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[0.83, 0.83, 1.6, 32, 1, true, 0, Math.PI]}
            />
            <meshStandardMaterial
              color="#f0f1e9"
              metalness={0.35}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[0, 1.28, 0]}
            rotation={[0, half * Math.PI, 0]}
            castShadow
          >
            <coneGeometry args={[0.83, 0.95, 32, 1, true, 0, Math.PI]} />
            <meshStandardMaterial
              color="#f0f1e9"
              metalness={0.35}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      <group ref={flame}>
        <mesh position={[0, -3.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.72, 6.4, 32]} />
          <meshBasicMaterial
            color="#ff5a1f"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -2.3, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.5, 4.6, 32]} />
          <meshBasicMaterial
            color="#ff9b3d"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -1.35, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.3, 2.8, 32]} />
          <meshBasicMaterial
            color="#fff6d8"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.95}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.42, 20, 14]} />
          <meshBasicMaterial
            color="#ffe9b8"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
        <pointLight intensity={120} color="#ff9b47" distance={26} />
      </group>
    </group>
  );
}
function groundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const pixels = context.createImageData(256, 256);
  let seed = 42;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const noise = seed / 2147483647;
    pixels.data[i] = 88 + noise * 52;
    pixels.data[i + 1] = 96 + noise * 52;
    pixels.data[i + 2] = 68 + noise * 38;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(90, 90);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function LaunchSite({ time }) {
  const terrain = useMemo(() => groundTexture(), []);
  const root = useRef();
  const smoke = useRef();
  useFrame(() => {
    const t = time.current.time;
    root.current.visible = t < 28;
    const groundOpacity = 1 - smooth(16, 28, t);
    root.current.traverse((object) => {
      if (object.isMesh && object.parent !== smoke.current) {
        object.material.transparent = groundOpacity < 1;
        object.material.opacity = groundOpacity;
        object.material.depthWrite = groundOpacity === 1;
      }
    });
    smoke.current.children.forEach((m, i) => {
      const age = Math.max(0, t - 7) - i * 0.055;
      m.visible = age > 0 && t < 26;
      const wave = (age % 6) / 6;
      const angle = i * 2.399;
      // 沿导流槽向两侧贴地扩散，后期缓慢上扬
      const drift = 2.5 + wave * 20;
      m.position.set(
        Math.cos(angle) * drift,
        0.8 + wave * wave * 5 + Math.sin(i * 7.1) * 0.3,
        Math.sin(angle) * drift,
      );
      m.scale.setScalar(0.9 + wave * 4.2 + Math.sin(i * 3.7) * 0.2);
      m.material.opacity = (1 - wave) * (1 - wave) * 0.16;
    });
  });
  return (
    <group ref={root}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.65, 0]}
        receiveShadow
      >
        <planeGeometry args={[650, 650]} />
        <meshStandardMaterial map={terrain} color="#a0a995" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[145, -0.5, -60]}>
        <planeGeometry args={[210, 650]} />
        <meshStandardMaterial color="#447e97" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[17, 0.6, 18]} />
        <meshStandardMaterial color="#aaa99e" />
      </mesh>
      {[-10, 10].map((x) => (
        <mesh key={x} position={[x, -0.29, 24]}>
          <boxGeometry args={[5, 0.12, 38]} />
          <meshStandardMaterial color="#454b4b" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.25, 48]} />
        <meshStandardMaterial color="#3b4547" metalness={0.5} />
      </mesh>
      <group position={[-3.2, 0, -1.2]}>
        {[-0.6, 0.6].flatMap((x) =>
          [-0.6, 0.6].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 6, z]} castShadow>
              <boxGeometry args={[0.16, 12, 0.16]} />
              <meshStandardMaterial color="#b1b8b6" metalness={0.6} />
            </mesh>
          )),
        )}
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i}>
            <mesh position={[0, i * 1.5 + 0.1, 0]} castShadow>
              <boxGeometry args={[1.7, 0.13, 1.7]} />
              <meshStandardMaterial color="#818d91" />
            </mesh>
            <mesh position={[0, i * 1.5 + 0.75, 0.61]} rotation={[0, 0, 0.7]}>
              <boxGeometry args={[0.09, 1.95, 0.09]} />
              <meshStandardMaterial color="#d8d5c9" />
            </mesh>
          </group>
        ))}
        {[5, 8, 10].map((y) => (
          <mesh key={y} position={[1.2, y, 0]} castShadow>
            <boxGeometry args={[2.1, 0.16, 0.35]} />
            <meshStandardMaterial color="#a5afaa" />
          </mesh>
        ))}
      </group>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[-26 - (i % 4) * 7, 1.2, -22 - Math.floor(i / 4) * 10]}
          castShadow
        >
          <boxGeometry args={[4, 2.5, 6]} />
          <meshStandardMaterial
            color={i % 2 ? "#d3cabc" : "#869390"}
            roughness={0.9}
          />
        </mesh>
      ))}
      {[-10, 10].flatMap((x) =>
        Array.from({ length: 9 }, (_, i) => (
          <mesh
            key={`${x}-${i}`}
            position={[x, -0.21, 8 + i * 4]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.12, 2]} />
            <meshStandardMaterial color="#ddd8bd" />
          </mesh>
        )),
      )}
      {[-18, -23, -28].map((x) => (
        <group key={x} position={[x, 0, 8]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[1.6, 1.6, 4, 32]} />
            <meshStandardMaterial
              color="#c6caca"
              metalness={0.65}
              roughness={0.38}
            />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <sphereGeometry
              args={[1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color="#bcc3c5"
              metalness={0.65}
              roughness={0.38}
            />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={`hill-${i}`}
          position={[-180 + i * 20, 1, -155 - Math.sin(i) * 25]}
          scale={[22, 10 + Math.sin(i * 4) * 5, 18]}
        >
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#5e7065" roughness={1} />
        </mesh>
      ))}
      <group ref={smoke}>
        {Array.from({ length: 90 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial
              color={i % 3 ? "#cfcdc2" : "#e3e1d6"}
              transparent
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
// 入轨拉远完成后把相机交给用户：拖动环绕地球与卫星，滚轮缩放
const FREE_VIEW_TIME = 100;
function FreeViewControls({ clockRef }) {
  const controls = useRef();
  useFrame(() => {
    if (!controls.current) return;
    const free = clockRef.current.time >= FREE_VIEW_TIME;
    if (controls.current.enabled !== free) controls.current.enabled = free;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={195}
      maxDistance={1600}
      target={[0, -182, 0]}
    />
  );
}
function World({ clockRef }) {
  const rocket = useRef(),
    sat = useRef(),
    globe = useRef(),
    orbit = useRef(),
    stars = useRef(),
    atmosphere = useRef();
  const earth = useTexture("/rocket/earth-day.jpg", (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });
  const target = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const sky = useMemo(() => new THREE.Color(), []);
  useFrame(({ camera, scene }) => {
    const t = clockRef.current.time,
      p = flight(t);
    rocket.current.position.set(p.x, p.y, 0);
    rocket.current.rotation.z = -p.heading;
    const release = Math.max(0, t - 80);
    // Preserve the payload's world position at release, then coast along its orbit.
    const releasePose = flight(80);
    const releaseX = releasePose.x + Math.sin(releasePose.heading) * 9.1;
    const releaseY = releasePose.y + 182 + Math.cos(releasePose.heading) * 9.1;
    const a = Math.atan2(releaseX, releaseY) + release * 0.031;
    const r = Math.hypot(releaseX, releaseY) + smooth(80, 90, t) * 2;
    sat.current.visible = t >= 80;
    sat.current.position.set(Math.sin(a) * r, Math.cos(a) * r - 182, 0);
    sat.current.rotation.z = -a;
    sat.current.rotation.y = release * 0.07;
    sat.current.scale.setScalar(1 + smooth(88, 102, t) * 11);
    // 地球自转：由任务时间推导，暂停/重置/倍速天然同步
    globe.current.children[0].rotation.y = -1.1 + t * 0.008;
    // 地球从始至终可见：发射台立在地球表面，爬升时地球自然后退、
    // 地平线弧度随高度逐渐显现，没有切入切出。
    globe.current.visible = true;
    stars.current.visible = t > 38;
    // 大气穹顶随高度淡出，露出 scene.background 的天空色
    atmosphere.current.children[0].material.uniforms.uFade.value =
      1 - smooth(14, 30, t);
    scene.fog.color.copy(sky);
    scene.fog.near = 120 + smooth(10, 32, t) * 1500;
    scene.fog.far = 600 + smooth(10, 32, t) * 1500;
    orbit.current.visible = t >= 95;
    orbit.current.material.opacity = smooth(95, 103, t) * 0.4;
    // Remain close to the satellite throughout deployment; pull out only after its wings open.
    const zoom = smooth(88, 98, t);
    const followSatellite = smooth(80, 83, t);
    const focusX = THREE.MathUtils.lerp(p.x, Math.sin(a) * r, followSatellite);
    const focusY = THREE.MathUtils.lerp(
      p.y + 5,
      Math.cos(a) * r - 182,
      followSatellite,
    );
    // 拉远完成后相机交给 OrbitControls，剧本镜头不再接管
    if (t < FREE_VIEW_TIME) {
      target.set(focusX, focusY, 0).lerp(new THREE.Vector3(0, -182, 0), zoom);
      const d = (1 + smooth(12, 45, t) * 0.3) * (1 - followSatellite * 0.52);
      // 爬升中后段镜头逐渐抬到火箭上方俯视，地球弧线进入画面；
      // 分离与整流罩阶段保持俯视，能看到一级坠向地面，入轨前恢复平视。
      const lookdown = smooth(24, 50, t) * (1 - smooth(70, 82, t));
      pos
        .set(
          focusX + THREE.MathUtils.lerp(19, 7, lookdown) * d,
          focusY + THREE.MathUtils.lerp(5, 30, lookdown) * d,
          THREE.MathUtils.lerp(28, 16, lookdown) * d,
        )
        .lerp(
          new THREE.Vector3(400, 282, 760)
            .multiplyScalar(Math.max(1, 1.1 / camera.aspect))
            .add(new THREE.Vector3(0, -182, 0)),
          zoom,
        );
      // 点火与离台时的镜头震动，随高度增加迅速衰减；一级分离时轻微一震
      const shake =
        smooth(7, 7.5, t) * (1 - smooth(10, 14, t)) * (t > 80 ? 0 : 1) +
        0.5 * smooth(45, 45.4, t) * (1 - smooth(46.5, 49, t));
      camera.position.set(
        pos.x + 0.22 * shake * Math.sin(t * 61.7),
        pos.y + 0.18 * shake * Math.sin(t * 53.3),
        pos.z,
      );
      camera.lookAt(target);
    }
    sky.set("#7fa8c2").lerp(new THREE.Color("#030812"), smooth(20, 58, t));
    scene.background = sky;
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[90, 130, 70]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={300}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={["#bddcff", "#5e6659", 0.6]} />
      <fog attach="fog" args={["#9db6c2", 120, 600]} />
      <group ref={atmosphere}>
        <mesh>
          <sphereGeometry args={[1400, 48, 24]} />
          <shaderMaterial
            side={THREE.BackSide}
            transparent
            depthWrite={false}
            uniforms={{ uFade: { value: 1 } }}
            vertexShader={
              "varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
            }
            fragmentShader={
              "varying vec3 vP; uniform float uFade; void main(){ float h=normalize(vP).y*0.5+0.5; vec3 c=mix(vec3(.66,.77,.84), vec3(.14,.36,.64), smoothstep(.46,.82,h)); gl_FragColor=vec4(c,uFade); }"
            }
          />
        </mesh>
      </group>
      <group ref={stars}>
        <Stars
          radius={950}
          depth={150}
          count={3000}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />
      </group>
      <FreeViewControls clockRef={clockRef} />
      <LaunchSite time={clockRef} />
      <group ref={rocket}>
        <Rocket time={clockRef} />
      </group>
      <group ref={sat}>
        <DeployedSatellite clockRef={clockRef} />
      </group>
      <group ref={globe} position={[0, -182, 0]}>
        <mesh rotation={[0, -1.1, 0.08]} receiveShadow>
          <sphereGeometry args={[181.4, 128, 96]} />
          <meshStandardMaterial
            map={earth}
            emissiveMap={earth}
            emissive="#6d7f8d"
            emissiveIntensity={0.6}
            roughness={0.8}
            metalness={0.07}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[183, 96, 64]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            uniforms={{}}
            vertexShader={
              "varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}"
            }
            fragmentShader={
              "varying vec3 n;varying vec3 v;void main(){float a=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(.12,.48,1.,a*.68);}"
            }
          />
        </mesh>
      </group>
      <mesh ref={orbit} position={[0, -182, 0]}>
        <torusGeometry args={[306, 0.23, 8, 256]} />
        <meshBasicMaterial color="#72d3cb" transparent opacity={0.4} />
      </mesh>
    </>
  );
}
function DeployedSatellite({ clockRef }) {
  const group = useRef();
  useFrame(() => {
    group.current.children[0].children
      .slice(2)
      .forEach(
        (wing, i) =>
          (wing.rotation.z =
            (i ? 1 : -1) * (1 - smooth(82, 89, clockRef.current.time)) * 1.4),
      );
  });
  return (
    <group ref={group}>
      <Satellite />
    </group>
  );
}
// 辉光后期：尾焰、发动机火光等高光向外泛光，是尾焰"发光感"的主要来源
function Effects() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(size.width, size.height, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const effectComposer = new EffectComposer(gl, target);
    effectComposer.addPass(new RenderPass(scene, camera));
    effectComposer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        0.34,
        0.45,
        1.3,
      ),
    );
    effectComposer.addPass(new OutputPass());
    return effectComposer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);
  useEffect(() => {
    composer.setSize(size.width, size.height);
    return () => composer.dispose();
  }, [composer, size]);
  useFrame(() => composer.render(), 1);
  return null;
}
export default function RocketScene({ clockRef, onCreated }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={{ position: [19, 10, 28], fov: 42, near: 0.1, far: 3000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 0.92;
        onCreated?.(state);
      }}
    >
      <World clockRef={clockRef} />
      <Effects />
    </Canvas>
  );
}
