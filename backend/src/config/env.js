import dotenv from 'dotenv';
dotenv.config();

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Fail fast in production if using default insecure secret
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_in_production'))) {
  throw new Error('[Security Exception] Secure JWT_SECRET environment variable is mandatory in production mode.');
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dc_jwt_super_secret_key_change_in_production_98124',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  sbtetApiUrl: process.env.SBTET_API_URL || 'https://sbtet.telangana.gov.in/api/v1',
  sbtetApiKey: process.env.SBTET_API_KEY || 'mock_sbtet_key_2026',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5000', 'http://127.0.0.1:8000', 'http://localhost:8000', 'http://127.0.0.1:5000'],
};
