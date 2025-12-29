# sqlite-ast

Parses SQLite syntax into an AST.

## Install

```sh
npm i sqlite-ast
```

## Usage

<!-- example-link: src/parse-sqlite.example.ts -->

```TypeScript
import {parseSqlite, sql} from 'sqlite-ast';

const ast = parseSqlite(sql`SELECT * from user;`);
```

## Dev

Run `npm init` to regenerate the parser.
