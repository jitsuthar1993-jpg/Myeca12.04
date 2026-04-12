import { db } from '../db.js';

export { db };

export function getDatabase() {
  return db;
}

export default { getDatabase };
