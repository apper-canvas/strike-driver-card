import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGameLoop } from "@/hooks/useGameLoop";
import enemyService from "@/services/api/enemyService";
import { calculateVelocityTowardsPlayer, checkCollision, createEngineTrail, createExplosion, generateId, getRandomSpawnPosition, isOutOfBounds } from "@/utils/gameHelpers";
// 3D Player Ship Component
const PlayerShip = ({ position, level }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const shipScale = 1 + (level - 1) * 0.1;
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
      <PlayerShip position={player} level={gameState.level || 1} />
      
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
        position={[0, 0, 50]}
        fov={60}
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
  const containerRef = useRef(null);
  const [player, setPlayer] = useState({ x: 0, y: -20, z: 0, health: 100, level: 1 });
  const [projectiles, setProjectiles] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [keys, setKeys] = useState({});
  const [enemyTypes, setEnemyTypes] = useState([]);
  const lastFireTime = useRef(0);
  const lastEnemySpawn = useRef(0);
  const comboTimer = useRef(null);
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
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  
  const fireProjectile = useCallback(() => {
    const now = Date.now();
    const fireRate = Math.max(150, 250 - gameState.level * 10);
    
    if (now - lastFireTime.current > fireRate) {
      setProjectiles(prev => [...prev, {
        id: generateId(),
        x: player.x,
        y: player.y - 3,
        z: 0,
        velocityX: 0,
        velocityY: -0.8 - gameState.level * 0.1,
        velocityZ: 0,
        damage: 1 + Math.floor(gameState.level / 3),
        owner: "player"
      }]);
      
      lastFireTime.current = now;
    }
  }, [player.x, player.y, gameState.level]);
  
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
  
  const createExplosion = useCallback((x, y, z, color) => {
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
      const currentLevel = gameState.level || 1;
      const speed = 0.5 + currentLevel * 0.05;
      
      if (keys["arrowleft"] || keys["a"]) newX -= speed;
      if (keys["arrowright"] || keys["d"]) newX += speed;
      if (keys["arrowup"] || keys["w"]) newY -= speed;
      if (keys["arrowdown"] || keys["s"]) newY += speed;
      
      newX = Math.max(-canvasBounds.width/2 + 3, Math.min(canvasBounds.width/2 - 3, newX));
      newY = Math.max(-canvasBounds.height/2 + 3, Math.min(canvasBounds.height/2 - 3, newY));
      
      return { ...prev, x: newX, y: newY, level: currentLevel };
    });
    
    if (keys[" "] || keys["space"]) {
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
      }));
      
      updatedEnemies = updatedEnemies.filter(enemy => {
        if (checkCollision(enemy, player, enemy.size * 10, 2.5)) {
          onHealthUpdate(prev => {
            const newHealth = Math.max(0, prev - 20);
            if (newHealth <= 0) {
              onGameOver();
            }
            return newHealth;
          });
          createExplosion(enemy.x, enemy.y, enemy.z, enemy.color);
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
              
              if (checkCollision(projectile, enemy, 0.5, enemy.size * 10)) {
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
                  
                  createExplosion(enemy.x, enemy.y, enemy.z, enemy.color);
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
    fireProjectile, 
    spawnEnemy, 
    createExplosion,
    onScoreUpdate,
    onHealthUpdate,
    onComboUpdate,
    onGameOver
  ]);
  
  useGameLoop(updateGame, !isPaused);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full border-2 border-primary/30 rounded-lg shadow-2xl overflow-hidden"
      style={{ width: "800px", height: "600px", maxWidth: "100%" }}
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