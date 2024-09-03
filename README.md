


### Database Setup

```sqlite
CREATE TABLE IF NOT EXISTS COSMETICS (
    name TEXT NOT NULL PRIMARY KEY,
    authorName TEXT NOT NULL,
    authorUUID TEXT NOT NULL,
    assetURL TEXT,
    model TEXT NOT NULL
  );
CREATE TABLE IF NOT EXISTS CAPES (
    name TEXT NOT NULL PRIMARY KEY,
    authorName TEXT NOT NULL,
    authorUUID TEXT NOT NULL,
    assetURL TEXT
  );
CREATE TABLE IF NOT EXISTS USERS (
    name TEXT PRIMARY KEY,
    uuid TEXT NOT NULL,
    cape TEXT,
    cosmetics TEXT
  );
```