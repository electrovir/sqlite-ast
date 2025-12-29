import {describe, snapshotCases} from '@augment-vir/test';
import {parseSqlite} from './parse-sqlite.js';
import {sql} from './sql.js';

describe(parseSqlite.name, () => {
    snapshotCases(parseSqlite, [
        {
            it: 'selects',
            input: sql`
                SELECT * FROM users;
            `,
        },
        {
            it: 'inserts',
            input: sql`
                INSERT INTO users (id, name, email) VALUES (2, "example", "example@example.com");
            `,
        },
        {
            it: 'inserts with returning',
            input: sql`
                INSERT INTO users (id, name, email) VALUES (2, "example", "example@example.com") RETURNING *;
            `,
        },
        {
            it: 'basic select',
            input: sql`
                SELECT *
                FROM bananas
                WHERE color = 'red'
            `,
        },
        {
            it: 'select alt syntax (VALUES)',
            input: sql`
                VALUES (1, 2, 3),
                       (4, 5, 6)
                ORDER BY ham DESC
            `,
        },
        {
            it: 'select parts',
            input: sql`
                SELECT *
                FROM \`hats\` h
                WHERE h.color == 'red'
                GROUP BY h.color, h.material
                HAVING COUNT(h.quantity) >= 200
                ORDER BY h.color DESC
                LIMIT 20
                OFFSET 10
            `,
        },
        {
            it: 'select qualified table',
            input: sql`
                SELECT *
                FROM bees AS b INDEXED BY bees_index
            `,
        },
        {
            it: 'select subquery',
            input: sql`
                SELECT a.color
                FROM (
                    SELECT b.color
                    FROM bananas b
                ) z
                JOIN apples a ON a.color = b.color
            `,
        },
        {
            it: 'select union',
            input: sql`
                SELECT *
                FROM a
                UNION
                SELECT *
                FROM b
            `,
        },
        {
            it: 'basic aliases',
            input: sql`
                SELECT
                    apple AS "The Apple",
                    pear The_Pear,
                    orange AS [TheOrange],
                    pineapple whereKeyword
                FROM bananas AS b
            `,
        },
        {
            it: 'reserved word aliases',
            input: sql`
                SELECT intersects inid, innot notin
                FROM fromson nots
                WHERE colorwhere IN nots.pon;
            `,
        },
        {
            it: 'uncommon aliases',
            input: sql`
                SELECT
                    'hat'.*,
                    COUNT(*) AS 'pants'
                FROM hats 'hat'
            `,
        },
        {
            it: 'basic comments',
            input: sql`
                /* select id from Movies where id in
                 * (select movie_id from Rooms where seats > 75);
                 */
                SELECT 1;

                /* select id from Movies where id in
                 * (select movie_id from Rooms where seats > 75);
                 * /*
                 * nested block comment -- here is another one
                 * /* another nest level */
                 * and this
                 * */
                 * some more stuff here
                 */

                SELECT movie_id
                -- FROM Movies
                -- WHERE seats != 0
                FROM Rooms -- unicorn
                AS hat
                -- comments!
                WHERE seats > 75 -- happy birthday
                ;

                SELECT 2 FROM -- comment
                hats
            `,
        },
        {
            it: 'basic create index',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`anger\` > 0
            `,
        },
        {
            it: 'basic create table',
            input: sql`
                CREATE TABLE advertisements (
                    id INT PRIMARY KEY,
                    name VARCHAR(50),
                    category VARCHAR(15),
                    cost INT
                );
            `,
        },
        {
            it: 'create table with inline check',
            input: sql`
                CREATE TABLE Bees (
                    id INT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    wings INT CHECK (wings >= 2),
                    legs INT CHECK (legs < 8)
                );
            `,
        },
        {
            it: 'create table with table check',
            input: sql`
                CREATE TABLE Bees (
                    id INT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    wings INT,
                    legs INT,
                    CHECK (legs < 8),
                    CHECK (wings >= 2)
                );
            `,
        },
        {
            it: 'create table with foreign key constraint',
            input: sql`
                CREATE TABLE Bees (
                    id INT PRIMARY KEY,
                    color INT,
                    hive_id INT UNIQUE,
                    FOREIGN KEY (hive_id) REFERENCES Hives
                );
            `,
        },
        {
            it: 'create table with inline foreign key',
            input: sql`
                CREATE TABLE Bees (
                    id INT PRIMARY KEY,
                    color INT,
                    hive_id INT UNIQUE REFERENCES Hives(id)
                );
            `,
        },
        {
            it: 'create table with primary key constraint',
            input: sql`
                CREATE TABLE Bees (
                    id INT,
                    color INT,
                    hive_id INT UNIQUE,
                    PRIMARY KEY (id) ON CONFLICT FAIL
                );
            `,
        },
        {
            it: 'create table as select',
            input: sql`
                CREATE TABLE [bees] AS
                SELECT name, color, legs, id
                FROM [old_bees]
                WHERE name IS NOT NULL
            `,
        },
        {
            it: 'basic create trigger',
            input: sql`
                CREATE TRIGGER cust_addr_chng
                INSTEAD OF UPDATE OF cust_addr ON customer_address
                WHEN cust_addr NOT NULL
                BEGIN
                    UPDATE customer
                    SET cust_addr = NEW.cust_addr
                    WHERE cust_id = NEW.cust_id;
                END;
            `,
        },
        {
            it: 'create temporary trigger',
            input: sql`
                CREATE TEMPORARY TRIGGER IF NOT EXISTS happy_bee_time
                BEFORE DELETE ON bees
                FOR EACH ROW
                WHEN name == 'Nick'
                BEGIN
                    INSERT INTO hive (id, name) VALUES (4, 'A Better Hive');
                    INSERT INTO bees (name, color, hive_id) VALUES ('New Nick', 'purple', 4);
                END;
            `,
        },
        {
            it: 'basic create view',
            input: sql`
                CREATE VIEW happy.bananaView AS
                SELECT type, name, origin
                FROM bananas
                WHERE color = 'red'
            `,
        },
        {
            it: 'basic create virtual table',
            input: sql`
                CREATE VIRTUAL TABLE happy_table
                USING happy_module(some != 'expression', 'just a string', 33.0);
            `,
        },
        {
            it: 'create virtual table alt syntax',
            input: sql`
                CREATE VIRTUAL TABLE happy_table
                USING happy_module(
                    id INT PRIMARY KEY,
                    name VARCHAR(50),
                    category VARCHAR(15),
                    cost INT
                );
            `,
        },
        {
            it: 'basic datatypes',
            input: sql`
                SELECT
                    CAST(a AS NVARCHAR(20)) AS [a1],
                    CAST(b AS VARCHAR(10)) AS [b1],
                    CAST(c AS CHAR(4)) AS [c1],
                    CAST(d AS TINYTEXT) AS [d1],
                    CAST(e AS MEDIUMTEXT) AS [e1],
                    CAST(f AS LONGTEXT) AS [f1],
                    CAST(g AS CLOB(400)) AS [g1],
                    CAST(h AS DOUBLE PRECISION) AS [h1],
                    CAST(i AS DOUBLE) AS [i1],
                    CAST(j AS FLOAT) AS [j1],
                    CAST(k AS REAL) AS [k1],
                    CAST(l AS NUMERIC) AS [l1],
                    CAST(m AS DECIMAL(6, 2)) AS [m1],
                    CAST(n AS BOOLEAN) AS [n1],
                    CAST(o AS DATE) AS [o1],
                    CAST(p AS DATETIME) AS [p1],
                    CAST(q AS TIMESTAMP) AS [q1],
                    CAST(r AS TIME) AS [r1],
                    CAST(s AS INT) AS [s1],
                    CAST(t AS INTEGER) AS [t1],
                    CAST(u AS INT4) AS [u1],
                    CAST(v AS BIGINT) AS [v1],
                    CAST(w AS MEDIUMINT) AS [w1],
                    CAST(x AS SMALLINT) AS [x1],
                    CAST(y AS TINYINT) AS [y1],
                    CAST(z AS BLOB) AS [z1]
                FROM "ALL_DATATYPES";

                CREATE TABLE "MORE_DATATYPES" (
                    a VARCHAR(20) NOT NULL,
                    b TEXT NULL,
                    c INT8 NOT NULL,
                    d DOUBLE NULL,
                    e BLOB NULL
                );
            `,
        },
        {
            it: 'basic delete',
            input: sql`
                DELETE FROM bees
                WHERE status = 'stung' OR status = 'eaten'
            `,
        },
        {
            it: 'delete with limit',
            input: sql`
                DELETE FROM bees
                WHERE status = 'stung' OR status = 'eaten'
                LIMIT 10, 5
            `,
        },
        {
            it: 'basic drop table',
            input: sql`DROP TABLE beeStuff`,
        },
        {
            it: 'drops a column',
            input: sql`
                ALTER TABLE users DROP COLUMN "name"
            `,
        },
        {
            it: 'drop trigger',
            input: sql`DROP TRIGGER IF EXISTS \`happy\`.\`insertRecord\``,
        },
        {
            it: 'drop table if exists',
            input: sql`DROP TABLE IF EXISTS hive.beeStuff`,
        },
        {
            it: 'binary between',
            input: sql`
                SELECT *
                FROM hats
                WHERE x || y BETWEEN x * 2 AND x * 3
            `,
        },
        {
            it: 'binary case',
            input: sql`
                SELECT
                    CASE
                        WHEN bee = 'red' THEN 'ANGRY'
                        WHEN bee = 'green' THEN 'HAPPY'
                        ELSE 'NEUTRAL'
                    END AS BeeState
                FROM bees
            `,
        },
        {
            it: 'binary cast',
            input: sql`
                SELECT CAST(430.120 AS VARCHAR(20))
                FROM bees
            `,
        },
        {
            it: 'binary concatenation',
            input: sql`
                SELECT *
                FROM bananas
                WHERE 1 != 2 AND color != 'blue' OR pees == crackers
            `,
        },
        {
            it: 'binary grouping',
            input: sql`
                SELECT * FROM t WHERE -1 * (2 + 3);
                SELECT * FROM t WHERE 3 + 4 * 5 > 20;
                SELECT * FROM t WHERE v1 = ((v2 * 5) - v3)
            `,
        },
        {
            it: 'expression grouping 1',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`anger\` != NULL AND NOT \`happiness\`
            `,
        },
        {
            it: 'expression grouping 2',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`happiness\` NOT NULL AND \`anger\` > 0
            `,
        },
        {
            it: 'expression grouping 3',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`happiness\` IS NOT NULL AND \`anger\` > 0
            `,
        },
        {
            it: 'expression grouping 4',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`happiness\` ISNULL AND \`anger\` > 0
            `,
        },
        {
            it: 'expression grouping 5',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE \`anger\` > 0 AND \`happiness\` IS NOT NULL
            `,
        },
        {
            it: 'expression grouping 6',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE NOT \`happiness\` AND \`anger\` > 0
            `,
        },
        {
            it: 'expression grouping 7',
            input: sql`
                CREATE INDEX \`bees\`.\`hive_state\`
                ON \`hive\` (\`happiness\` ASC, \`anger\` DESC)
                WHERE NOT \`happiness\` OR ~\`ANGER\` AND \`anger\` IS NOT 0
            `,
        },
        {
            it: 'expression grouping 8',
            input: sql`
                SELECT
                    - -(a + 1 * 3) AS "A",
                    ((3 + x) * 3) AS "B",
                    a BETWEEN +- 2 * 2 AND 3 NOT LIKE 1 ESCAPE bees(10) AS "C",
                    -+-2 + - + -2 AS "D",
                    CASE
                        WHEN BEEP != - BOOP THEN CASE WHEN A > 2 THEN 1 ELSE 0 END
                        ELSE DUCK
                    END AS "E"
            `,
        },
        {
            it: 'expression grouping 9',
            input: sql`
                SELECT x FROM foo WHERE (a OR b) AND c;
                SELECT x FROM foo WHERE a OR b AND c
            `,
        },
        {
            it: 'expression like',
            input: sql`
                SELECT *
                FROM hats
                WHERE bees LIKE '%somebees%'
            `,
        },
        {
            it: 'expression parenthesis 1',
            input: sql`
                SELECT *
                FROM hats
                WHERE hat OR (shirt AND (shoes OR wig) AND pants)
            `,
        },
        {
            it: 'expression parenthesis 2',
            input: sql`
                SELECT *
                FROM hats
                WHERE (1 != 2 OR 3 != 4) AND (3 == 3)
            `,
        },
        {
            it: 'expression table',
            input: sql`
                WITH ham AS (
                    SELECT type
                    FROM hams
                )
                SELECT *
                FROM inventory
                INNER JOIN ham ON inventory.variety = ham.type
            `,
        },
        {
            it: 'expression unary',
            input: sql`
                SELECT NOT bees AS [b]
                FROM hats
            `,
        },
        {
            it: 'with table expression 1',
            input: sql`
                WITH RECURSIVE
                    hat (hat, pants) AS (
                        SELECT * FROM hats
                    ),
                    pant AS (
                        SELECT * FROM pants
                    ),
                    nap (a) AS (
                        SELECT sleep FROM naps
                    )
                SELECT * FROM Nick
            `,
        },
        {
            it: 'with table expression 2',
            input: sql`
                WITH RECURSIVE
                    parent_of(name, parent) AS (
                        SELECT name, mom FROM family
                        UNION
                        SELECT name, dad FROM family
                    ),
                    ancestor_of_alice(name) AS (
                        SELECT parent FROM parent_of WHERE name = 'Alice'
                        UNION ALL
                        SELECT parent FROM parent_of JOIN ancestor_of_alice USING(name)
                    )
                SELECT family.name
                FROM ancestor_of_alice, family
                WHERE ancestor_of_alice.name = family.name
                    AND died IS NULL
                ORDER BY born;
            `,
        },
        {
            it: 'basic function',
            input: sql`
                SELECT COUNT(*), MAX(price)
                FROM apples
            `,
        },
        {
            it: 'function mixed args',
            input: sql`SELECT MYFUNC(col, 1.2, 'str') AS "Super Func"`,
        },
        {
            it: 'basic insert',
            input: sql`
                INSERT INTO concessions (item, size, id, price)
                VALUES
                    ('Nachos', 'Regular', NULL, NULL),
                    ('Pizza', NULL, 8, 2.00);
            `,
        },
        {
            it: 'insert into default',
            input: sql`
                INSERT INTO apples (a, b, c)
                DEFAULT VALUES
            `,
        },
        {
            it: 'insert into select',
            input: sql`
                INSERT INTO foods (item, size, id, price)
                SELECT 'banana', size, NULL, price
                FROM bananas
                WHERE color != 'red'
            `,
        },
        {
            it: 'join types 1',
            input: sql`
                SELECT m.title, r.id "Theatre Number"
                FROM Movies m
                INNER JOIN (
                    SELECT r2.movie_id
                    FROM Rooms r2
                    WHERE r2.seats >= 50
                ) AS r ON m.id = r.movie_id AND m.title != 'Batman';
            `,
        },
        {
            it: 'join types 2',
            input: sql`
                SELECT m.title, r.id "Theatre Number"
                FROM Movies m
                LEFT OUTER JOIN Rooms r ON m.id = r.movie_id;
            `,
        },
        {
            it: 'multiple queries 1',
            input: sql`
                CREATE TABLE Actors (
                    name VARCHAR(50),
                    country VARCHAR(50),
                    salary INTEGER
                );

                INSERT INTO Actors (name, country, salary) VALUES
                    ('Vivien Leigh', 'IN', 150000),
                    ('Clark Gable', 'USA', 120000),
                    ('Olivia de Havilland', 'Japan', 30000),
                    ('Hattie McDaniel', 'USA', 45000);

                SELECT
                    MIN(salary) AS "MinSalary",
                    MAX(salary) AS "MaxSalary"
                FROM Actors;
            `,
        },
        {
            it: 'multiple queries 2',
            input: sql`
                CREATE TABLE Actors (
                    id INT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE
                );

                INSERT INTO Actors (name) VALUES
                    ('Vivien Leigh'),
                    ('Clark Gable'),
                    ('Olivia de Havilland');

                CREATE TABLE Movies (
                    id INT PRIMARY KEY,
                    title VARCHAR(50) NOT NULL UNIQUE
                );

                INSERT INTO Movies (title) VALUES
                    ('Don Juan'),
                    ('The Lost World'),
                    ('Peter Pan'),
                    ('Robin Hood'),
                    ('Wolfman');

                CREATE TABLE Actors_Movies (
                    actor_id INT REFERENCES actors,
                    movie_id INT REFERENCES movies
                );

                INSERT INTO Actors_Movies (actor_id, movie_id)
                VALUES (2, 5);
            `,
        },
        {
            it: 'multiple queries 3',
            input: sql`
                SELECT a, b FROM table1
                INTERSECT
                SELECT * FROM (
                    SELECT a, b FROM table2
                    EXCEPT
                    SELECT a, b FROM table3
                );

                SELECT a, b FROM table1
                UNION
                SELECT * FROM (
                    SELECT a, b FROM table2
                    EXCEPT
                    SELECT a, b FROM table3
                )
            `,
        },
        {
            it: 'basic transaction',
            input: sql`
                BEGIN IMMEDIATE TRANSACTION;

                CREATE TABLE foods (
                    id INT PRIMARY KEY,
                    item VARCHAR(50),
                    size VARCHAR(15),
                    price INT
                );

                INSERT INTO foods (item, size, id, price)
                SELECT 'banana', size, NULL, price
                FROM bananas
                WHERE color != 'red';

                COMMIT;
            `,
        },
        {
            it: 'transaction misc',
            input: sql`
                RELEASE SAVEPOINT happy_place;
                RELEASE sad_place;
                SAVEPOINT bee_time;
            `,
        },
        {
            it: 'transaction rollback',
            input: sql`ROLLBACK TRANSACTION TO SAVEPOINT super_save`,
        },
        {
            it: 'basic sqlite internal',
            input: sql`
                DETACH hat_db;
                DETACH DATABASE pants_db;
                REINDEX happy_collation;
                REINDEX;
                REINDEX hat_db.pants_table;
                ANALYZE happy_table;
                ANALYZE;
                ANALYZE hat_db.pants_table;
                VACUUM;
            `,
        },
        {
            it: 'sqlite pragma',
            input: sql`
                PRAGMA hat.pants = 'some string';
                PRAGMA pants.pants(+200.00);
                PRAGMA nap.times;
                PRAGMA suit = NO;
            `,
        },
        {
            it: 'basic update',
            input: sql`
                UPDATE bees
                SET name = 'drone', wings = 2
                WHERE name NOT IN (
                    SELECT name FROM bee_names WHERE size < 3.14
                )
            `,
        },
        {
            it: 'update with limit',
            input: sql`
                UPDATE bees
                SET name = 'drone', wings = 2
                WHERE name != 'nicholas'
                LIMIT 2
                OFFSET 10
            `,
        },
        {
            it: 'explain statement',
            input: sql`
                EXPLAIN SELECT * FROM users WHERE id = 1
            `,
        },
        {
            it: 'explain query plan',
            input: sql`
                EXPLAIN QUERY PLAN SELECT * FROM users WHERE id = 1
            `,
        },
        {
            it: 'alter table rename',
            input: sql`
                ALTER TABLE old_users RENAME TO new_users
            `,
        },
        {
            it: 'alter table add column',
            input: sql`
                ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT ''
            `,
        },
        {
            it: 'alter table add column without COLUMN keyword',
            input: sql`
                ALTER TABLE users ADD age INT
            `,
        },
        {
            it: 'attach database',
            input: sql`
                ATTACH DATABASE 'backup.db' AS backup
            `,
        },
        {
            it: 'drop index',
            input: sql`
                DROP INDEX IF EXISTS idx_users_email
            `,
        },
        {
            it: 'drop view',
            input: sql`
                DROP VIEW IF EXISTS user_summary
            `,
        },
        {
            it: 'bind parameters numbered',
            input: sql`
                SELECT * FROM users WHERE id = ? AND name = ?1 AND age > ?2
            `,
        },
        {
            it: 'bind parameters named',
            input: sql`
                SELECT * FROM users WHERE id = :id AND name = @name AND age > $age
            `,
        },
        {
            it: 'insert or replace',
            input: sql`
                INSERT OR REPLACE INTO users (id, name) VALUES (1, 'Alice')
            `,
        },
        {
            it: 'insert or ignore',
            input: sql`
                INSERT OR IGNORE INTO users (id, name) VALUES (1, 'Bob')
            `,
        },
        {
            it: 'replace statement',
            input: sql`
                REPLACE INTO users (id, name) VALUES (1, 'Charlie')
            `,
        },
        {
            it: 'update or rollback',
            input: sql`
                UPDATE OR ROLLBACK users SET name = 'Updated' WHERE id = 1
            `,
        },
        {
            it: 'glob expression',
            input: sql`
                SELECT * FROM files WHERE name GLOB '*.txt'
            `,
        },
        {
            it: 'regexp expression',
            input: sql`
                SELECT * FROM users WHERE email REGEXP '^[a-z]+@example\.com$'
            `,
        },
        {
            it: 'match expression',
            input: sql`
                SELECT * FROM documents WHERE content MATCH 'sqlite'
            `,
        },
        {
            it: 'not like expression',
            input: sql`
                SELECT * FROM users WHERE name NOT LIKE '%test%'
            `,
        },
        {
            it: 'not glob expression',
            input: sql`
                SELECT * FROM files WHERE name NOT GLOB '*.tmp'
            `,
        },
        {
            it: 'select distinct',
            input: sql`
                SELECT DISTINCT category, status FROM products
            `,
        },
        {
            it: 'select all',
            input: sql`
                SELECT ALL name FROM users
            `,
        },
        {
            it: 'union all',
            input: sql`
                SELECT id, name FROM employees
                UNION ALL
                SELECT id, name FROM contractors
            `,
        },
        {
            it: 'natural join',
            input: sql`
                SELECT * FROM orders NATURAL JOIN customers
            `,
        },
        {
            it: 'cross join',
            input: sql`
                SELECT * FROM colors CROSS JOIN sizes
            `,
        },
        {
            it: 'join using clause',
            input: sql`
                SELECT * FROM orders JOIN customers USING (customer_id)
            `,
        },
        {
            it: 'not indexed',
            input: sql`
                SELECT * FROM users NOT INDEXED WHERE id = 1
            `,
        },
        {
            it: 'create table without rowid',
            input: sql`
                CREATE TABLE settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                ) WITHOUT ROWID
            `,
        },
        {
            it: 'autoincrement column',
            input: sql`
                CREATE TABLE events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                )
            `,
        },
        {
            it: 'deferrable foreign key',
            input: sql`
                CREATE TABLE child (
                    id INT PRIMARY KEY,
                    parent_id INT REFERENCES parent(id) DEFERRABLE INITIALLY DEFERRED
                )
            `,
        },
        {
            it: 'foreign key actions',
            input: sql`
                CREATE TABLE child (
                    id INT PRIMARY KEY,
                    parent_id INT REFERENCES parent(id) ON DELETE CASCADE ON UPDATE SET NULL
                )
            `,
        },
        {
            it: 'exists subquery',
            input: sql`
                SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)
            `,
        },
        {
            it: 'not exists subquery',
            input: sql`
                SELECT * FROM users WHERE NOT EXISTS (SELECT 1 FROM banned WHERE banned.user_id = users.id)
            `,
        },
        {
            it: 'raise expression in trigger',
            input: sql`
                CREATE TRIGGER validate_insert
                BEFORE INSERT ON users
                BEGIN
                    SELECT RAISE(ABORT, 'Invalid user data') WHERE NEW.name IS NULL;
                END
            `,
        },
        {
            it: 'hexadecimal literal',
            input: sql`
                SELECT 0x1F, 0xDEADBEEF, 0xff FROM dual
            `,
        },
        {
            it: 'blob literal',
            input: sql`
                INSERT INTO blobs (data) VALUES (x'48454C4C4F')
            `,
        },
        {
            it: 'date literals',
            input: sql`
                SELECT CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP FROM events
            `,
        },
        {
            it: 'collate expression',
            input: sql`
                SELECT * FROM users ORDER BY name COLLATE NOCASE
            `,
        },
        {
            it: 'collate in column definition',
            input: sql`
                CREATE TABLE names (
                    id INT PRIMARY KEY,
                    name TEXT COLLATE NOCASE
                )
            `,
        },
        {
            it: 'delete with returning',
            input: sql`
                DELETE FROM users WHERE status = 'inactive' RETURNING id, name
            `,
        },
        {
            it: 'update with returning',
            input: sql`
                UPDATE users SET status = 'active' WHERE id = 1 RETURNING *
            `,
        },
        {
            it: 'vacuum with schema',
            input: sql`
                VACUUM main
            `,
        },
        {
            it: 'in expression with list',
            input: sql`
                SELECT * FROM users WHERE status IN ('active', 'pending', 'review')
            `,
        },
        {
            it: 'in expression with subquery',
            input: sql`
                SELECT * FROM products WHERE category_id IN (SELECT id FROM categories WHERE active = 1)
            `,
        },
        {
            it: 'not in expression',
            input: sql`
                SELECT * FROM users WHERE id NOT IN (1, 2, 3)
            `,
        },
        {
            it: 'is null and is not null',
            input: sql`
                SELECT * FROM users WHERE email IS NULL OR phone IS NOT NULL
            `,
        },
        {
            it: 'between with not',
            input: sql`
                SELECT * FROM products WHERE price NOT BETWEEN 10 AND 100
            `,
        },
        {
            it: 'function with distinct',
            input: sql`
                SELECT COUNT(DISTINCT category) FROM products
            `,
        },
        {
            it: 'table valued function',
            input: sql`
                SELECT * FROM json_each('[1,2,3]') AS j
            `,
        },
        {
            it: 'unique table constraint',
            input: sql`
                CREATE TABLE user_roles (
                    user_id INT,
                    role_id INT,
                    UNIQUE (user_id, role_id)
                )
            `,
        },
        {
            it: 'named constraints',
            input: sql`
                CREATE TABLE products (
                    id INT,
                    price DECIMAL(10,2),
                    CONSTRAINT pk_products PRIMARY KEY (id),
                    CONSTRAINT chk_price CHECK (price >= 0)
                )
            `,
        },
        {
            it: 'on conflict clause in constraint',
            input: sql`
                CREATE TABLE settings (
                    key TEXT PRIMARY KEY ON CONFLICT REPLACE,
                    value TEXT NOT NULL ON CONFLICT ABORT
                )
            `,
        },
        {
            it: 'create temporary table',
            input: sql`
                CREATE TEMP TABLE temp_results (
                    id INT,
                    value TEXT
                )
            `,
        },
        {
            it: 'create temporary view',
            input: sql`
                CREATE TEMPORARY VIEW temp_user_summary AS
                SELECT id, name FROM users WHERE active = 1
            `,
        },
        {
            it: 'create unique index',
            input: sql`
                CREATE UNIQUE INDEX idx_users_email ON users (email)
            `,
        },
        {
            it: 'create index if not exists',
            input: sql`
                CREATE INDEX IF NOT EXISTS idx_users_name ON users (name)
            `,
        },
        {
            it: 'create view with columns',
            input: sql`
                CREATE VIEW user_info (user_id, user_name, user_email) AS
                SELECT id, name, email FROM users
            `,
        },
        {
            it: 'expression with escape clause',
            input: sql`
                SELECT * FROM paths WHERE path LIKE '%\%%' ESCAPE '\\'
            `,
        },
        {
            it: 'scientific notation numbers',
            input: sql`
                SELECT 1.5e10, 2.3E-5, 4e+2 FROM numbers
            `,
        },
        {
            it: 'negative numbers',
            input: sql`
                INSERT INTO temps (value) VALUES (-273.15), (+100), (-.5)
            `,
        },
        {
            it: 'renames a column',
            input: sql`
                ALTER TABLE users RENAME COLUMN name TO human_name;
            `,
        },
        {
            it: 'compound select with except',
            input: sql`
                SELECT id FROM all_users
                EXCEPT
                SELECT user_id FROM banned_users
            `,
        },
        {
            it: 'compound select with intersect',
            input: sql`
                SELECT id FROM premium_users
                INTERSECT
                SELECT id FROM active_users
            `,
        },
        {
            it: 'qualified star in select',
            input: sql`
                SELECT users.*, orders.id AS order_id
                FROM users
                JOIN orders ON users.id = orders.user_id
            `,
        },
        {
            it: 'deferred transaction',
            input: sql`
                BEGIN DEFERRED TRANSACTION
            `,
        },
        {
            it: 'exclusive transaction',
            input: sql`
                BEGIN EXCLUSIVE
            `,
        },
    ]);
});
