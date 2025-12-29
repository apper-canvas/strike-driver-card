export const checkCollision = (obj1, obj2, radius1 = 20, radius2 = 20) => {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const dz = (obj1.z || 0) - (obj2.z || 0);
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance < radius1 + radius2;
};

export const isOutOfBounds = (x, y, width, height) => {
  return x < -50 || x > width + 50 || y < -50 || y > height + 50;
};

export const getRandomSpawnPosition = (width, height) => {
  const side = Math.floor(Math.random() * 4);
  const spawnDistance = 8;
  
  switch (side) {
    case 0: // Top
      return { x: (Math.random() - 0.5) * width, y: height/2 + spawnDistance, z: 0 };
    case 1: // Right
      return { x: width/2 + spawnDistance, y: (Math.random() - 0.5) * height, z: 0 };
    case 2: // Bottom
      return { x: (Math.random() - 0.5) * width, y: -height/2 - spawnDistance, z: 0 };
    case 3: // Left
      return { x: -width/2 - spawnDistance, y: (Math.random() - 0.5) * height, z: 0 };
    default:
      return { x: (Math.random() - 0.5) * width, y: height/2 + spawnDistance, z: 0 };
  }
};

export const calculateVelocityTowardsPlayer = (enemy, player, speed) => {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dz = (player.z || 0) - (enemy.z || 0);
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return {
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    vz: (dz / distance) * speed
  };
};

export const generateId = () => {
return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Draw detailed rocket sprite with rotation
export const drawRocket = (ctx, x, y, size, color, angle = 0, level = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Level-based scaling and glow enhancement
  const levelScale = 1 + (level - 1) * 0.05;
  const glowIntensity = 15 + (level * 3);
  ctx.scale(levelScale, levelScale);
  
  // Rocket body with enhanced glow
  ctx.shadowBlur = glowIntensity;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.4, -size, size * 0.8, size * 1.5);
  
  // Rocket nose cone with level-based enhancement
  ctx.fillStyle = level >= 3 ? "#FFAA00" : color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size * 0.4, -size * 0.6);
  ctx.lineTo(size * 0.4, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  
  // Rocket fins with level-based alpha
  const finAlpha = Math.min(0.8 + (level * 0.1), 1.0);
  const finColor = color.replace('rgb', 'rgba').replace(')', `, ${finAlpha})`);
  ctx.fillStyle = finColor;
  ctx.fillRect(-size * 0.6, size * 0.3, size * 0.2, size * 0.5);
  ctx.fillRect(size * 0.4, size * 0.3, size * 0.2, size * 0.5);
  
  // Engine glow with level enhancement
  ctx.shadowBlur = 10 + (level * 2);
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.3, size * 0.5, size * 0.6, size * 0.3);
  
  ctx.restore();
};

// Create explosion particle effect with 3D support
export const createExplosion = (x, y, z = 0, color) => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const phi = Math.acos(1 - 2 * Math.random()); // Spherical distribution
    const theta = 2 * Math.PI * Math.random();
    const velocity = Math.random() * 0.3 + 0.1;
    
    particles.push({
      id: `explosion-${i}-${Date.now()}`,
      x: x,
      y: y,
      z: z,
      vx: Math.sin(phi) * Math.cos(theta) * velocity,
      vy: Math.sin(phi) * Math.sin(theta) * velocity,
      vz: Math.cos(phi) * velocity,
      life: 1,
      maxLife: 1,
      color: color,
      size: Math.random() * 0.8 + 0.4,
      type: 'explosion'
    });
  }
  return particles;
};

// Create engine trail particles with 3D support
export const createEngineTrail = (x, y, z = 0, color, intensity = 1) => {
  const particles = [];
  const particleCount = Math.ceil(3 * intensity);
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: `trail-${i}-${Date.now()}`,
      x: x + (Math.random() - 0.5) * (0.4 + intensity * 0.2),
      y: y + (Math.random() - 0.5) * (0.4 + intensity * 0.2),
      z: z + (Math.random() - 0.5) * (0.4 + intensity * 0.2),
      vx: (Math.random() - 0.5) * (0.1 + intensity * 0.08),
      vy: Math.random() * (0.2 + intensity * 0.15) + 0.1,
      vz: (Math.random() - 0.5) * (0.1 + intensity * 0.05),
      life: Math.random() * (0.5 + intensity * 0.4) + 0.5,
      color: intensity > 1.5 ? "#00FFAA" : color,
      type: 'trail',
      size: Math.random() * (0.3 + intensity * 0.2) + 0.2,
      intensity: intensity
    });
  }
  return particles;
};