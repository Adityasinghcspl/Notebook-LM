import {combineReducers} from '@reduxjs/toolkit';
import userSlice from './slice/userSlice';
import collectionsSlice from './slice/collectionsSlice';
import chatSlice from './slice/chatSlice';

const rootReducer = combineReducers({
  user: userSlice,
  chat: chatSlice,
  collections : collectionsSlice
});

export default rootReducer;