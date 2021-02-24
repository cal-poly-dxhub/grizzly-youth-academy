# grizzly-app

## Getting Started
To initialize the app with access to AWS resource access:
```
amplify init
```

Install the expo cli:
```
yarn add expo
```

Add and complete the following information to `aws-exports.js`:

```
    "aws_appsync_graphqlEndpoint": "<endpoint from AWS AppSync Settings>",
    "aws_appsync_region": "us-west-2",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"
```

Before initiaiting the app with `expo start`, run `expo upgrade` to update used packages.