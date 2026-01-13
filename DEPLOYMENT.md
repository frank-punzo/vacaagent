# VacaAgent Deployment Guide

Complete guide to deploy the VacaAgent vacation planning application to AWS.

## Prerequisites

- AWS Account
- AWS CLI configured with credentials
- Terraform >= 1.0 installed
- Node.js >= 16 and npm
- Python 3.12
- Git

## Step 1: Deploy Infrastructure

### 1.1 Clone Infrastructure Repository

```bash
git clone https://github.com/frank-punzo/vacaagentinfra.git
cd vacaagentinfra
```

### 1.2 Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 1.3 Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` if you want to customize any values (optional).

### 1.4 Initialize and Deploy Terraform

```bash
# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy infrastructure (this will take 10-15 minutes)
terraform apply

# Type 'yes' when prompted
```

### 1.5 Save Terraform Outputs

After successful deployment, save the outputs:

```bash
terraform output > outputs.txt
```

You'll need these values:
- `cognito_user_pool_id`
- `cognito_user_pool_client_id`
- `api_gateway_url`
- `s3_photos_bucket`
- `rds_endpoint`

## Step 2: Initialize Database

### 2.1 Get Database Credentials

Get the RDS password from AWS Secrets Manager:

```bash
aws secretsmanager get-secret-value --secret-id vacaagent-db-password-xxxxx --query SecretString --output text
```

### 2.2 Connect to RDS

Since RDS is in a private subnet, you'll need to:

**Option A: Use AWS Systems Manager Session Manager with port forwarding**

1. Launch an EC2 instance in the public subnet with Systems Manager access
2. Use port forwarding to connect to RDS
3. Run the migration SQL

**Option B: Temporarily modify security group (NOT RECOMMENDED FOR PRODUCTION)**

1. Temporarily allow your IP in the RDS security group
2. Connect using psql or a database client
3. Remove the rule after migration

### 2.3 Run Database Migration

```bash
cd ../vacaagent
psql -h YOUR_RDS_ENDPOINT -U vacaadmin -d vacaagent -f database/migrations/001_initial_schema.sql
```

## Step 3: Deploy Lambda Functions

### 3.1 Create Lambda Layer (Python Dependencies)

```bash
cd lambda

# Create directory for layer
mkdir -p layers/python

# Install Python dependencies
pip install -r requirements.txt -t layers/python/

# Create layer zip
cd layers
zip -r ../../vacaagentinfra/lambda_layer.zip python/
cd ../..
```

### 3.2 Create Lambda Function Package

```bash
cd lambda/src
zip -r ../../vacaagentinfra/lambda_function.zip .
cd ../..
```

### 3.3 Update Lambda with New Code

```bash
cd ../vacaagentinfra
terraform apply
```

## Step 4: Configure Mobile App

### 4.1 Update AWS Configuration

Edit `src/config/aws-config.js` with your Terraform outputs:

```javascript
export const AWS_CONFIG = {
  cognito: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',      // From terraform output
    userPoolWebClientId: 'YOUR_CLIENT_ID', // From terraform output
    authenticationFlowType: 'USER_SRP_AUTH',
  },
  api: {
    endpoint: 'YOUR_API_GATEWAY_URL',      // From terraform output
  },
  s3: {
    bucket: 'YOUR_S3_BUCKET',              // From terraform output
    region: 'us-east-1',
  },
};
```

### 4.2 Test the App Locally

```bash
cd ../vacaagent
npm install
npm start
```

Use the Expo Go app on your phone to scan the QR code and test.

## Step 5: Testing

### 5.1 Test Authentication

1. Open the app
2. Click "Sign Up"
3. Create an account with email and password
4. Check your email for verification code
5. Enter the code to confirm
6. Sign in with your credentials

### 5.2 Test Vacation Creation

1. Navigate to Vacations tab
2. Click the + button
3. Fill in vacation details
4. Submit

### 5.3 Test API Connectivity

Check the home screen - it should load your vacations and show a countdown.

## Step 6: Production Deployment (Optional)

### 6.1 Build for App Stores

For iOS:
```bash
expo build:ios
```

For Android:
```bash
expo build:android
```

Or use EAS Build:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

### 6.2 Production Infrastructure Updates

Before going to production, update the infrastructure:

1. Enable RDS deletion protection
2. Enable RDS multi-AZ
3. Configure proper backup retention
4. Set up CloudWatch alarms
5. Enable AWS WAF for API Gateway
6. Configure custom domain for API
7. Set up CI/CD pipeline

## Monitoring

### CloudWatch Logs

View Lambda logs:
```bash
aws logs tail /aws/lambda/vacaagent-api --follow
```

View API Gateway logs:
```bash
aws logs tail /aws/apigateway/vacaagent --follow
```

### Check API Health

```bash
curl https://YOUR_API_GATEWAY_URL/health
```

## Troubleshooting

### Lambda Cold Starts

If you experience slow initial requests, consider:
- Provisioned concurrency (costs extra)
- Keep functions warm with CloudWatch Events

### Database Connection Issues

- Ensure Lambda is in the correct VPC subnets
- Verify security group rules
- Check Secrets Manager permissions

### Authentication Issues

- Verify Cognito User Pool settings
- Check JWT token expiration
- Ensure callback URLs are configured correctly

## Cost Monitoring

Monitor your AWS costs:

```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

## Cleanup

To destroy all infrastructure and avoid charges:

```bash
cd vacaagentinfra
terraform destroy
```

**Warning**: This will permanently delete all data including vacations, photos, and user accounts.

## Support

For issues or questions:
- Check application logs in CloudWatch
- Review Terraform state
- Verify AWS service limits

## Next Steps

1. Implement remaining features (photos, chat, recommendations)
2. Add push notifications
3. Implement offline support
4. Add unit and integration tests
5. Set up CI/CD pipeline
6. Implement analytics
7. Add social features
8. Integrate third-party APIs for recommendations
