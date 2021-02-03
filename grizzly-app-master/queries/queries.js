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
      CreationDate
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
    action.AssignedDates.forEach((date) => {
      const ret = {
        ...action.Action,
        Goal: goalsMapping[action.Action.GoalId],
        AssignedDate: date,
        templateId: action.TemplateId
      };
      actions.push(ret);
    });
  });
  dispatch({ type: "SET_TASKS", payload: actions });
};
