# VacaAgent - Vacation Planning App

A comprehensive vacation planning mobile application built with React Native/Expo.

## Features

- User authentication with Amazon Cognito
- Create and manage vacations
- Countdown timer to upcoming vacations
- Event scheduling with dress codes and dates
- Excursion planning with booking details
- Packing list management
- Itinerary builder and day planner
- Photo sharing with vacation members
- Group chat for vacation planning
- Local recommendations for restaurants and activities
- Multi-member collaboration

## Tech Stack

- **Frontend**: React Native with Expo
- **Authentication**: Amazon Cognito
- **API**: AWS API Gateway + Lambda
- **Backend**: Python Lambda functions
- **Database**: PostgreSQL (AWS RDS)
- **Storage**: Amazon S3 (photos)

## Setup

### Prerequisites

- Node.js >= 16
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- AWS account with infrastructure deployed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/frank-punzo/vacaagent.git
cd vacaagent
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS settings:

After deploying the infrastructure with Terraform, update `src/config/aws-config.js` with your values:

```javascript
export const AWS_CONFIG = {
  cognito: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_CLIENT_ID',
  },
  api: {
    endpoint: 'YOUR_API_GATEWAY_URL',
  },
  s3: {
    bucket: 'YOUR_S3_BUCKET',
    region: 'us-east-1',
  },
};
```

### Running the App

Start the development server:
```bash
npm start
```

Run on specific platform:
```bash
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web browser
```

## Project Structure

```
vacaagent/
├── src/
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts (Auth)
│   ├── navigation/      # Navigation setup
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── home/        # Home screen with countdown
│   │   ├── vacations/   # Vacation management
│   │   └── profile/     # User profile
│   ├── services/        # API services
│   └── utils/           # Utility functions
├── lambda/              # Backend Lambda functions
│   ├── src/
│   │   ├── controllers/ # API controllers
│   │   └── utils/       # Lambda utilities
│   └── requirements.txt # Python dependencies
└── database/            # Database migrations
    └── migrations/      # SQL migration files
```

## Backend Setup

The backend Lambda functions are in the `lambda/` directory.

### Deploy Lambda Functions

1. Install Python dependencies:
```bash
cd lambda
pip install -r requirements.txt -t layers/python/
```

2. Create deployment packages:
```bash
# Create layer
cd layers
zip -r ../lambda_layer.zip python/
cd ..

# Create function package
cd src
zip -r ../lambda_function.zip .
cd ..
```

3. Update Terraform and apply:
```bash
cd ../vacaagentinfra
terraform apply
```

## Database Schema

The database schema is in `database/migrations/001_initial_schema.sql`.

To initialize the database:

1. Connect to your RDS instance
2. Run the migration SQL file

Tables include:
- `vacations` - Main vacation information
- `vacation_members` - Vacation participants
- `events` - Scheduled events
- `excursions` - Planned excursions
- `packing_items` - Packing list items
- `itineraries` - User itineraries
- `photos` - Shared photos
- `chat_messages` - Group chat messages
- `recommendations` - Cached recommendations

## Infrastructure

Infrastructure code is maintained in a separate repository:
[vacaagentinfra](https://github.com/frank-punzo/vacaagentinfra)

## Contributing

This is a personal project. Feel free to fork and customize for your needs.

## License

MIT License
