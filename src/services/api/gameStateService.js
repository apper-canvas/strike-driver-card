import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const gameStateService = {
  getUserGameState: async () => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }
      
      const response = await apperClient.fetchRecords('game_state_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "level_c"}},
          {"field": {"Name": "combo_c"}},
          {"field": {"Name": "high_score_c"}}
        ],
        orderBy: [{
          "fieldName": "ModifiedOn",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": 1,
          "offset": 0
        }
      });
      
      if (!response.success) {
        console.error("Failed to fetch user game state:", response);
        return null;
      }
      
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error("Error fetching user game state:", error);
      return null;
    }
  },

  saveGameState: async (score, level, combo) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Get current game state first
      const currentState = await gameStateService.getUserGameState();
      
      if (currentState) {
        // Update existing record
        const response = await apperClient.updateRecord('game_state_c', {
          records: [{
            Id: currentState.Id,
            score_c: score,
            level_c: level,
            combo_c: combo
          }]
        });
        
        if (!response.success) {
          console.error("Failed to update game state:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      } else {
        // Create new record
        const response = await apperClient.createRecord('game_state_c', {
          records: [{
            Name: "Game State",
            score_c: score,
            level_c: level,
            combo_c: combo,
            high_score_c: score
          }]
        });
        
        if (!response.success) {
          console.error("Failed to create game state:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      }
    } catch (error) {
      console.error("Error saving game state:", error);
      throw error;
    }
  },

  updateHighScore: async (newHighScore) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not available');
      }

      // Get current game state first
      const currentState = await gameStateService.getUserGameState();
      
      if (currentState) {
        // Update existing record
        const response = await apperClient.updateRecord('game_state_c', {
          records: [{
            Id: currentState.Id,
            high_score_c: newHighScore
          }]
        });
        
        if (!response.success) {
          console.error("Failed to update high score:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      } else {
        // Create new record with high score
        const response = await apperClient.createRecord('game_state_c', {
          records: [{
            Name: "Game State",
            score_c: 0,
            level_c: 1,
            combo_c: 0,
            high_score_c: newHighScore
          }]
        });
        
        if (!response.success) {
          console.error("Failed to create game state with high score:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      }
    } catch (error) {
      console.error("Error updating high score:", error);
      throw error;
    }
  },

  getHighScore: async () => {
    try {
      const gameState = await gameStateService.getUserGameState();
      return gameState?.high_score_c || 0;
    } catch (error) {
      console.error("Error fetching high score:", error);
      return 0;
    }
  }
};

export default gameStateService;