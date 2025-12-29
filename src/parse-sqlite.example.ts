import {parseSqlite, sql} from './index.js';

const ast = parseSqlite(sql`SELECT * from user;`);
