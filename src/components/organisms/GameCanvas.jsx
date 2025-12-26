import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import enemyService from "@/services/api/enemyService";
import { 
  calculateVelocityTowardsPlayer, 
  checkCollision, 
  createEngineTrail, 
  createExplosion, 
  drawRocket, 
  generateId, 
  getRandomSpawnPosition, 
  isOutOfBounds 
} from "@/utils/gameHelpers";

const GameCanvas = ({ 
  gameState, 
  onScoreUpdate, 
  onHealthUpdate, 
  onComboUpdate, 
  onGameOver,
  isPaused 
}) => {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: 400, y: 500, health: 100 });
  const [projectiles, setProjectiles] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [keys, setKeys] = useState({});
  const [enemyTypes, setEnemyTypes] = useState([]);
  const lastFireTime = useRef(0);
  const lastEnemySpawn = useRef(0);
  const comboTimer = useRef(null);

  useEffect(() => {
    const loadEnemyTypes = async () => {
      const types = await enemyService.getAll();
      setEnemyTypes(types);
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
    if (now - lastFireTime.current > 200) {
      setProjectiles(prev => [...prev, {
        id: generateId(),
        x: player.x,
        y: player.y - 20,
        velocityX: 0,
        velocityY: -8,
        damage: 1,
        owner: "player"
      }]);
      lastFireTime.current = now;
    }
  }, [player.x, player.y]);

  const spawnEnemy = useCallback(async () => {
    if (enemyTypes.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const spawnPos = getRandomSpawnPosition(canvas.width, canvas.height);
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    const newEnemy = {
      id: generateId(),
      x: spawnPos.x,
      y: spawnPos.y,
      type: enemyType.type,
      health: enemyType.health,
      maxHealth: enemyType.health,
      speed: enemyType.speed,
      points: enemyType.points,
      color: enemyType.color,
      size: enemyType.size,
      vx: 0,
      vy: 0
    };
    
    const velocity = calculateVelocityTowardsPlayer(newEnemy, player, enemyType.speed);
    newEnemy.vx = velocity.vx;
    newEnemy.vy = velocity.vy;
    
    setEnemies(prev => [...prev, newEnemy]);
  }, [enemyTypes, player]);

const createExplosion = useCallback((x, y, color) => {
    const particleCount = 30;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
      const speed = 1.5 + Math.random() * 4;
      const size = 2 + Math.random() * 4;
      newParticles.push({
        id: generateId(),
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        decay: 0.015 + Math.random() * 0.01,
        size: size,
        initialSize: size,
        color,
        type: 'explosion'
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);
  const updateGame = useCallback((deltaTime) => {
    if (isPaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
const dt = Math.min(deltaTime / 16.67, 2); // Cap delta time for smooth animations
    
    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;
      const speed = 5;
      
      if (keys["arrowleft"] || keys["a"]) newX -= speed;
      if (keys["arrowright"] || keys["d"]) newX += speed;
      if (keys["arrowup"] || keys["w"]) newY -= speed;
      if (keys["arrowdown"] || keys["s"]) newY += speed;
      
      newX = Math.max(30, Math.min(canvas.width - 30, newX));
      newY = Math.max(30, Math.min(canvas.height - 30, newY));
      
      return { ...prev, x: newX, y: newY };
    });
    
    if (keys[" "] || keys["space"]) {
      fireProjectile();
    }
    
    setProjectiles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.velocityX * dt,
        y: p.y + p.velocityY * dt
      }))
      .filter(p => !isOutOfBounds(p.x, p.y, canvas.width, canvas.height))
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
        y: enemy.y + enemy.vy * dt
      }));
      
      updatedEnemies = updatedEnemies.filter(enemy => {
        if (checkCollision(enemy, player, enemy.size, 25)) {
          onHealthUpdate(prev => {
            const newHealth = Math.max(0, prev - 20);
            if (newHealth <= 0) {
              onGameOver();
            }
            return newHealth;
          });
          createExplosion(enemy.x, enemy.y, enemy.color);
          return false;
        }
        return !isOutOfBounds(enemy.x, enemy.y, canvas.width, canvas.height);
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
              
              if (checkCollision(projectile, enemy, 5, enemy.size)) {
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
                  
                  createExplosion(enemy.x, enemy.y, enemy.color);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
const ctx = canvas.getContext("2d");
    
    const render = () => {
      ctx.fillStyle = "#0F0F1E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Enhanced starfield with twinkling effect
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % canvas.height;
        const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * twinkle})`;
        ctx.fillRect(x, y, 1, 1);
      }
      
// Enhanced particle system with smooth interpolation
      particles.forEach((particle, index) => {
        ctx.save();
        
        // Smooth alpha transition with easing
        const lifeRatio = particle.life / (particle.maxLife || 1);
        const easedAlpha = lifeRatio * lifeRatio * (3 - 2 * lifeRatio); // Smoothstep
        ctx.globalAlpha = easedAlpha;
        
        if (particle.type === 'explosion') {
          // Enhanced explosion with size animation
          const sizeMultiplier = 1 + (1 - lifeRatio) * 0.5;
          const currentSize = particle.size * sizeMultiplier;
          
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0, 
            particle.x, particle.y, currentSize * 1.5
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.4, particle.color.replace('1)', '0.8)'));
          gradient.addColorStop(0.8, particle.color.replace('1)', '0.3)'));
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradient;
          
          // Motion blur effect
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = currentSize * 0.3;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === 'trail') {
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
        } else {
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        }
        
        ctx.restore();
      });
      
      // Enhanced projectiles with trail effects
      projectiles.forEach(projectile => {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00D4FF";
        
        // Draw projectile trail
        for (let i = 0; i < 5; i++) {
          const alpha = (5 - i) / 5;
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = "#00D4FF";
          ctx.fillRect(projectile.x - 2, projectile.y - 8 + i * 3, 4, 12);
        }
        
        // Main projectile
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(projectile.x - 2, projectile.y - 8, 4, 16);
        ctx.restore();
      });
      
// Render enemies as detailed rockets with engine trails
      enemies.forEach(enemy => {
        // Smooth rotation angle based on movement direction
        const targetAngle = Math.atan2(enemy.vy || 0, enemy.vx || 0) + Math.PI / 2;
        enemy.angle = enemy.angle || targetAngle;
        
        // Smooth angle interpolation for fluid rotation
        const angleDiff = targetAngle - enemy.angle;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        enemy.angle += normalizedDiff * 0.15;
        
        // Create enhanced engine trail particles
        if (Math.random() < 0.9) {
          const engineTrail = createEngineTrail(
            enemy.x - Math.sin(enemy.angle) * (enemy.size + 5),
            enemy.y + Math.cos(enemy.angle) * (enemy.size + 5),
            enemy.color
          );
          particles.push(...engineTrail);
        }
        
        // Draw rocket with rotation
        drawRocket(ctx, enemy.x, enemy.y, enemy.size, enemy.color, enemy.angle);
        
        // Enhanced health bar with glow effect
        const healthBarWidth = enemy.size * 2.5;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - enemy.size - 12, healthBarWidth, 6);
        
        const healthColor = healthPercent > 0.5 ? "#00FF88" : healthPercent > 0.25 ? "#FFA500" : "#FF1744";
        ctx.shadowColor = healthColor;
        ctx.shadowBlur = 6;
        ctx.fillStyle = healthColor;
        ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - enemy.size - 12, healthBarWidth * healthPercent, 6);
        ctx.restore();
      });
      
// Enhanced player rocket with smooth rotation and dynamic effects
      const targetPlayerAngle = 0; // Initialize target angle for player
      player.angle = player.angle || targetPlayerAngle;
      
      // Smooth player rotation with interpolation
      const playerAngleDiff = targetPlayerAngle - player.angle;
      const normalizedPlayerDiff = Math.atan2(Math.sin(playerAngleDiff), Math.cos(playerAngleDiff));
      player.angle += normalizedPlayerDiff * 0.2;
      
      // Enhanced player engine trail with dynamic intensity
      const speed = Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2);
      const trailIntensity = Math.min(speed / 10, 1);
      
      if (Math.random() < 0.95) {
        const engineTrail = createEngineTrail(
          player.x - Math.sin(player.angle) * 35,
          player.y + Math.cos(player.angle) * 35,
          "#00D4FF",
          trailIntensity
        );
        particles.push(...engineTrail);
      }
      
// Draw player rocket
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      // Rocket body
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#00D4FF";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-8, -30, 16, 45);
      
      // Rocket nose cone
      ctx.fillStyle = "#00D4FF";
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(-8, -15);
      ctx.lineTo(8, -15);
      ctx.closePath();
      ctx.fill();
      
      // Rocket fins
      ctx.fillStyle = "#0088CC";
      ctx.fillRect(-12, 10, 8, 15);
      ctx.fillRect(4, 10, 8, 15);
      
      // Engine glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00D4FF";
      ctx.fillStyle = "#00D4FF";
      ctx.fillRect(-6, 15, 12, 8);
      
      ctx.restore();
      
      // Player shield indicator with pulse effect
      const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(0, 212, 255, ${pulseIntensity})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    render();
  }, [player, projectiles, enemies, particles]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border-2 border-primary/30 rounded-lg shadow-2xl"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
};

export default GameCanvas;