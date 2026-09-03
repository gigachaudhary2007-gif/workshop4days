import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Study3DAnimationProps {
  className?: string;
}

export const Study3DAnimation: React.FC<Study3DAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [crystalMode, setCrystalMode] = useState<'emerald-gem' | 'quantum-sphere'>('emerald-gem');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Transparent background so it fits flawlessly inside the app's emerald liquid glass theme
    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Camera distance fits the 3D cluster vertically from top to bottom with zero vacant gaps
    const fitCamera = (w: number, h: number) => {
      camera.aspect = w / h;
      camera.position.z = 4.8;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    fitCamera(width, height);

    container.appendChild(renderer.domElement);

    // Group for whole rotating cluster
    const cluster = new THREE.Group();
    scene.add(cluster);

    // --- 1. Inner Gem / Core ---
    const coreGeo =
      crystalMode === 'emerald-gem'
        ? new THREE.IcosahedronGeometry(1.2, 0)
        : new THREE.OctahedronGeometry(1.2, 1);

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x16835b,
      emissive: 0x0a4d33,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.4,
      ior: 1.5,
      reflectivity: 0.9,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cluster.add(coreMesh);

    // --- 2. Outer Geodesic Wireframe Lattice ---
    const wireGeo = new THREE.IcosahedronGeometry(1.42, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    cluster.add(wireMesh);

    // --- 3. Dual Gyroscopic Orbiting Knowledge Rings & Lower Orbit Ring ---
    const ringGeo1 = new THREE.TorusGeometry(1.85, 0.025, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x10e862,
      emissive: 0x0d9f48,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    cluster.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.05, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    cluster.add(ring2);

    // Lower orbital harmonic ring that occupies the lower section so there is no empty space below
    const lowerRingGeo = new THREE.TorusGeometry(1.6, 0.018, 16, 80);
    const lowerRingMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x065f46,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.85,
    });
    const lowerRing = new THREE.Mesh(lowerRingGeo, lowerRingMat);
    lowerRing.position.y = -1.25;
    lowerRing.rotation.x = Math.PI / 2.3;
    cluster.add(lowerRing);

    // Upper balancing harmonic ring
    const upperRingGeo = new THREE.TorusGeometry(1.3, 0.015, 16, 80);
    const upperRingMat = new THREE.MeshStandardMaterial({
      color: 0xa7f3d0,
      emissive: 0x047857,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
    });
    const upperRing = new THREE.Mesh(upperRingGeo, upperRingMat);
    upperRing.position.y = 1.35;
    upperRing.rotation.x = -Math.PI / 2.5;
    cluster.add(upperRing);

    // --- 4. Floating Orbiting Node Beads on Rings ---
    const beadGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bead1 = new THREE.Mesh(beadGeo, beadMat);
    cluster.add(bead1);

    const bead2 = new THREE.Mesh(beadGeo, beadMat);
    cluster.add(bead2);

    const bead3 = new THREE.Mesh(beadGeo, beadMat);
    cluster.add(bead3);

    // --- 5. Ambient Knowledge Star Dust Particles (Flowing all the way to the bottom) ---
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical/helical distribution vertically across entire canvas height (-2.6 to +2.6)
      const r = 0.6 + Math.random() * 1.6;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * r;
      // Span continuously from -2.7 at the bottom to +2.7 at the top
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 2.7;
      positions[i * 3 + 2] = Math.sin(angle) * r * 0.7;
      speeds[i] = 0.003 + Math.random() * 0.007;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    cluster.add(particles);

    // --- 6. Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xecfdf5, 2.0);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x10e862, 3.0, 10);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x059669, 2.5, 8);
    bottomGlow.position.set(0, -3, 2);
    scene.add(bottomGlow);

    // Mouse interactive target rotation
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.7;
      targetRotX = -y * 0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth spin
      coreMesh.rotation.y += 0.012;
      coreMesh.rotation.x += 0.007;

      wireMesh.rotation.y -= 0.008;
      wireMesh.rotation.z += 0.005;

      ring1.rotation.z += 0.015;
      ring2.rotation.y -= 0.018;
      lowerRing.rotation.z -= 0.014;
      upperRing.rotation.y += 0.012;

      // Position beads on rings
      const t1 = elapsedTime * 1.5;
      bead1.position.x = Math.cos(t1) * 1.85;
      bead1.position.y = Math.sin(t1) * 1.85 * Math.cos(Math.PI / 3);
      bead1.position.z = Math.sin(t1) * 1.85 * Math.sin(Math.PI / 3);

      const t2 = -elapsedTime * 1.2;
      bead2.position.x = Math.cos(t2) * 2.05;
      bead2.position.y = Math.sin(t2) * 2.05 * Math.sin(Math.PI / 4);
      bead2.position.z = Math.sin(t2) * 2.05 * Math.cos(Math.PI / 4);

      const t3 = elapsedTime * 1.6;
      bead3.position.x = Math.cos(t3) * 1.6;
      bead3.position.y = -1.25 + Math.sin(t3) * 0.2;
      bead3.position.z = Math.sin(t3) * 1.6 * 0.4;

      // Rotate star particles
      particles.rotation.y += 0.003;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

      // Gentle floating levitation
      cluster.position.y = Math.sin(elapsedTime * 1.8) * 0.12;

      // Smooth mouse tilt interpolation
      cluster.rotation.y += (targetRotY - cluster.rotation.y) * 0.08;
      cluster.rotation.x += (targetRotX - cluster.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          fitCamera(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      lowerRingGeo.dispose();
      lowerRingMat.dispose();
      upperRingGeo.dispose();
      upperRingMat.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [crystalMode]);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-white/70 via-emerald-50/40 to-emerald-100/40 backdrop-blur-md border border-emerald-200/80 shadow-[0_4px_16px_rgba(22,131,91,0.06)] cursor-grab active:cursor-grabbing ${className}`}
      onClick={() => setCrystalMode((prev) => (prev === 'emerald-gem' ? 'quantum-sphere' : 'emerald-gem'))}
      title="Click to toggle 3D Crystal mode"
    >
      {/* Subtle background ambient radial blur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,232,98,0.14),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(22,131,91,0.12),transparent_75%)] pointer-events-none" />

      {/* 3D WebGL Canvas Container - pure animation with no text or badges */}
      <div ref={containerRef} className="w-full h-full pointer-events-auto touch-pan-y overflow-hidden" />
    </div>
  );
};
