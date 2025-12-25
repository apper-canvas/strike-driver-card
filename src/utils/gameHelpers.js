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