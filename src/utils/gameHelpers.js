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
  
  // Prevent division by zero and ensure proper 3D tracking
  if (distance < 0.1) {
    return { vx: 0, vy: 0, vz: 0 };
  }
  
  return {
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    vz: (dz / distance) * speed
  };
};

export const generateId = () => {
return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Draw detailed rocket sprite with enhanced level progression
export const drawRocket = (ctx, x, y, size, color, angle = 0, level = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Enhanced level-based scaling and effects
  const levelScale = 1 + (level - 1) * 0.08; // Increased scaling
  const glowIntensity = 18 + (level * 4); // Enhanced glow
  ctx.scale(levelScale, levelScale);
  
  // Rocket body with progressive enhancement
  ctx.shadowBlur = glowIntensity;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.4, -size, size * 0.8, size * 1.5);
  
  // Advanced nose cone with level tiers
  ctx.fillStyle = level >= 5 ? "#FF00FF" : level >= 3 ? "#FFAA00" : color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size * 0.4, -size * 0.6);
  ctx.lineTo(size * 0.4, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  
  // Enhanced fins with level progression
  const finAlpha = Math.min(0.7 + (level * 0.15), 1.0);
  const finColor = color.includes('rgb') ? 
    color.replace('rgb', 'rgba').replace(')', `, ${finAlpha})`) : 
    `rgba(0, 212, 255, ${finAlpha})`;
  ctx.fillStyle = finColor;
  ctx.fillRect(-size * 0.6, size * 0.3, size * 0.25, size * 0.5);
  ctx.fillRect(size * 0.35, size * 0.3, size * 0.25, size * 0.5);
  
  // Enhanced engine glow with level tiers
  ctx.shadowBlur = 12 + (level * 3);
  ctx.shadowColor = level >= 4 ? "#00FFAA" : color;
  ctx.fillStyle = level >= 4 ? "#00FFAA" : color;
  ctx.fillRect(-size * 0.3, size * 0.5, size * 0.6, size * 0.4);
  
  ctx.restore();
};

// Create enhanced explosion particle effect with improved 3D distribution
export const createExplosion = (x, y, z = 0, color) => {
  const particles = [];
  const particleCount = 25; // Increased particle count
  
  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(1 - 2 * Math.random()); // Spherical distribution
    const theta = 2 * Math.PI * Math.random();
    const velocity = Math.random() * 0.4 + 0.15; // Increased velocity range
    
    particles.push({
      id: `explosion-${i}-${Date.now()}-${Math.random()}`,
      x: x + (Math.random() - 0.5) * 0.5, // Initial spread
      y: y + (Math.random() - 0.5) * 0.5,
      z: z + (Math.random() - 0.5) * 0.5,
      vx: Math.sin(phi) * Math.cos(theta) * velocity,
      vy: Math.sin(phi) * Math.sin(theta) * velocity,
      vz: Math.cos(phi) * velocity,
      life: Math.random() * 0.8 + 0.8, // Variable lifetime
      maxLife: Math.random() * 0.8 + 0.8,
      color: color,
      size: Math.random() * 1.0 + 0.5, // Larger particles
      type: 'explosion'
    });
  }
  return particles;
};

// Create enhanced engine trail particles with improved 3D effects
export const createEngineTrail = (x, y, z = 0, color, intensity = 1) => {
  const particles = [];
  const particleCount = Math.ceil(4 * intensity); // Increased particle density
  
  for (let i = 0; i < particleCount; i++) {
    const spread = 0.5 + intensity * 0.3; // Enhanced spread
    const velocityRange = 0.12 + intensity * 0.1; // Better velocity distribution
    
    particles.push({
      id: `trail-${i}-${Date.now()}-${Math.random()}`,
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      z: z + (Math.random() - 0.5) * spread,
      vx: (Math.random() - 0.5) * velocityRange,
      vy: Math.random() * (0.25 + intensity * 0.2) + 0.1,
      vz: (Math.random() - 0.5) * velocityRange,
      life: Math.random() * (0.6 + intensity * 0.5) + 0.6, // Longer trail life
      color: intensity > 2.0 ? "#00FFAA" : intensity > 1.5 ? "#00D4FF" : color,
      type: 'trail',
      size: Math.random() * (0.4 + intensity * 0.25) + 0.25, // Larger trail particles
      intensity: intensity
    });
  }
  return particles;
};