import { Client, createClient } from "@libsql/client";

export default class Database {
    private client: Client;

    constructor() {
        this.client = createClient({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
    }

    async getCosmeticsForUser(name: string) {
        const data = await this.client.execute({
            sql: 'SELECT cosmetics FROM users WHERE name = ?',
            args: [ name ],
        }).catch(console.error)
        return data?.rows?.length ? data.rows[0] : null
    }
    
    async getCapeForUser(name: string) {
        const data = await this.client.execute({
            sql: 'SELECT cape FROM users WHERE name = ?',
            args: [ name ],
        }).catch(console.error)
        return data?.rows?.length ? data.rows[0] : null
    }

    async getCapeImage(name: string) {
        const data = await this.client.execute({
            sql: 'SELECT assetURL FROM capes where name = ?',
            args: [ name ],
        }).catch(console.error)
        return data?.rows?.length ? data.rows[0] : null
    }

    async getCosmeticModel(name: string) {
        const data = await this.client.execute({
            sql: 'SELECT model FROM cosmetics where name = ?',
            args: [ name ],
        }).catch(console.error)
        return data?.rows?.length ? data.rows[0] : null
    }
}