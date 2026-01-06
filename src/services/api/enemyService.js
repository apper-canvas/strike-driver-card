import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const enemyService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }
      
      const response = await apperClient.fetchRecords('enemy_type_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "health_c"}},
          {"field": {"Name": "speed_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "size_c"}}
        ],
        orderBy: [{
          "fieldName": "Name",
          "sorttype": "ASC"
        }]
      });
      
      if (!response.success) {
        console.error("Failed to fetch enemy types:", response);
        throw new Error(response.message);
      }
      
      // Map database fields to game format
      return (response.data || []).map(enemy => ({
        Id: enemy.Id,
        type: enemy.type_c,
        health: enemy.health_c,
        speed: enemy.speed_c,
        points: enemy.points_c,
        color: enemy.color_c,
        size: enemy.size_c
      }));
    } catch (error) {
      console.error("Error fetching enemy types:", error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }
      
      const response = await apperClient.getRecordById('enemy_type_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "health_c"}},
          {"field": {"Name": "speed_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "size_c"}}
        ]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch enemy type with Id: ${id}:`, response);
        return null;
      }
      
      if (!response.data) {
        return null;
      }
      
      // Map database fields to game format
      const enemy = response.data;
      return {
        Id: enemy.Id,
        type: enemy.type_c,
        health: enemy.health_c,
        speed: enemy.speed_c,
        points: enemy.points_c,
        color: enemy.color_c,
        size: enemy.size_c
      };
    } catch (error) {
      console.error(`Error fetching enemy type ${id}:`, error);
      return null;
    }
  },
  
  getByType: async (type) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }
      
      const response = await apperClient.fetchRecords('enemy_type_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "health_c"}},
          {"field": {"Name": "speed_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "size_c"}}
        ],
        where: [{
          "FieldName": "type_c",
          "Operator": "EqualTo",
          "Values": [type]
        }],
        pagingInfo: {
          "limit": 1,
          "offset": 0
        }
      });
      
      if (!response.success) {
        console.error("Failed to fetch enemy type by type:", response);
        return null;
      }
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      // Map database fields to game format
      const enemy = response.data[0];
      return {
        Id: enemy.Id,
        type: enemy.type_c,
        health: enemy.health_c,
        speed: enemy.speed_c,
        points: enemy.points_c,
        color: enemy.color_c,
        size: enemy.size_c
      };
    } catch (error) {
      console.error("Error fetching enemy type by type:", error);
      return null;
    }
  },
  
  getRandomType: async () => {
    try {
      const allTypes = await enemyService.getAll();
      if (allTypes.length === 0) {
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * allTypes.length);
      return allTypes[randomIndex];
    } catch (error) {
      console.error("Error getting random enemy type:", error);
      return null;
    }
  }
};

export default enemyService;