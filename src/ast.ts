import {Type, type Static} from '@sinclair/typebox';
import {defineShape} from 'object-shape-tester';

/**
 * Unified recursive schema for all SQLite AST node types. This handles the mutual recursion between
 * expressions and statements (e.g., subqueries).
 *
 * @category Internal
 */
export const sqliteAstSchema = Type.Recursive(
    (This) => {
        return Type.Union([
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('binary'),
                variant: Type.Literal('operation'),
                operation: Type.String(),
                left: This,
                right: This,
                escape: Type.Optional(This),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('unary'),
                variant: Type.Literal('operation'),
                expression: This,
                operator: Type.String(),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('error'),
                format: Type.Literal('unary'),
                variant: Type.Literal('raise'),
                expression: Type.Object({
                    type: Type.Literal('error'),
                    action: Type.String(),
                    message: Type.Optional(This),
                }),
                action: Type.String(),
                message: Type.Optional(This),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('unary'),
                variant: Type.Literal('operation'),
                operator: Type.Literal('collate'),
                expression: This,
                collate: Type.Array(
                    Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('collation'),
                        name: Type.String(),
                    }),
                ),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('unary'),
                variant: Type.Literal('cast'),
                expression: This,
                as: Type.Object({
                    type: Type.Literal('datatype'),
                    variant: Type.String(),
                    affinity: Type.String(),
                    args: Type.Optional(
                        Type.Object({
                            type: Type.Literal('expression'),
                            variant: Type.Literal('list'),
                            expression: Type.Array(This),
                        }),
                    ),
                }),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                variant: Type.Literal('case'),
                expression: Type.Array(
                    Type.Union([
                        Type.Object({
                            type: Type.Literal('condition'),
                            variant: Type.Literal('when'),
                            condition: This,
                            consequent: This,
                        }),
                        Type.Object({
                            type: Type.Literal('condition'),
                            variant: Type.Literal('else'),
                            consequent: This,
                        }),
                    ]),
                ),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                variant: Type.Literal('list'),
                expression: Type.Union([
                    Type.Array(This),
                    This,
                    Type.Null(),
                ]),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                variant: Type.Literal('order'),
                expression: This,
                direction: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                variant: Type.Literal('limit'),
                start: This,
                offset: Type.Optional(This),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                variant: Type.Literal('exists'),
                operator: Type.String(),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('unary'),
                variant: Type.Literal('exists'),
                expression: This,
                operator: Type.String(),
            }),
            Type.Object({
                type: Type.Literal('expression'),
                format: Type.Literal('table'),
                variant: Type.Union([
                    Type.Literal('common'),
                    Type.Literal('recursive'),
                ]),
                target: This,
                expression: This,
            }),

            Type.Object({
                type: Type.Literal('identifier'),
                variant: Type.String(),
                name: Type.String(),
                alias: Type.Optional(Type.String()),
                format: Type.Optional(Type.String()),
                columns: Type.Optional(Type.Array(This)),
                index: Type.Optional(
                    Type.Union([
                        Type.Object({
                            type: Type.Literal('identifier'),
                            variant: Type.Literal('index'),
                            name: Type.String(),
                        }),
                        Type.String(),
                    ]),
                ),
            }),

            Type.Object({
                type: Type.Literal('literal'),
                variant: Type.String(),
                value: Type.String(),
                normalized: Type.Optional(Type.String()),
            }),

            Type.Object({
                type: Type.Literal('variable'),
                format: Type.String(),
                name: Type.String(),
                suffix: Type.Optional(Type.String()),
            }),

            Type.Object({
                type: Type.Literal('function'),
                name: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.Literal('function'),
                    name: Type.String(),
                }),
                args: Type.Union([
                    Type.Object({
                        type: Type.Literal('expression'),
                        variant: Type.Literal('list'),
                        expression: Type.Array(This),
                        filter: Type.Optional(Type.String()),
                    }),
                    Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('star'),
                        name: Type.String(),
                    }),
                ]),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('function'),
                variant: Type.Literal('table'),
                name: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.Literal('function'),
                    name: Type.String(),
                }),
                args: Type.Object({
                    type: Type.Literal('expression'),
                    variant: Type.Literal('list'),
                    expression: Type.Array(This),
                }),
                alias: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('select'),
                result: Type.Array(This),
                from: Type.Optional(This),
                where: Type.Optional(Type.Array(This)),
                group: Type.Optional(
                    Type.Object({
                        type: Type.Literal('expression'),
                        variant: Type.Literal('list'),
                        expression: Type.Array(This),
                    }),
                ),
                having: Type.Optional(This),
                order: Type.Optional(Type.Array(This)),
                limit: Type.Optional(
                    Type.Object({
                        type: Type.Literal('expression'),
                        variant: Type.Literal('limit'),
                        start: This,
                        offset: Type.Optional(This),
                    }),
                ),
                with: Type.Optional(Type.Array(This)),
                alias: Type.Optional(Type.String()),
                explain: Type.Optional(Type.Boolean()),
                distinct: Type.Optional(Type.Boolean()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('insert'),
                action: Type.String(),
                into: This,
                result: Type.Union([
                    Type.Array(This),
                    This,
                    Type.Object({
                        type: Type.Literal('values'),
                        variant: Type.Literal('default'),
                    }),
                ]),
                returning: Type.Optional(Type.Array(This)),
                or: Type.Optional(Type.String()),
                explain: Type.Optional(Type.Boolean()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('update'),
                into: This,
                set: Type.Array(
                    Type.Object({
                        type: Type.Literal('assignment'),
                        target: Type.Object({
                            type: Type.Literal('identifier'),
                            variant: Type.Literal('column'),
                            name: Type.String(),
                            alias: Type.Optional(Type.String()),
                        }),
                        value: This,
                    }),
                ),
                where: Type.Optional(Type.Array(This)),
                limit: Type.Optional(This),
                or: Type.Optional(Type.String()),
                returning: Type.Optional(Type.Array(This)),
                explain: Type.Optional(Type.Boolean()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('delete'),
                from: This,
                where: Type.Optional(Type.Array(This)),
                limit: Type.Optional(This),
                returning: Type.Optional(Type.Array(This)),
                explain: Type.Optional(Type.Boolean()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('create'),
                format: Type.String(),
                name: Type.Optional(This),
                target: Type.Optional(This),
                definition: Type.Optional(Type.Array(This)),
                on: Type.Optional(This),
                where: Type.Optional(Type.Array(This)),
                result: Type.Optional(This),
                event: Type.Optional(
                    Type.Object({
                        type: Type.Literal('event'),
                        occurs: Type.Optional(Type.String()),
                        event: Type.String(),
                        of: Type.Optional(Type.Array(This)),
                    }),
                ),
                by: Type.Optional(Type.String()),
                action: Type.Optional(Type.Array(This)),
                when: Type.Optional(This),
                temporary: Type.Optional(Type.Boolean()),
                unique: Type.Optional(Type.Boolean()),
                condition: Type.Optional(
                    Type.Array(
                        Type.Object({
                            type: Type.Literal('condition'),
                            variant: Type.Literal('if'),
                            condition: Type.Object({
                                type: Type.Literal('expression'),
                                variant: Type.Literal('exists'),
                                operator: Type.String(),
                            }),
                        }),
                    ),
                ),
                optimization: Type.Optional(
                    Type.Array(
                        Type.Object({
                            type: Type.Literal('optimization'),
                            value: Type.String(),
                        }),
                    ),
                ),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('drop'),
                format: Type.String(),
                target: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.String(),
                    name: Type.String(),
                }),
                condition: Type.Array(
                    Type.Object({
                        type: Type.Literal('condition'),
                        variant: Type.Literal('if'),
                        condition: Type.Object({
                            type: Type.Literal('expression'),
                            variant: Type.Literal('exists'),
                            operator: Type.String(),
                        }),
                    }),
                ),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('compound'),
                statement: This,
                compound: Type.Array(
                    Type.Object({
                        type: Type.Literal('compound'),
                        variant: Type.String(),
                        statement: This,
                    }),
                ),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('transaction'),
                action: Type.String(),
                defer: Type.Optional(Type.String()),
                savepoint: Type.Optional(
                    Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('savepoint'),
                        name: Type.String(),
                    }),
                ),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('pragma'),
                target: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.Literal('pragma'),
                    name: Type.String(),
                }),
                args: Type.Object({
                    type: Type.Literal('expression'),
                    variant: Type.Literal('list'),
                    expression: Type.Union([
                        This,
                        Type.Null(),
                    ]),
                }),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('detach'),
                target: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.Literal('database'),
                    name: Type.String(),
                }),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('reindex'),
                target: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('analyze'),
                target: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('vacuum'),
                target: Type.Optional(
                    Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('database'),
                        name: Type.String(),
                    }),
                ),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('alter table'),
                target: This,
                action: Type.String(),
                name: Type.Optional(This),
                definition: Type.Optional(This),
                oldName: Type.Optional(Type.String()),
                newName: Type.Optional(Type.String()),
                column: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('attach'),
                target: This,
                attach: This,
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('release'),
                target: Type.Object({
                    savepoint: Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('savepoint'),
                        name: Type.String(),
                    }),
                }),
            }),
            Type.Object({
                type: Type.Literal('statement'),
                variant: Type.Literal('savepoint'),
                target: Type.Object({
                    savepoint: Type.Object({
                        type: Type.Literal('identifier'),
                        variant: Type.Literal('savepoint'),
                        name: Type.String(),
                    }),
                }),
            }),

            Type.Object({
                type: Type.Literal('definition'),
                variant: Type.Literal('column'),
                name: Type.String(),
                definition: Type.Array(This),
                datatype: Type.Object({
                    type: Type.Literal('datatype'),
                    variant: Type.String(),
                    affinity: Type.String(),
                    args: Type.Optional(
                        Type.Object({
                            type: Type.Literal('expression'),
                            variant: Type.Literal('list'),
                            expression: Type.Array(This),
                        }),
                    ),
                }),
            }),
            Type.Object({
                type: Type.Literal('definition'),
                variant: Type.Literal('constraint'),
                definition: Type.Array(This),
                columns: Type.Optional(Type.Array(This)),
                name: Type.Optional(Type.String()),
            }),

            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('primary key'),
                conflict: Type.Optional(Type.String()),
                direction: Type.Optional(Type.String()),
                autoIncrement: Type.Optional(Type.Boolean()),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('unique'),
                conflict: Type.Optional(Type.String()),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('not null'),
                conflict: Type.Optional(Type.String()),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('null'),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('check'),
                expression: This,
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('foreign key'),
                references: This,
                action: Type.Optional(
                    Type.Array(
                        Type.Object({
                            type: Type.Literal('action'),
                            variant: Type.String(),
                            action: Type.String(),
                        }),
                    ),
                ),
                defer: Type.Optional(Type.String()),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('default'),
                value: This,
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('collate'),
                collate: Type.Object({
                    collate: Type.Array(
                        Type.Object({
                            type: Type.Literal('identifier'),
                            variant: Type.Literal('collation'),
                            name: Type.String(),
                        }),
                    ),
                }),
                name: Type.Optional(Type.String()),
            }),
            Type.Object({
                type: Type.Literal('constraint'),
                variant: Type.Literal('join'),
                format: Type.String(),
                on: Type.Optional(This),
                using: Type.Optional(
                    Type.Object({
                        columns: Type.Array(
                            Type.Object({
                                type: Type.Literal('identifier'),
                                variant: Type.Literal('column'),
                                name: Type.String(),
                                alias: Type.Optional(Type.String()),
                            }),
                        ),
                    }),
                ),
            }),

            Type.Object({
                type: Type.Literal('join'),
                variant: Type.String(),
                source: This,
                constraint: Type.Optional(This),
            }),
            Type.Object({
                type: Type.Literal('map'),
                variant: Type.Literal('join'),
                source: This,
                map: Type.Array(This),
            }),

            Type.Object({
                type: Type.Literal('module'),
                variant: Type.Literal('virtual'),
                name: Type.String(),
                args: Type.Object({
                    type: Type.Literal('expression'),
                    variant: Type.Literal('list'),
                    expression: Type.Array(This),
                }),
            }),
            Type.Object({
                type: Type.Literal('assignment'),
                target: Type.Object({
                    type: Type.Literal('identifier'),
                    variant: Type.Literal('column'),
                    name: Type.String(),
                    alias: Type.Optional(Type.String()),
                }),
                value: This,
            }),
            Type.Object({
                type: Type.Literal('condition'),
                variant: Type.Literal('when'),
                condition: This,
                consequent: This,
            }),
            Type.Object({
                type: Type.Literal('condition'),
                variant: Type.Literal('else'),
                consequent: This,
            }),
            Type.Object({
                type: Type.Literal('condition'),
                variant: Type.Literal('if'),
                condition: Type.Object({
                    type: Type.Literal('expression'),
                    variant: Type.Literal('exists'),
                    operator: Type.String(),
                }),
            }),
            Type.Object({
                type: Type.Literal('event'),
                occurs: Type.String(),
                event: Type.String(),
                of: Type.Optional(Type.Array(This)),
            }),
            Type.Object({
                type: Type.Literal('compound'),
                variant: Type.String(),
                statement: This,
            }),
            Type.Object({
                type: Type.Literal('values'),
                variant: Type.Literal('default'),
            }),
            Type.Object({
                type: Type.Literal('datatype'),
                variant: Type.String(),
                affinity: Type.String(),
                args: Type.Optional(
                    Type.Object({
                        type: Type.Literal('expression'),
                        variant: Type.Literal('list'),
                        expression: Type.Array(This),
                    }),
                ),
            }),
        ]);
    },
    {$id: 'SqliteAst'},
);

/**
 * Schema for the top-level statement list returned by `parseSqlite`.
 *
 * @category Internal
 */
export const parseSqliteOutputSchema = Type.Object({
    type: Type.Literal('statement'),
    variant: Type.Literal('list'),
    statement: Type.Array(sqliteAstSchema),
});

/**
 * The shape of the output from `parseSqlite`.
 *
 * @category Internal
 */
export const parseSqliteOutputShape = defineShape(parseSqliteOutputSchema);

/**
 * Output from `parseSqlite()`.
 *
 * @category Internal
 */
export type ParseSqliteOutput = typeof parseSqliteOutputShape.runtimeType;

/**
 * The TypeScript type for an individual node in the AST.
 *
 * @category Internal
 */
export type SqliteAstNode = Static<typeof sqliteAstSchema>;

/**
 * The TypeScript type for the top level AST result.
 *
 * @category Internal
 */
export type SqliteAst = Extract<SqliteAstNode, {type: 'statement'}>;
