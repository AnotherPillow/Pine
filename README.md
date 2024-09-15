# Pine

A custom selfhosted optifine cape & cosmetic server.

## Usage

### Environment variables

#### `optifine-backend`

- `TURSO_DATABASE_URL`: URL to a turso DB.
- `TURSO_AUTH_TOKEN`: Auth token for the DB above, can be read-only if you wish.
- `FORWARDING_HOST`: Domain/Host to forward requests to if the Pine instance doesn't have one (such as to see normal optifine capes)
- `HOSTING_HOST`: Host for the server to listen on.

#### `user-facing`

- `MCAUTH_CLIENTID`: ID for an [mcauth](https://mc-auth.com/) application
- `PUBLIC_MCAUTH_CLIENTID`: ID for the same [mcauth](https://mc-auth.com/) application
- `MCAUTH_CLIENTSECRET` the same [mcauth](https://mc-auth.com/) application's client secret.
- `TURSO_DATABASE_URL` URL to same DB as backend.
- `TURSO_AUTH_TOKEN` Auth token for the DB. Has to be read & write.
- `IP_SALT` salt used for IP addresses. This should be created [similar to is suggested here](https://authjs.dev/getting-started/deployment) for a secret. Should be >6 characters
- `PUBLIC_COMMUNITY_NAME` self explanatory.
- `PUBLIC_BACKDROP` url to background image.

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
    cosmetics TEXT,
    ip TEXT
);
```

## License

See `LICENSE` for details. `optifine-backend` is GNU AGPL v3. `user-facing` is MPL 2.0. Root directory is [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1).
