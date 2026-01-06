import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      // CRITICAL: Always use deep cloning to avoid reference issues
      // This prevents potential issues with object mutations
      state.user = JSON.parse(JSON.stringify(action.payload));
      
      /*
       * User object properties
       * 
       * @property {boolean} isAuthenticated - Indicates whether the user is successfully authenticated
       * @property {number} userId - Unique identifier for the user
       * @property {number} companyId - Unique identifier for the user's company/organization
       * @property {string} name - User's full display name
       * @property {string} firstName - User's first name
       * @property {string|null} lastName - User's last name (null if not provided)
       * @property {string} emailAddress - User's email address
       * @property {string|null} avatarUrl - URL to the user's avatar/profile image (null if not set)
       * @property {string} timezone - User's timezone setting (e.g., "Eastern Standard Time")
       * @property {string} culture - User's locale/culture code for localization (e.g., "en-US")
       * @property {Array<Object>} accounts - Array of account profiles associated with the user
       * @property {Object} accounts[].profile - Profile information for each account
       * @property {number} accounts[].profile.id - Unique identifier for the profile
       * @property {string} accounts[].profile.name - Name of the profile/account
       */
       
      let currentUser = state.user.accounts[0];
      state.user.profile = currentUser.profile;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { updateUser, clearUser, setInitialized } = userSlice.actions;

// Thunk that dispatches setUser and returns the transformed user
export const setUser = (user) => (dispatch, getState) => {
  dispatch(updateUser(user));
  return getState().user.user;
};

export default userSlice.reducer;