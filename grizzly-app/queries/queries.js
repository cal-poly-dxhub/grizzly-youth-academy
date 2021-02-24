import { API } from "aws-amplify";

export async function getRankedCadets() {
  const rankedCadetsQuery = `
    query MyQuery {
      ListRankedCadets {
        Class
        FirstName
        Id
        LastName
        Platoon
        Points
      }
    }  
  `;

  const r = await API.graphql({ query: rankedCadetsQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return r.data.ListRankedCadets;
}

export async function getEvents() {
  const listEventsQuery = `query MyQuery {
    ListEvents {
      CreationDateTime
      Description
      EventDate
      Id
      Title
    }
  }`;

  const r = await API.graphql({ query: listEventsQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return r.data.ListEvents;
}

export async function getCadetInfo() {
  const getCadetInfoQuery = `
  query MyQuery {
    GetCadetInfo {
      Info {
        Class
        FirstName
        Id
        LastName
        Platoon
        Points
        SharePoints
        MediaURL
      }
      Ranking {
        ClassRank
        MaxClassRank
        MaxPlatoonRank
        PlatoonRank
      }
      Staff {
        Email
        FirstName
        Id
        Phone
        LastName
        StaffType
      }
    }
  }
  `;

  const r = await API.graphql({ query: getCadetInfoQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return r.data.GetCadetInfo;
}

export const updateReduxStateTasks = async (dispatch, month, year) => {
  const assignedActionQuery = `
  query MyQuery {
    ListAssignedActions(month: ${month}, year: ${year}) {
      Action {
        Title
        PointValue
        MediaURL
        Id
        GoalId
        Description
      }
      AssignedDates
      CompletedDates
      TemplateId
    }
    ListGoals {
      Id
      Name
    }
  }
  `;

  const assignedAction = await API.graphql({ query: assignedActionQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  const goalsMapping = {};
  const actions = [];

  assignedAction.data.ListGoals.forEach((goalObj) => {
    goalsMapping[goalObj.Id] = goalObj.Name;
  });
  assignedAction.data.ListAssignedActions.forEach((action) => {
    const nonRepeating = action.AssignedDates.length === 1 ? true : false;
    action.AssignedDates.forEach((date) => {
      const ret = {
        ...action.Action,
        Goal: goalsMapping[action.Action.GoalId],
        AssignedDate: date,
        templateId: action.TemplateId,
        nonRepeating: nonRepeating
      };
      actions.push(ret);
    });
  });
  dispatch({ type: "SET_TASKS", payload: actions });
};

export const getCompletedActions = async (dispatch) => {
  const assignedActionQuery = `
  query MyQuery {
    ListCompletedActions {
      Action {
        Description
        GoalId
        Id
        MediaURL
        PointValue
        Title
      }
      CompletedDates
    }
    ListGoals {
      Id
      Name
    }
  }
  `;

  const assignedAction = await API.graphql({ query: assignedActionQuery, authMode: "AMAZON_COGNITO_USER_POOLS" });
  const goalsMapping = {};
  const actions = [];

  assignedAction.data.ListGoals.forEach((goalObj) => {
    goalsMapping[goalObj.Id] = goalObj.Name;
  });
  assignedAction.data.ListCompletedActions.forEach((action) => {
    action.CompletedDates.forEach((date) => {
      const ret = {
        ...action.Action,
        Goal: goalsMapping[action.Action.GoalId],
        AssignedDate: date,
        templateId: action.TemplateId
      };
      actions.push(ret);
    });
  });
  dispatch({ type: "SET_COMPLETED_TASK", payload: actions });
  return actions;
};

export const ListNotifications = async () => {
  const query = `
    query MyQuery {
      ListNotifications {
        CreationDateTime
        Description
        Id
        MediaURL
        Title
        Viewed
      }
    }   
  `;

  const notif = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return notif.data.ListNotifications;
};

export const MarkAsViewed = async (id) => {
  const query = `
    mutation MyMutation {
      MarkAsViewed(NotificationId: ${id}) {
        Id
      }
    }
  `;
  await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
};

export const ListResourceCategories = async () => {
  const query = `
    query MyQuery {
      ListResourceCategories {
        Id
        Name
      }
    }
  `;

  const resources = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return resources.data.ListResourceCategories;
};

export const ListResources = async (Id) => {
  const query =
    `
    query MyQuery {
      ListResources(input: {CategoryId: ` +
    `${Id}` +
    `}) {
        Description
        MediaURL
        Category
        Id
        Title
      }
    }      
  `;

  const resources = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return resources.data.ListResources;
};

export const UpdateCadet = async (rankingSwitch) => {
  const updateCadet = `
    mutation MyMutation {
      UpdateCadet(input: {SharePoints: ${!rankingSwitch}}) {
        Id
        SharePoints
      }
    }
  `;
  const res = await API.graphql({ query: updateCadet, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return res;
};

export const ListActionOptions = async (selectedCat) => {
  const query = `
    query MyQuery {
      ListActionOptions(input: {GoalId: ${selectedCat}}) {
        Description
        GoalId
        Id
        MediaURL
        PointValue
        Title
      }
    }
  `;

  const taskTemp = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return taskTemp.data.ListActionOptions;
};

export const ListGoals = async () => {
  const query = `
    query MyQuery {
      ListGoals {
        Id
        Name
      }
    }
  `;
  const notif = await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
  return notif.data.ListGoals;
};

export async function DeleteActionOption(Id) {
  const query = `
  mutation MyMutation {
    DeleteActionOption(Id: ${Id}) {
      Id
    }
  }              
  `;
  await API.graphql({ query: query, authMode: "AMAZON_COGNITO_USER_POOLS" });
}
