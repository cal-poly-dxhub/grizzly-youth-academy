# Grizzly Actionable Goals Application Backend

## General Overview
The basis of the action-planning feature of this application is referred to as an Action Template. Information on when an action should be scheduled, and possibly how often it should be repeated, are stored in the database. There are options for generally assigned actions, as well as user-created actions to appear on a user's calendar.

The backend uses the template information stored within the database to extrapolate dates of actions that are assigned to a user. All of this business logic can be found within [ResolveCadetCustomTemplate.py](lambda/ResolveCadetCustomTemplate.py) under the API named `ListAssignedActions`.

The schema of the database and setup of the APIs allow for high amounts of customization, allowing for a user to delete specific assigned dates from an assigned action, remove entire assigned action schedules from their template, update the scheduling of an assigned action, etc. More details about each of the avaialable APIs can be found documented in the [schema](API/grizzly_actions_app/schema/actions_app_schema.graphql).

Point-totals of each user are determined by the number of completed actions, and how many points each of the actions were worth. Users are able to see their basic ranking statistics within their platoon/class. Furthermore, a user can see public ranking information displaying user names and ranked point totals (also by platoon/class/in general). This option, however, requires that the user consents to having their information made public, and this decision can be changed at any time.

The application offers resources to each Cadet, some of which can be determined as 'premium content' that has a specific point-threshold associated to it. Otherwise, contact information to staff associated with the user is made available.

Lastly, non-push notifications are made available to users in the form of Event(s) or Notification(s).

## Administrative Tasks

This data-driven application is mostly composed of pulling data from a data source, with a few options of creating resources within the database, such as a entry in their `ActionTemplate` or a custom `ActionOption`. Therefore, some administrative tasks are required to provide/update data for users:

1. **User Creation**
User credentials are authenticated through Amazon Cognito, so a user must be created through this service in the dedicated user pool. Furthermore, a record has to be placed in the Cadet DB table that references the Cognito Username.

2. **Staff Assignment**
In order for users to have access to contact information within the application, it's necessary to import Staff data into `Staff` and make associations between users and Staff members in `CadetToStaff`.

3. **Notification/Event Creation**
Notification details are entered into the Notification DB table, and then associations between a Notification and individual Cadets are made within the CadetToNotification table. (This process is the same for Events)

4. **Generally-Available Template Actions**
To add a repeating/single-date action to the action templates of all users, a record must be placed in `ActionTemplate` that does not reference a CadetId. Unlike custom actions appearing on a user's calendar, these actions will not appear as 'incomplete' if it becomes overdue.

4. **Resource Creation**
Resources, which can be provided to Cadet's upon receiving enough points, are added into the `Resource` table. These are categorized by `ResourceCategory`, and must be linked for data integrity purposes.

