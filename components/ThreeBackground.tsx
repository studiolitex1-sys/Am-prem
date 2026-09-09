'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  themeColor?: string; // hex
}

export default function ThreeBackground({ themeColor = '#10b981' }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // smooth on mobile
    container.appendChild(renderer.domElement);

    // Color conversion
    const baseColor = new THREE.Color(themeColor);

    // Geometry 1: Organic Floating Ambient Sphere (Soft Wireframe)
    const sphereGeo = new THREE.IcosahedronGeometry(9, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Geometry 2: Floating Organic Orbit Ring
    const ringGeo = new THREE.TorusGeometry(14, 0.15, 16, 90);
    const ringMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3.2;
    ring.rotation.y = Math.PI / 6;
    scene.add(ring);

    // Geometry 3: Delicate Natural Firefly Starfield
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 180 : 320;
    const posArray = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 70;
      posArray[i + 1] = (Math.random() - 0.5) * 70;
      posArray[i + 2] = (Math.random() - 0.5) * 50;

      speeds[i] = (Math.random() - 0.5) * 0.01;
      speeds[i + 1] = Math.random() * 0.015 + 0.005; // Gentle upward drift like fireflies
      speeds[i + 2] = (Math.random() - 0.5) * 0.01;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: isMobile ? 0.35 : 0.45,
      color: baseColor,
      transparent: true,
      opacity: 0.65,
    });

    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    // Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Soft natural rotations
      sphere.rotation.x = Math.sin(elapsedTime * 0.15) * 0.3;
      sphere.rotation.y = elapsedTime * 0.08;

      ring.rotation.z = elapsedTime * 0.04;
      ring.rotation.x = Math.PI / 3.2 + Math.cos(elapsedTime * 0.2) * 0.1;

      // Particle floating drift
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += speeds[i];
        if (positions[i] > 35) {
          positions[i] = -35;
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;

      // Smooth camera interpolation
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      camera.position.x = mouseX * 2.5;
      camera.position.y = mouseY * 2.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [themeColor]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-75 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
