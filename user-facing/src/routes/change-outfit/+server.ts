import Database from "$lib/db"
import { error, json } from "@sveltejs/kit"

const nullish = (x: any) => {
    if (x == null || x == undefined) return true
    if (x == '') return false
    return !x
}

export const POST = async ({ cookies, url, fetch, request }) => {
    const data = await request.json();

    if ((nullish(data.cape) || nullish(data.cosmetics) || typeof data.cosmetics != 'string') && Object.keys(data).length == 2) return error(400, {message: 'Invalid request.'})
    if (!/^[A-Za-z0-9\-_]+$/.test(data.cape)) return error(400, {message: 'Invalid request.'})
    
    if (data.cosmetics.startsWith(',')) data.cosmetics = data.cosmetics.slice(1)
    if (!/^([A-Za-z0-9\-_]+\,?)+$/.test(data.cosmetics)) return error(400, {message: 'Invalid request.'})
    
    const auth = cookies.get('mc-auth') 
    if (!auth) return error(403, { message: 'No authentication.'})
    
        let parsedAuth = undefined
    try { parsedAuth = JSON.parse(auth) } catch { return error(500, { message: 'Unparseable authentication.'}) }

    const isCorrect = await fetch('https://mc-auth.com/api/v2/profile', {
        headers: {
            'Authorization': 'Bearer ' + atob(parsedAuth.bearer)
        }
    })
    // console.log(isCorrect.status, atob(parsedAuth.bearer), await isCorrect.text())
    if (isCorrect.status != 200) return error(401, 'Incorrect bearer.')
    const correctJson = await isCorrect.json().catch(() => error(500, 'Failed to authenticate.'))
    // console.log(correctJson.id, parsedAuth.id)
    if (correctJson.id != parsedAuth.uuid) return error(401, 'Incorrect bearer.')

    
        
    const db = new Database()

    const capeSuccess = db.setCapeName(correctJson.name, data.cape)
    const cosmeticSuccess = db.setCosmetics(correctJson.name, data.cosmetics)

    return json({
        capeSuccess: capeSuccess,
        cosmeticSuccess: cosmeticSuccess,
    })
}