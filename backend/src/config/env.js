import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dc_jwt_super_secret_key_change_in_production_98124',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  sbtetApiUrl: process.env.SBTET_API_URL || 'https://sbtet.telangana.gov.in/api/v1',
  sbtetApiKey: process.env.SBTET_API_KEY || 'mock_sbtet_key_2026',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
