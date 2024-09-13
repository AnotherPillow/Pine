import { env } from "$env/dynamic/private";
import { type Client, createClient } from "@libsql/client";

export default class Database {
    private client: Client;

    constructor() {
        this.client = createClient({
            url: env.TURSO_DATABASE_URL!,
            authToken: env.TURSO_AUTH_TOKEN!,
        });
    }

    private async doesInTable(name: string, table: string) {
        if (!['users', 'capes', 'cosmetics'].includes(table)) return console.error(`${new Date().toISOString()}> doesInTable called with ${name}, ${table} !!! this is bad!!`)
        const data = await this.client.execute({
            sql: `SELECT name FROM ${table} WHERE name = ?`,
            args: [ name ],
        }).catch(console.error)
        return (data?.rows?.length ?? 0) > 0
    }

    async doesUser(name: string)  {
        return await this.doesInTable(name, 'users')
    }
    
    async doesCape(name: string)  {
        return await this.doesInTable(name, 'capes')
    }
    
    async doesCosmetic(name: string)  {
        return await this.doesInTable(name, 'cosmetics')
    }

    async makeUser(name: string, uuid: string) {
        if (!name || !uuid) return;
        await this.client.execute({
            sql: 'INSERT INTO users (name, uuid) VALUES (@name, @uuid)',
            args: { name, uuid }
        }).catch((err) => console.error(`${new Date().toISOString()}> Failed to insert ${name} (${uuid}) into db - ${err?.toString?.()}`))
        
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
    
    async getCosmeticImage(name: string) {
        const data = await this.client.execute({
            sql: 'SELECT assetURL FROM cosmetics where name = ?',
            args: [ name ],
        }).catch(console.error)
        return data?.rows?.length ? data.rows[0] : null
    }

    async setCapeName(username: string, cape: string) {
        try {
            await this.client.execute({
                sql: 'UPDATE users SET cape = @cape WHERE name = @username',
                args: { username, cape},
            })
            return true;
        } catch (e: any) {
            console.error(new Date().toISOString() + e.toString() + 'db#setCapeName('+username+','+cape+')')
            return false;
        }
    }
    
    async setCosmetics(username: string, cosmetics: string) {
        try {
            await this.client.execute({
                sql: 'UPDATE users SET cosmetics = @cosmetics WHERE name = @username',
                args: { username, cosmetics},
            })
            return true;
        } catch (e: any) {
            console.error(new Date().toISOString() + e.toString() + 'db#setCosmetics('+username+','+cosmetics+')')
            return false;
        }
    }

    async addCosmetic(cname: string, authorname: string, authoruuid: string, asseturl: string, model: string) {
        try {
            await this.client.execute({
                sql: `INSERT INTO cosmetics (name, authorName, authorUUID, assetURL, model) VALUES (@cname, @authorname, @authoruuid, @asseturl, @model)`,
                args: {
                    cname, authorname, authoruuid, asseturl, model
                }
            })
            return true;
        } catch (e: any) {
            console.error(new Date().toISOString() + e.toString() + `db#addCosmetic(${cname}, ${authorname}, ${authoruuid}, ${asseturl}, ${model})`)
            return false;
        }
    }
    
    async addCape(cname: string, authorname: string, authoruuid: string, asseturl: string) {
        try {
            await this.client.execute({
                sql: `INSERT INTO capes (name, authorName, authorUUID, assetURL) VALUES (@cname, @authorname, @authoruuid, @asseturl)`,
                args: {
                    cname, authorname, authoruuid, asseturl
                }
            })
            return true;
        } catch (e: any) {
            console.error(new Date().toISOString() + e.toString() + `db#addCape(${cname}, ${authorname}, ${authoruuid}, ${asseturl})`)
            return false;
        }
    }

    
}