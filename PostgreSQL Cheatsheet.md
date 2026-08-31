Here is a cheat sheet of the most common and useful meta-commands for the psql interactive interface.

## Help and Navigation

- \? – View all available psql commands.
- \h – View help for specific SQL syntax (e.g., \h CREATE TABLE).
- \q – Exit the psql interface.

## Connection and Information

- \c database_name – Connect to a different database.
- \conninfo – Show details about the current connection.

## Listing Database Objects

- \dt – List all tables in the current database.
- \dv – List all views.
- \di – List all indexes.
- \dn – List all schemas.
- \du – List all users and their roles.
- \df – List all functions.

## Detailed Inspection

- \d table_name – Describe a specific table (shows columns, data types, and modifiers).
- \dt+ – List tables with extra details (like size and descriptions).

## Formatting and Output

- \x – Toggle expanded auto-formatting (highly useful for viewing rows with many columns).
- \timing – Toggle the display of query execution time.
