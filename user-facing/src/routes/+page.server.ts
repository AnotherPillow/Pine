import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/db";
import { createHash } from 'node:crypto';
import { env } from "$env/dynamic/private";

export const load: PageServerLoad = async ({ cookies, getClientAddress }): Promise<{ loggedIn: boolean; authData: any; cosmetics?: { currentCape: any; currentCosmetics: any; }; }> => {
    const auth = cookies.get('mc-auth')

    if (auth) {
        let parsed = null
        try {
            parsed = JSON.parse(auth)
        } catch(e) {}
        if (!parsed) {
            cookies.delete('mc-auth', {
                path: '/',
                httpOnly: false,  
            })
            error(500)
        }
        
        if (!env.IP_SALT || env.IP_SALT?.toString().length < 6) {
            console.error('SALT IS NOT SET OR IS TOO SHORT. EXITING.')
            return error(500)
        }
    
        const ip = getClientAddress()
        const hash = createHash('md5').update(env.IP_SALT + ip).digest('hex')
        
        const db = new Database()
        if (!(await db.doesUser(parsed.username))) {
            // console.log('New username/uuid ' + parsed.uuid)
            db.makeUser(parsed.username, parsed.uuid, hash)
        }

        const currentCosmetics = await db.getCosmeticsForUser(parsed.username)
        
        let cape = undefined;
        const capeName = await db.getCapeForUser(parsed.username)
        if (capeName && capeName?.cape) {
            cape = await db.getCapeImage(capeName.cape.toString()) as any
            if (!cape || !cape?.assetURL) cape = undefined
        }
        
        

        return {
            loggedIn: true,
            authData: parsed,
            cosmetics: {
                currentCape: {assetURL: cape?.assetURL ?? '', name: capeName ?? ''}, currentCosmetics
            }
        }
    }
    return {
        loggedIn: false,
        authData: null
    }
}