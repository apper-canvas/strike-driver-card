export const checkCollision = (obj1, obj2, radius1 = 2, radius2 = 2) => {
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
// Draw enhanced rocket sprite with excellent visibility and level progression
export const drawRocket = (ctx, x, y, size, color, angle = 0, level = 1) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Enhanced level-based scaling for better visibility
  const levelScale = 1.0 + (level - 1) * 0.08; // Increased base scale
  const glowIntensity = 20 + (level * 4); // Enhanced glow intensity
  ctx.scale(levelScale, levelScale);
  
  // Main rocket body with strong visibility
  ctx.shadowBlur = glowIntensity;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.5, -size * 1.2, size, size * 2);
  
  // Prominent nose cone with level tiers
  ctx.fillStyle = level >= 5 ? "#FF00FF" : level >= 3 ? "#FFAA00" : color;
  ctx.shadowBlur = glowIntensity + 5;
  ctx.shadowColor = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.2);
  ctx.lineTo(-size * 0.5, -size * 0.8);
  ctx.lineTo(size * 0.5, -size * 0.8);
  ctx.closePath();
  ctx.fill();
  
  // Enhanced wings/fins for better visibility
  const finAlpha = Math.min(0.8 + (level * 0.1), 1.0);
  const finColor = color.includes('rgb') ? 
    color.replace('rgb', 'rgba').replace(')', `, ${finAlpha})`) : 
    `rgba(0, 212, 255, ${finAlpha})`;
  ctx.fillStyle = finColor;
  ctx.shadowBlur = glowIntensity;
  ctx.fillRect(-size * 0.8, size * 0.2, size * 0.3, size * 0.8);
  ctx.fillRect(size * 0.5, size * 0.2, size * 0.3, size * 0.8);
  
  // Bright engine glow with level progression
  ctx.shadowBlur = 25 + (level * 5);
  ctx.shadowColor = level >= 4 ? "#00FFAA" : "#00D4FF";
  ctx.fillStyle = level >= 4 ? "#00FFAA" : "#00D4FF";
  ctx.fillRect(-size * 0.4, size * 0.8, size * 0.8, size * 0.6);
  
  // Additional visibility enhancement - bright outline
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = glowIntensity + 10;
  ctx.strokeRect(-size * 0.5, -size * 1.2, size, size * 2);
  
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