## Architecture
The general architecture layout is available [here](https://lucid.app/lucidchart/invitations/accept/e0d4924e-9cd4-42c4-b5cb-019540d7e228).

Generally, the data stores used within this application include Amazon Aurora Serverless and Amazon S3. The APIs that interact with these data sources are made possible with AWS AppSync, and user authentication is managed with a user pool in Amazon Cognito.

## Lambda
The [lambda functions](lambda/) RankCadet.py and ResolveCadetCustomTemplate.py are AWS_LAMBDA Data Sources for the AppSync API schema, while UploadGrizzlyActions.py is a utility to import data into the database by submitting .csv files to an S3 bucket. Lastly, ReportActionStats.py is an admin utility for reporting data on completed actions. All of the lambda functions mediate data requests and require the following to be initialized:
- database name
- ARN of a secret from AWS Secrets Manager (DB credentials)
- ARN of the DB instance

The lambda function GenerateSignedURL creates a pre-signed link that references an object in S3. For Cadet profile pictures, it is necessary for the files to stored as: `Cadet/<FirstName>_<LastName>[.ext]`. Resources are organized by category and then id as follows: `Resource/<ResourceCategory>/<ResourceId>[.ext]`.

## Database
We use an Amazon Aurora Serverless MySQL cluster to store all user data except evidence of completed actions. This evidence is stored within an S3 bucket. The [DB schema](database/db_config.sql) can be used to initialize a database with the necessary Tables that the APIs expect.

## AppSync API

Throughout this section, AWS CLI commands will be referenced for creating/updating resources in AppSync. For more details on each reference, see the [API documentation](https://docs.aws.amazon.com/cli/latest/reference/appsync/index.html) or run the following command with the AWS CLI:
```
aws appsync help
```

### Schema
The GraphQL schema can be found [here](API/grizzly_actions_app/schema/actions_app_schema.graphql). The Types and Inputs are related to the definition of the DB schema as seen above.

### Data Sources
Data Sources are linked to each API Functions/Resolvers. This backend configuration utilizes 3 data sources:

**1. Aurora Serverless RDS instance**

**2. ResolveCadetCustomTemplate lambda function**

**3. RankCadet lambda function**

**4. GenerateSignedURL lambda function**

Pipeline resolvers are not associated with a data source, but the Functions that compose them are.

### Functions
Request/Response mapping templates to initialize APIs can be found in: [mapping templates](API/grizzly_actions_app/resolvers/functions/)

- DeleteActionOption - Data Source 1
- GetCadet - Data Source 1
- GetCadetId - Data Source 1
- GetCadetInfoRanking - Data Source 3
- QueryList - Data Source 1
- QueryStaff - Data Source 1
- UpdateCadet - Data Source 1

Functions must be initialized before instantiating Pipeline Resolvers. AWS CLI command to do so:
```
aws appsync create-function --api-id <api-id> --name <function-name> --data-source-name <data-source> --request-mapping-template <request-map> --response-mapping-template <response-map>
```

### Resolvers

Request/Response mapping templates to initialize APIs can be found in:
- [request mapping templates](API/grizzly_actions_app/resolvers/request_map/)
- [response mapping templates](API/grizzly_actions_app/resolvers/response_map/)

Documentation format:
- `request mapping template` -> `response mapping template`
- `request mapping template` -> `(Function1, Function2, ...)` -> `response mapping template`

#### Mutations
*DeleteAssignedActionDate - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*UpdateActionSchedule - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*AssignActionOption - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*AssignCustomAction  - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*CompleteAssignedAction - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*DeleteActionOption - Pipeline* \
empty_request_map -> (GetCadetId, DeleteActionOption) -> generic_response_map.txt

*UpdateCadet - Pipeline* \
empty_request_map -> (UpdateCadet, GetCadet) -> generic_response_map.txt

*DeleteActionFromTemplate - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*MarkAsViewed - Data Source 1* \
MarkAsViewed_request_map.txt -> mutation_response_map.txt

#### Queries
*ListRankedCadets - Data Source 3* \
lambda_request_map.txt -> generic_response_map.txt

*ListStaff - Pipeline* \
empty_request_map.txt -> (QueryStaff) -> generic_response_map.txt

*ListResources - Data Source 1* \
ListResources_request_map.txt -> ListResources_response_map.txt

*ListResourceCategories - Pipeline* \
ListResourceCategories_request_map.txt -> (QueryList) -> generic_response_map.txt

*ListEvents - Data Source 1* \
ListEvents_request_map.txt -> query_list_response_map.txt

*ListAssignedActions - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*ListGoals - Pipeline* \
ListGoals_request_map.txt -> (QueryList) -> generic_response_map.txt

*ListActionOptions - Data Source 1* \
ListActionOptions_request_map.txt -> query_list_response_map.txt

*GetCadetInfo - Pipeline* \
empty_request_map.txt -> (GetCadet, GetCadetInfoRanking, QueryStaff) -> GetCadetInfo_response_map.txt

*ListCompletedActions - Data Source 2* \
lambda_request_map.txt -> generic_response_map.txt

*GetAssignedSchedule - Data Source 1* \
GetAssignedSchedule_request_map.txt -> query_object_response_map.txt

*ListClasses - Pipeline* \
ListClasses_request_map.txt -> (QueryList) -> generic_response_map.txt

*ListPlatoons - Pipeline* \
ListPlatoons_request_map.txt -> (QueryList) -> generic_response_map.txt

*ListNotifications - Data Source 1* \
ListNotifications_request_map.txt -> query_list_response_map.txt

#### Types
This section is specific to resolvers that are tied to an *attribute* for a given Type in the schema. The result of this resolver is retrieved by the APIs that return this Type, but must be handled at a level lower than the above resolvers. Each of the below definitions are of the form '*[Type].[Attribute] - [Data Source]*'

*Resource.MediaURL - Data Source 4*
lambda_request_map.txt -> generic_response_map.txt

*Cadet.MediaURL - Data Source 4*
lambda_request_map.txt -> generic_response_map.txt