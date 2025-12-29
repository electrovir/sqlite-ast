import {assert} from '@augment-vir/assert';
import {indent} from '@augment-vir/common';
import {checkValidShape} from 'object-shape-tester';
import {parseSqliteOutputShape, type SqliteAst} from './ast.js';
import {parse, SyntaxError} from './parser.js';
import {Sql} from './sql.js';
import {Tracer} from './tracer.js';

/**
 * Parses SQLite.
 *
 * @category Main
 */
export function parseSqlite(sql: string | Sql): SqliteAst[] {
    const tracer = new Tracer();

    try {
        const sqlString: string = sql instanceof Sql ? sql.sql : sql;

        const ast = parse(sqlString, {
            tracer,
            startRule: 'start',
        });
        if (!checkValidShape(ast, parseSqliteOutputShape)) {
            throw new Error(`AST does not match shape:\n${indent(JSON.stringify(ast, null, 4))}`);
        }
        assert.tsType(ast.statement).notEquals<unknown[]>();

        return ast.statement.map((statement) => {
            if (statement.type === 'statement') {
                return statement;
            } else {
                throw new Error(`Unexpected top level AST entry type: ${statement.type}`);
            }
        });
    } catch (error) {
        throw error instanceof SyntaxError ? tracer.smartError(error) : error;
    }
}
