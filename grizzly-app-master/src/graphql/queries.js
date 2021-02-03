/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCadet = /* GraphQL */ `
  query GetCadet($Id: Int!) {
    GetCadet(Id: $Id) {
      Id
      FirstName
      LastName
      Class
      Platoon
      Points
      SharePoints
    }
  }
`;
export const listRankedCadets = /* GraphQL */ `
  query ListRankedCadets($input: ListRankedCadetsFilter) {
    ListRankedCadets(input: $input) {
      Id
      FirstName
      LastName
      Class
      Platoon
      Points
      SharePoints
    }
  }
`;
export const getPlatoon = /* GraphQL */ `
  query GetPlatoon($Id: Int!) {
    GetPlatoon(Id: $Id) {
      Id
      Name
    }
  }
`;
export const listPlatoons = /* GraphQL */ `
  query ListPlatoons {
    ListPlatoons {
      Id
      Name
    }
  }
`;
export const getClass = /* GraphQL */ `
  query GetClass($Id: Int!) {
    GetClass(Id: $Id) {
      Id
      Name
    }
  }
`;
export const listClass = /* GraphQL */ `
  query ListClass {
    ListClass {
      Id
      Name
    }
  }
`;
export const getStaff = /* GraphQL */ `
  query GetStaff($Id: Int!) {
    GetStaff(Id: $Id) {
      Id
      FirstNaeme
      LastName
      StaffType
      Phone
      Email
    }
  }
`;
export const listStaff = /* GraphQL */ `
  query ListStaff($input: ListStaffFilter) {
    ListStaff(input: $input) {
      Id
      FirstNaeme
      LastName
      StaffType
      Phone
      Email
    }
  }
`;
export const getStaffType = /* GraphQL */ `
  query GetStaffType($Id: Int!) {
    GetStaffType(Id: $Id) {
      Id
      Name
    }
  }
`;
export const listStaffTypes = /* GraphQL */ `
  query ListStaffTypes {
    ListStaffTypes {
      Id
      Name
    }
  }
`;
export const getTaskCategory = /* GraphQL */ `
  query GetTaskCategory($Id: Int!) {
    GetTaskCategory(Id: $Id) {
      Id
      Name
    }
  }
`;
export const listTaskCategories = /* GraphQL */ `
  query ListTaskCategories {
    ListTaskCategories {
      Id
      Name
    }
  }
`;
export const getResource = /* GraphQL */ `
  query GetResource($Id: Int!) {
    GetResource(Id: $Id) {
      Id
      Title
      Category
      Description
      MediaURL
    }
  }
`;
export const listResources = /* GraphQL */ `
  query ListResources($input: ListResourcesFilter) {
    ListResources(input: $input) {
      Id
      Title
      Category
      Description
      MediaURL
    }
  }
`;
export const getResourceCategory = /* GraphQL */ `
  query GetResourceCategory($Id: Int!) {
    GetResourceCategory(Id: $Id) {
      Id
      Name
    }
  }
`;
export const listResourceCategories = /* GraphQL */ `
  query ListResourceCategories {
    ListResourceCategories {
      Id
      Name
    }
  }
`;
export const getNotification = /* GraphQL */ `
  query GetNotification($Id: Int!, $CadetId: Int!) {
    GetNotification(Id: $Id, CadetId: $CadetId) {
      Id
      Title
      Description
      CreationDate
      MediaURL
      CadetId
      Viewed
    }
  }
`;
export const listNotifications = /* GraphQL */ `
  query ListNotifications($CadetId: Int!, $input: ListNotificationsFilter) {
    ListNotifications(CadetId: $CadetId, input: $input) {
      Id
      Title
      Description
      CreationDate
      MediaURL
      CadetId
      Viewed
    }
  }
`;
export const getTask = /* GraphQL */ `
  query GetTask($Id: Int!, $CadetId: Int!) {
    GetTask(Id: $Id, CadetId: $CadetId) {
      Id
      Title
      Category
      Description
      MediaURL
      AssignmentDate
      DueDate
      CompletionDate
      Notes
    }
  }
`;
export const listTasks = /* GraphQL */ `
  query ListTasks($CadetId: Int!, $input: ListTasksFilter) {
    ListTasks(CadetId: $CadetId, input: $input) {
      Id
      Title
      Category
      Description
      MediaURL
      AssignmentDate
      DueDate
      CompletionDate
      Notes
    }
  }
`;
