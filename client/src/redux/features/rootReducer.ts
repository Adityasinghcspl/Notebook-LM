import {combineReducers} from '@reduxjs/toolkit';
import userSlice from './slice/userSlice';
import collectionsSlice from './slice/collectionsSlice'

const rootReducer = combineReducers({
  user: userSlice,
  collections : collectionsSlice
});

export default rootReducer;