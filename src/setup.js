import dotenv from 'dotenv';

let envFile = '.env.dev';

if (process.env.NODE_ENV === 'prod') {
  envFile = '.env'
}

const setup = dotenv.config({
  path: envFile,
});

export default setup;