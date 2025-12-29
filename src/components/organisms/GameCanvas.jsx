import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGameLoop } from "@/hooks/useGameLoop";
import enemyService from "@/services/api/enemyService";
import { calculateVelocityTowardsPlayer, checkCollision, createEngineTrail, createExplosion, generateId, getRandomSpawnPosition, isOutOfBounds } from "@/utils/gameHelpers";
// 3D Player Ship Component
const PlayerShip = ({ position, level, pitch, yaw }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Apply player rotation from mouse input
      meshRef.current.rotation.x = pitch;
      meshRef.current.rotation.y = yaw;
      // Subtle floating animation preserved but reduced
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
});

  const shipScale = 0.3 + (level - 1) * 0.05;
  const glowColor = level >= 3 ? "#00FFAA" : "#00D4FF";

  return (
    <group ref={meshRef} position={[position.x, position.y, 0]} scale={[shipScale, shipScale, shipScale]}>
      {/* Main ship body */}
      <mesh>
        <boxGeometry args={[2, 6, 1.5]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive={glowColor}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Ship nose cone */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[1, 3, 6]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.1}
        />
      </mesh>
      
      {/* Engine pods */}
      <mesh position={[-1.5, -2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
        <meshStandardMaterial
          color="#0099DD"
          emissive="#00D4FF"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[1.5, -2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
        <meshStandardMaterial
          color="#0099DD"
          emissive="#00D4FF"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.5, 4, 0.2]} />
        <meshStandardMaterial
          color={level >= 2 ? "#0099DD" : "#0088CC"}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.5, 4, 0.2]} />
        <meshStandardMaterial
          color={level >= 2 ? "#0099DD" : "#0088CC"}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Shield effect */}
      <mesh scale={[3, 3, 3]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 3D Enemy Ship Component
const EnemyShip = ({ enemy }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation based on movement direction
      const angle = Math.atan2(enemy.vy || 0, enemy.vx || 0);
      meshRef.current.rotation.z = angle + Math.PI / 2;
      
      // Subtle wobble
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3 + enemy.id.length) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[enemy.x, enemy.y, 0]}>
      {/* Main enemy body */}
      <mesh>
        <octahedronGeometry args={[enemy.size * 0.8, 0]} />
        <meshStandardMaterial
          color={enemy.color}
          emissive={enemy.color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Enemy engine trail */}
      <mesh position={[0, enemy.size * 0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.5, 1, 6]} />
        <meshStandardMaterial
          color={enemy.color}
          emissive={enemy.color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

// 3D Projectile Component
const Projectile = ({ projectile }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.3;
    }
  });

  return (
    <group position={[projectile.x, projectile.y, 0]}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Projectile glow */}
      <pointLight
        position={[0, 0, 0]}
        color="#00D4FF"
        intensity={2}
        distance={10}
        decay={2}
      />
    </group>
  );
};

