import { db } from '../db';

export { db };

export function getDatabase() {
  return db;
}

export default { getDatabase };
