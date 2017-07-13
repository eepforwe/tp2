import dotenv from 'dotenv';
import getModels from './models';
import connect from './db';

dotenv.config();
const models = getModels(connect);

export default { ...models };