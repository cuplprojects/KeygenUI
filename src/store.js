import { legacy_createStore as createStore } from 'redux';

// Function to load state from sessionStorage
const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem('reduxState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.warn("Could not load state from sessionStorage:", err);
    return undefined;
  }
};

// Function to save state to sessionStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.warn("Could not save state to sessionStorage:", err);
  }
};

const initialState = {
  sidebarShow: true,
  theme: 'light',
};

// Reducer function
const changeState = (state = loadState() || initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest };
    default:
      return state;
  }
};

// Create store
const store = createStore(changeState);

// Subscribe to store updates to save state to sessionStorage
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
