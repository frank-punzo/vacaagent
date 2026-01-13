import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AWS_CONFIG } from '../config/aws-config';

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.cognito.userPoolId,
  ClientId: AWS_CONFIG.cognito.userPoolWebClientId,
});

export const authService = {
  // Sign up a new user
  signUp: (email, password, name) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.user);
      });
    });
  },

  // Confirm sign up with verification code
  confirmSignUp: (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // Sign in
  signIn: (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          // Store tokens
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('idToken', idToken);
          await AsyncStorage.setItem('refreshToken', refreshToken);

          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },

  // Sign out
  signOut: async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  // Get current user
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user found'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          reject(new Error('Session is not valid'));
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          const userData = {};
          attributes.forEach((attribute) => {
            userData[attribute.Name] = attribute.Value;
          });

          resolve(userData);
        });
      });
    });
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const idToken = await AsyncStorage.getItem('idToken');
    return !!idToken;
  },

  // Forgot password
  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },

  // Confirm forgot password with code
  confirmPassword: (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },
};

export default authService;
