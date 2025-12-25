import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import enemyService from "@/services/api/enemyService";
import { 
  checkCollision, 
  isOutOfBounds, 
  getRandomSpawnPosition, 
  calculateVelocityTowardsPlayer,
  generateId 
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
    const particleCount = 20;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: generateId(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const updateGame = useCallback((deltaTime) => {
    if (isPaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dt = deltaTime / 16.67;
    
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
                  onScoreUpdate(prev => prev + enemy.points);
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
      
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % canvas.height;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(x, y, 1, 1);
      }
      
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        ctx.restore();
      });
      
      projectiles.forEach(projectile => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00D4FF";
        ctx.fillStyle = "#00D4FF";
        ctx.fillRect(projectile.x - 2, projectile.y - 8, 4, 16);
        ctx.restore();
      });
      
      enemies.forEach(enemy => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = enemy.color;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.size);
        ctx.lineTo(enemy.x - enemy.size * 0.7, enemy.y + enemy.size);
        ctx.lineTo(enemy.x + enemy.size * 0.7, enemy.y + enemy.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        const healthBarWidth = enemy.size * 2;
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - enemy.size - 8, healthBarWidth, 4);
        ctx.fillStyle = healthPercent > 0.5 ? "#00FF88" : healthPercent > 0.25 ? "#FFA500" : "#FF1744";
        ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - enemy.size - 8, healthBarWidth * healthPercent, 4);
      });
      
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00D4FF";
      ctx.fillStyle = "#00D4FF";
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 25);
      ctx.lineTo(player.x - 20, player.y + 25);
      ctx.lineTo(player.x, player.y + 15);
      ctx.lineTo(player.x + 20, player.y + 25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      ctx.strokeStyle = "#00D4FF";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, 40, 0, Math.PI * 2);
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