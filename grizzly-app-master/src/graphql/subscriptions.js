/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $Id: Int
    $Title: String
    $Description: String
    $CreationDate: String
    $CadetId: Int
  ) {
    onCreateNotification(
      Id: $Id
      Title: $Title
      Description: $Description
      CreationDate: $CreationDate
      CadetId: $CadetId
    ) {
      Id
      Title
      Description
      CreationDate
      CadetId
      Viewed
    }
  }
`;
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $Id: Int
    $Title: String
    $Description: String
    $CreationDate: String
    $CadetId: Int
  ) {
    onUpdateNotification(
      Id: $Id
      Title: $Title
      Description: $Description
      CreationDate: $CreationDate
      CadetId: $CadetId
    ) {
      Id
      Title
      Description
      CreationDate
      CadetId
      Viewed
    }
  }
`;
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $Id: Int
    $Title: String
    $Description: String
    $CreationDate: String
    $CadetId: Int
  ) {
    onDeleteNotification(
      Id: $Id
      Title: $Title
      Description: $Description
      CreationDate: $CreationDate
      CadetId: $CadetId
    ) {
      Id
      Title
      Description
      CreationDate
      CadetId
      Viewed
    }
  }
`;
export const onCreateResource = /* GraphQL */ `
  subscription OnCreateResource($Id: Int, $Category: String, $Title: String, $Description: String, $Video: String) {
    onCreateResource(Id: $Id, Category: $Category, Title: $Title, Description: $Description, Video: $Video) {
      Id
      Category
      Title
      Description
      Video
    }
  }
`;
export const onUpdateResource = /* GraphQL */ `
  subscription OnUpdateResource($Id: Int, $Category: String, $Title: String, $Description: String, $Video: String) {
    onUpdateResource(Id: $Id, Category: $Category, Title: $Title, Description: $Description, Video: $Video) {
      Id
      Category
      Title
      Description
      Video
    }
  }
`;
export const onDeleteResource = /* GraphQL */ `
  subscription OnDeleteResource($Id: Int, $Category: String, $Title: String, $Description: String, $Video: String) {
    onDeleteResource(Id: $Id, Category: $Category, Title: $Title, Description: $Description, Video: $Video) {
      Id
      Category
      Title
      Description
      Video
    }
  }
`;
