export const checkCollision = (obj1, obj2, radius1 = 20, radius2 = 20) => {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius1 + radius2;
};

export const isOutOfBounds = (x, y, width, height) => {
  return x < -50 || x > width + 50 || y < -50 || y > height + 50;
};

export const getRandomSpawnPosition = (width, height) => {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // Top
      return { x: Math.random() * width, y: -30 };
    case 1: // Right
      return { x: width + 30, y: Math.random() * height };
    case 2: // Bottom
      return { x: Math.random() * width, y: height + 30 };
    case 3: // Left
      return { x: -30, y: Math.random() * height };
    default:
      return { x: Math.random() * width, y: -30 };
  }
};

export const calculateVelocityTowardsPlayer = (enemy, player, speed) => {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return {
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed
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

// Create explosion particle effect
export const createExplosion = (x, y, color) => {
  const particles = [];
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const velocity = Math.random() * 3 + 1;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      color: color,
      size: Math.random() * 8 + 4,
      type: 'explosion'
    });
  }
  return particles;
};

// Create engine trail particles
export const createEngineTrail = (x, y, color, intensity = 1) => {
  const particles = [];
  const particleCount = Math.ceil(3 * intensity); // More particles with higher intensity
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * (1 + intensity * 0.5),
      vy: Math.random() * (2 + intensity) + 1,
      life: Math.random() * (0.5 + intensity * 0.3) + 0.5,
      color: color,
      type: 'trail',
      intensity: intensity
    });
  }
  return particles;
};