/*
 * paths for building the project
 */
import path from 'path';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const DEV_SERVER_PORT = 8888;

export const PROJECT_DIR = path.join(__dirname, '../../');

export const ENTRY = path.join(PROJECT_DIR, './src/index.ts');

export const DEV_PUBLIC_PATH = '/static/';

export const DEV_OUT_DIR = path.join(PROJECT_DIR, './dev');

export const PROD_OUT_DIR = path.join(PROJECT_DIR, './dist');

export const PROD_PUBLIC_PATH = '';
