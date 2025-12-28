import {assertValidShape} from 'object-shape-tester';
import {parseSqliteOutputShape} from './ast.js';
import {parse, SyntaxError} from './parser.js';
import {Sql} from './sql.js';
import {Tracer} from './tracer.js';

/**
 * Parses SQLite.
 *
 * @category Main
 */
export function parseSqlite(sql: string | Sql) {
    const tracer = new Tracer();

    try {
        const sqlString: string = sql instanceof Sql ? sql.sql : sql;

        const ast = parse(sqlString, {
            tracer,
            startRule: 'start',
        });
        assertValidShape(ast, parseSqliteOutputShape);

        return ast;
    } catch (error) {
        throw error instanceof SyntaxError ? tracer.smartError(error) : error;
    }
}
