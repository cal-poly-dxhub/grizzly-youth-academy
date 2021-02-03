import { createStore } from "redux";

export const SET_TASKS = "SET_TASKS";
export const SET_COMPLETED_TASK = "SET_COMPLETED_TASK";
export const SET_USER_TYPE = "SET_USER_TYPE";
export const SET_USER_ID = "SET_USER_ID";
export const SET_INSETS = "SET_INSETS";
export const SET_CADET_INFO = "SET_CADET_INFO";
export const SET_NOTIFICATION = "SET_NOTIFICATION";

const initialState = {
  userType: "",
  userId: "",
  tasks: [],
  completedTasks: [],
  insets: {},
  cadetInfo: {},
  notifications: []
};

export const store = createStore(reducer, initialState);

function reducer(state, action) {
  switch (action.type) {
    case SET_TASKS:
      return {
        ...state,
        tasks: action.payload
      };
    case SET_COMPLETED_TASK:
      return {
        ...state,
        completedTasks: action.payload
      };
    case SET_USER_TYPE:
      return {
        ...state,
        userType: action.payload
      };
    case SET_USER_ID:
      return {
        ...state,
        userId: action.payload
      };
    case SET_INSETS:
      return {
        ...state,
        insets: action.payload
      };
    case SET_CADET_INFO:
      return {
        ...state,
        cadetInfo: action.payload
      };
    case SET_NOTIFICATION:
      return {
        ...state,
        notifications: action.payload
      };
    default:
      return state;
  }
}
