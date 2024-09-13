import Database from "$lib/db"
import { error, json } from "@sveltejs/kit"

const nullish = (x: any) => {
    if (x == null || x == undefined) return true
    if (x == '') return false
    return !x
}

export const POST = async ({ cookies, url, fetch, request }) => {
    const data = await request.json();

    const { type, name, asset, model } = data as {
        type: 'cape' | 'cosmetic',
        name: string,
        asset: string | undefined,
        model: string | undefined
    }
    
    if (!['cape', 'cosmetic'].includes(type)) return json({
        error: 'Invalid Type'
    }, {status: 400})
    
    if (nullish(name) || !/[a-z0-9]/.test(name)) return json({
        error: 'Invalid name'
    }, {status: 400})
    
    if (nullish(asset) && type == 'cape') return json({
        error: 'Missing asset'
    }, {status: 400})
    
    if (nullish(model) && type == 'cosmetic') return json({
        error: 'Missing model'
    }, {status: 400})

    
    const auth = cookies.get('mc-auth') 
    if (!auth) return error(403, { message: 'No authentication.'})

    let parsedAuth = undefined
    try { parsedAuth = JSON.parse(auth) } catch { return error(500, { message: 'Unparseable authentication.'}) }

    const isCorrect = await fetch('https://mc-auth.com/api/v2/profile', {
        headers: {
            'Authorization': 'Bearer ' + atob(parsedAuth.bearer)
        }
    })
    if (isCorrect.status != 200) return error(401, 'Incorrect bearer.')
    const correctJson = await isCorrect.json().catch(() => error(500, 'Failed to authenticate.'))
    if (correctJson.id != parsedAuth.uuid) return error(401, 'Incorrect bearer.')

    const { username, uuid } = parsedAuth;
        
    const db = new Database()

    if (type == 'cape') {
        if (await db.doesCape(name)) return json({
            error: 'Cape already exists.'
        }, {status: 406})

        if (await db.addCape(name, username, uuid, asset!)) {
            return json({}, { status: 200})
        } else {
            return json({ error: 'Failed to make cosmetic.'}, { status: 500 })
        }
    } else if (type  == 'cosmetic') {
        if (await db.doesCosmetic(name)) return json({
            error: 'Cosmetic already exists.'
        }, {status: 406})

        if (await db.addCosmetic(name, username, uuid, asset! ?? null, model!)) {
            return json({}, { status: 200})
        } else {
            return json({ error: 'Failed to make cosmetic.'}, { status: 500 })
        }

    } 
    return error(400, 'how did you do that??')
}