// 3D Particle System
const ParticleSystem = ({ particles }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((particle, index) => {
        const particleData = particles[index];
        if (particleData) {
          particle.position.set(particleData.x, particleData.y, 0);
          particle.material.opacity = particleData.life;
          
          if (particleData.type === 'explosion') {
            particle.scale.setScalar(1 + (1 - particleData.life) * 2);
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={particle.id || index} position={[particle.x, particle.y, 0]}>
          <sphereGeometry args={[particle.size || 0.5, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.life}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main 3D Scene Component
const GameScene = ({ 
  player, 
  enemies, 
  projectiles, 
  particles, 
  gameState 
}) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#00D4FF" />
      
      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* Game objects */}
<PlayerShip position={player} level={gameState.level || 1} pitch={player.pitch} yaw={player.yaw} />
      
      {enemies.map((enemy) => (
        <EnemyShip key={enemy.id} enemy={enemy} />
      ))}
      
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}
      
      <ParticleSystem particles={particles} />
{/* Camera controls */}
<PerspectiveCamera
        makeDefault
        position={[player.x, player.y - 15, 18]}
        fov={70}
      />
    </>
  );
};

const GameCanvas = ({ 
  gameState, 
  onScoreUpdate, 
  onHealthUpdate, 
  onComboUpdate, 
  onGameOver, 
  isPaused 
}) => {
  const [player, setPlayer] = useState({ 
    x: 0, y: -20, z: 0, 
    health: 100, level: 1, 
    pitch: 0, yaw: 0,
    boost: false, boostEnergy: 100,
    mouseSensitivity: 0.001
  });
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [keys, setKeys] = useState({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
const [enemyTypes, setEnemyTypes] = useState([]);
  const lastFireTime = useRef(0);
  const lastEnemySpawn = useRef(0);
  const comboTimer = useRef(null);
  const containerRef = useRef();
  const canvasBounds = { width: 80, height: 60 }; // 3D world coordinates
  
  useEffect(() => {
    const loadEnemyTypes = async () => {
      try {
        const types = await enemyService.getAll();
        setEnemyTypes(types);
      } catch (error) {
        console.error("Failed to load enemy types:", error);
      }
    };
    
    loadEnemyTypes();
  }, []);

  // Mouse look controls component
  const MouseControls = () => {
    const { gl } = useThree();

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isPaused && document.pointerLockElement === gl.domElement) {
          const sensitivity = player.mouseSensitivity;
          setPlayer(prev => ({
            ...prev,
            yaw: prev.yaw - e.movementX * sensitivity,
            pitch: Math.max(-Math.PI/3, Math.min(Math.PI/3, prev.pitch - e.movementY * sensitivity))
          }));
        }
      };

      const handleClick = () => {
        if (!isPaused && gl.domElement) {
          gl.domElement.requestPointerLock();
        }
      };

      const canvas = gl.domElement;
      if (canvas) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);
        return () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('click', handleClick);
        };
      }
    }, [gl.domElement, isPaused, player.mouseSensitivity]);

    return null;
  };

  // Keyboard and mouse controls
useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const sensitivity = 0.002;
        const deltaX = e.movementX * sensitivity;
        const deltaY = e.movementY * sensitivity;
        
        setPlayer(prev => ({
          ...prev,
          yaw: prev.yaw + deltaX,
          pitch: Math.max(-Math.PI/3, Math.min(Math.PI/3, prev.pitch + deltaY))
        }));
      }
    };
    
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button
        setMouseDown(true);
      }
    };
    
    const handleMouseUp = (e) => {
      if (e.button === 0) {
        setMouseDown(false);
      }
    };
    
    const handleClick = () => {
      if (containerRef.current) {
        containerRef.current.requestPointerLock();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    if (containerRef.current) {
      containerRef.current.addEventListener("click", handleClick);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener("click", handleClick);
      }
    };
  }, []);
  
const fireProjectile = useCallback(() => {
    const now = Date.now();
    const fireRate = Math.max(150, 250 - gameState.level * 10);
    
    if (now - lastFireTime.current > fireRate) {
      // Calculate projectile direction based on player's aim
      const yawCos = Math.cos(player.yaw);
      const yawSin = Math.sin(player.yaw);
      const pitchCos = Math.cos(player.pitch);
      const pitchSin = Math.sin(player.pitch);
      
      setProjectiles(prev => [...prev, {
        id: generateId(),
x: player.x,
        y: player.y - 2,
        z: player.z,
        velocityX: yawSin * pitchCos * 1.5,
        velocityY: -pitchSin * 1.5,
        velocityZ: yawCos * pitchCos * 1.5,
        damage: 1 + Math.floor(gameState.level / 3),
        owner: "player"
      }]);
      
      lastFireTime.current = now;
    }
  }, [player.x, player.y, player.z, player.yaw, player.pitch, gameState.level]);
  
  const spawnEnemy = useCallback(() => {
    if (enemyTypes.length === 0) return;
    
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const spawnPos = getRandomSpawnPosition(canvasBounds.width, canvasBounds.height);
    const velocity = calculateVelocityTowardsPlayer(spawnPos, player, enemyType.speed * 0.1);
    
    const enemy = {
      id: generateId(),
      ...spawnPos,
      z: 0,
      vx: velocity.vx,
      vy: velocity.vy,
      vz: 0,
      health: enemyType.health,
      maxHealth: enemyType.health,
      color: enemyType.color,
      size: enemyType.size * 0.1,
      points: enemyType.points,
      type: enemyType.type
    };
    
    setEnemies(prev => [...prev, enemy]);
  }, [enemyTypes, player]);
  
