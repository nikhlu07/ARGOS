import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleSphereProps {
  className?: string;
}

export const ParticleSphere: React.FC<ParticleSphereProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    mouse: THREE.Vector2;
    targetRotation: THREE.Euler;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create particles in Fibonacci sphere distribution
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const radius = 1.5;

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y) * radius;
      const theta = phi * i;

      positions[i * 3] = Math.cos(theta) * radiusAtY;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY;

      // 85% gray, 15% orange-volt
      const isOrangeVolt = Math.random() < 0.15;
      if (isOrangeVolt) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.51;
        colors[i * 3 + 2] = 0.05;
      } else {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.5;
      }

      sizes[i] = Math.random() * 2 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const mouse = new THREE.Vector2();
    const targetRotation = new THREE.Euler(0, 0, 0);

    sceneRef.current = { scene, camera, renderer, particles, mouse, targetRotation };

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (sceneRef.current) {
        const { particles, mouse, targetRotation } = sceneRef.current;

        // Auto-rotate
        targetRotation.y += 0.002;
        particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.05;
        particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.05;

        // Mouse interaction - subtle tilt
        targetRotation.x = mouse.y * 0.2;
        targetRotation.y += mouse.x * 0.001;

        // Update particle colors for proximity effect
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const colors = particles.geometry.attributes.color.array as Float32Array;
        const mousePos3D = new THREE.Vector3(mouse.x * 2, mouse.y * 2, 0);

        for (let i = 0; i < positions.length / 3; i++) {
          const vertex = new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
          );
          vertex.applyEuler(particles.rotation);

          const distance = vertex.distanceTo(mousePos3D);
          const proximity = Math.max(0, 1 - distance / 2);

          // Differentiate between orange and gray particles based on blue color channel
          const isOrangeParticle = colors[i * 3 + 2] < 0.4;

          if (isOrangeParticle) {
            if (proximity > 0.3) {
              // Brighten to orange-white
              colors[i * 3] = 1.0;
              colors[i * 3 + 1] = 0.51 + (1 - 0.51) * proximity;
              colors[i * 3 + 2] = 0.05 + (1 - 0.05) * proximity;
            } else {
              // Reset to base orange
              colors[i * 3] = 1.0;
              colors[i * 3 + 1] = 0.51;
              colors[i * 3 + 2] = 0.05;
            }
          }
        }

        particles.geometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);

      if (sceneRef.current) {
        sceneRef.current.renderer.dispose();
        sceneRef.current.particles.geometry.dispose();
        (sceneRef.current.particles.material as THREE.Material).dispose();
        container.removeChild(sceneRef.current.renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};
