// AWS Configuration
// Update these values after deploying infrastructure with Terraform

export const AWS_CONFIG = {
  // Cognito Configuration
  cognito: {
    region: 'us-east-1',
    userPoolId: 'REPLACE_WITH_YOUR_USER_POOL_ID', // From terraform output
    userPoolWebClientId: 'REPLACE_WITH_YOUR_CLIENT_ID', // From terraform output
    authenticationFlowType: 'USER_SRP_AUTH',
  },

  // API Gateway Configuration
  api: {
    endpoint: 'REPLACE_WITH_YOUR_API_GATEWAY_URL', // From terraform output
  },

  // S3 Configuration
  s3: {
    bucket: 'REPLACE_WITH_YOUR_S3_BUCKET', // From terraform output
    region: 'us-east-1',
  },
};
