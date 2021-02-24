import { createStore } from "redux";

export const SET_TASKS = "SET_TASKS";
export const SET_COMPLETED_TASK = "SET_COMPLETED_TASK";
export const SET_USER_TYPE = "SET_USER_TYPE";
export const SET_USER_ID = "SET_USER_ID";
export const SET_INSETS = "SET_INSETS";
export const SET_CADET_INFO = "SET_CADET_INFO";
export const SET_NOTIFICATION = "SET_NOTIFICATION";
export const SET_RESOURCE_CATEGORY = "SET_RESOURCE_CATEGORY";
export const SET_RANKING = "SET_RANKING";
export const SET_LOGGED_IN = "SET_LOGGED_IN";

const initialState = {
  userType: "",
  userId: "",
  tasks: [],
  completedTasks: [],
  insets: {},
  cadetInfo: {},
  notifications: [],
  resourceCategories: [],
  rankings: []
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
    case SET_RESOURCE_CATEGORY:
      return {
        ...state,
        resourceCategories: action.payload
      };
    case SET_RANKING:
      return {
        ...state,
        rankings: action.payload
      };
    default:
      return state;
  }
}
