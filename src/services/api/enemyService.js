import enemyTypesData from "@/services/mockData/enemyTypes.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const enemyService = {
  getAll: async () => {
    await delay(300);
    return [...enemyTypesData];
  },
  
  getById: async (id) => {
    await delay(200);
    const enemy = enemyTypesData.find(e => e.Id === parseInt(id));
    return enemy ? { ...enemy } : null;
  },
  
  getByType: async (type) => {
    await delay(200);
    const enemy = enemyTypesData.find(e => e.type === type);
    return enemy ? { ...enemy } : null;
  },
  
  getRandomType: async () => {
    await delay(100);
    const randomIndex = Math.floor(Math.random() * enemyTypesData.length);
    return { ...enemyTypesData[randomIndex] };
  }
};

export default enemyService;