


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

### License

See `LICENSE` for details. `optifine-backend` is GNU GPL v3. Root directory is [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1).