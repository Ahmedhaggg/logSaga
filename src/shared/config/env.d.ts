export type ProcessEnvVars = {
  PORT: number | 3000;
  HASH_SOLT: number | 10;
  REDIS_URL: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_URL: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
};

declare global {
  namespace Nodejs {
    interface ProcessEnv extends ProcessEnvVars {}
  }
}