const handleExplosion = useCallback((x, y, z, color) => {
    const explosionParticles = createExplosion(x, y, z, color);
    setParticles(prev => [...prev, ...explosionParticles]);
  }, []);
  
  useEffect(() => {
    if (gameState.level !== player.level) {
      setPlayer(prev => ({ ...prev, level: gameState.level }));
    }
  }, [gameState.level, player.level]);
  
  useEffect(() => {
    return () => {
      if (comboTimer.current) {
        clearTimeout(comboTimer.current);
      }
    };
  }, []);
  
  const updateGame = useCallback((deltaTime) => {
    if (isPaused) return;
    
    const dt = Math.min(deltaTime / 16.67, 2);
setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;
      let newZ = prev.z;
      let newBoostEnergy = prev.boostEnergy;
      const currentLevel = gameState.level || 1;
      
      const isBoostActive = keys[" "] || keys["space"];
      const baseSpeed = 1.2 + currentLevel * 0.2; // Enhanced base speed and level scaling
      const boostMultiplier = isBoostActive && newBoostEnergy > 0 ? 3.0 : 1.0; // Enhanced boost multiplier
      
      // Enhanced 3D movement with rotation
      const yawCos = Math.cos(prev.yaw);
      const yawSin = Math.sin(prev.yaw);
      const pitchCos = Math.cos(prev.pitch);
      const pitchSin = Math.sin(prev.pitch);
      
      let moveX = 0, moveY = 0, moveZ = 0;
      
      // WASD movement relative to player facing direction
// WASD movement relative to player facing direction
      const speed = baseSpeed * boostMultiplier * dt;
      if (keys["w"]) { // Forward
        moveX += yawSin * pitchCos * speed;
        moveY += -pitchSin * speed;
        moveZ += yawCos * pitchCos * speed;
      if (keys["s"]) { // Backward
        moveX -= yawSin * pitchCos * speed;
        moveY -= -pitchSin * speed;
        moveZ -= yawCos * pitchCos * speed;
      }
      if (keys["a"]) { // Strafe left
        moveX -= yawCos * speed;
        moveZ += yawSin * speed;
      }
      if (keys["d"]) { // Strafe right
        moveX += yawCos * speed;
        moveZ -= yawSin * speed;
      }
      if (keys["q"]) { // Up
        moveY += speed;
      }
      if (keys["e"]) { // Down
        moveY -= speed;
      }
      
      newX += moveX;
      newY += moveY;
      newZ += moveZ;
      
      // Enhanced boost effects
      if (isBoostActive && newBoostEnergy > 0) {
        newBoostEnergy = Math.max(0, newBoostEnergy - 1.5 * dt); // Slower energy drain
        
        // Enhanced boost particles with 3D positioning
        const trailParticles = createEngineTrail(
          newX - yawSin * pitchCos * 4, 
          newY + pitchSin * 4 + 1, 
          newZ - yawCos * pitchCos * 4, 
          "#00D4FF", 
          2.5 // Increased intensity
        );
        setParticles(prev => [...prev, ...trailParticles]);
      } else if (!isBoostActive && newBoostEnergy < 100) {
        newBoostEnergy = Math.min(100, newBoostEnergy + 0.8 * dt); // Faster recharge
      }
      
// Enhanced world boundaries with Y-axis
      const boundary = canvasBounds.width/2 - 5;
      const yBoundary = canvasBounds.height/2 - 5;
      newX = Math.max(-boundary, Math.min(boundary, newX));
      newY = Math.max(-yBoundary, Math.min(yBoundary, newY));
      newZ = Math.max(-boundary, Math.min(boundary, newZ));
      return { 
        ...prev, 
        x: newX, 
        y: newY, 
        z: newZ,
        level: currentLevel,
        boost: isBoostActive && prev.boostEnergy > 0,
        boostEnergy: newBoostEnergy
      };
    });
    
if (mouseDown) {
      fireProjectile();
    }
    
    setProjectiles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.velocityX * dt,
        y: p.y + p.velocityY * dt,
        z: p.z + (p.velocityZ || 0) * dt
      }))
      .filter(p => !isOutOfBounds(p.x, p.y, canvasBounds.width, canvasBounds.height))
    );
    
    const now = Date.now();
    const spawnRate = Math.max(1000, 2000 - gameState.level * 100);
    
    if (now - lastEnemySpawn.current > spawnRate) {
      spawnEnemy();
      lastEnemySpawn.current = now;
    }
    
