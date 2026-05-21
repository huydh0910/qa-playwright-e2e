import dotenv from 'dotenv';
import path from 'path';

const env = process.env.ENV ?? 'qa';
dotenv.config({ path: path.resolve(__dirname, `../../config/${env}.env`) });

export const config = {
  baseUrl:    process.env.BASE_URL    ?? 'https://ctflearn.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://reqres.in/api',

  web: {
    username: process.env.WEB_USERNAME ?? '',
    password: process.env.WEB_PASSWORD ?? '',
  },

  api: {
    email:    process.env.API_EMAIL    ?? 'eve.holt@reqres.in',
    password: process.env.API_PASSWORD ?? 'cityslicka',
  },

  mobile: {
    email:    process.env.MOBILE_EMAIL    ?? '',
    password: process.env.MOBILE_PASSWORD ?? '',
  },

  timeouts: {
    default:    30_000,
    navigation: 60_000,
    api:        10_000,
  },
} as const;