setEnemies(prev => {
      let updatedEnemies = prev.map(enemy => ({
        ...enemy,
        x: enemy.x + enemy.vx * dt,
        y: enemy.y + enemy.vy * dt,
        z: enemy.z + (enemy.vz || 0) * dt
      })).filter(enemy => {
        // Check player collision with proper detection
        if (checkCollision(enemy, player, enemy.size * 0.8, 1.2)) {
          onHealthUpdate(prev => {
            const newHealth = Math.max(0, prev - 20);
            if (newHealth <= 0) {
              onGameOver();
            }
            return newHealth;
          });
handleExplosion(enemy.x, enemy.y, enemy.z, enemy.color);
          return false;
        }
        return !isOutOfBounds(enemy.x, enemy.y, canvasBounds.width, canvasBounds.height);
      });
      
      return updatedEnemies;
    });
    
    setProjectiles(prev => {
      const remainingProjectiles = [];
      const hitEnemyIds = new Set();
      
      prev.forEach(projectile => {
        if (projectile.owner === "player") {
          let hit = false;
          
          setEnemies(prevEnemies => {
return prevEnemies.map(enemy => {
              if (hit || hitEnemyIds.has(enemy.id)) return enemy;
              
              if (checkCollision(projectile, enemy, 0.5, enemy.size * 0.8)) {
                hit = true;
                hitEnemyIds.add(enemy.id);
                
                const newHealth = enemy.health - projectile.damage;
                
                if (newHealth <= 0) {
                  onScoreUpdate(gameState.score + enemy.points);
                  onComboUpdate(prev => {
                    const newCombo = prev + 1;
                    
                    if (comboTimer.current) {
                      clearTimeout(comboTimer.current);
                    }
                    
                    comboTimer.current = setTimeout(() => {
                      onComboUpdate(0);
                    }, 2000);
                    
                    return newCombo;
                  });
                  
handleExplosion(enemy.x, enemy.y, enemy.z, enemy.color);
                  return null;
                }
                
                return { ...enemy, health: newHealth };
              }
              
              return enemy;
            }).filter(Boolean);
          });
          
          if (!hit) {
            remainingProjectiles.push(projectile);
          }
        }
      });
      
      return remainingProjectiles;
    });
    
    setParticles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        z: p.z + (p.vz || 0) * dt,
        life: p.life - 0.02 * dt
      }))
      .filter(p => p.life > 0)
    );
}, [
    keys, 
    player, 
    gameState.level, 
    isPaused, 
    mouseDown,
    fireProjectile, 
    spawnEnemy, 
    handleExplosion,
    onScoreUpdate,
    onHealthUpdate,
    onComboUpdate,
    onGameOver
  ]);
  
  useGameLoop(updateGame, !isPaused);
  
  return (
<div 
      ref={containerRef}
      className="w-full h-full border-2 border-primary/30 rounded-lg shadow-2xl overflow-hidden cursor-crosshair"
      style={{ width: "800px", height: "600px", maxWidth: "100%" }}
      title="Click to enable mouse look controls"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        style={{ background: "linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 100%)" }}
>
        <MouseControls />
        <GameScene
          player={player}
          enemies={enemies}
          projectiles={projectiles}
          particles={particles}
          gameState={gameState}
        />
      </Canvas>
    </div>
  );
};

export default GameCanvas;