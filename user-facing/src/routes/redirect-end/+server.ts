import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const GET = async ({ cookies, url, fetch, getClientAddress }) => {
    const token = url.searchParams.get('code')
    if (!token || !token.toString().startsWith('mcauth_')) error(400)

    const resp = await fetch(`https://mc-auth.com/oAuth2/token`, {
        method: 'POST',
        body: JSON.stringify({
            client_id: env.MCAUTH_CLIENTID,
            client_secret: env.MCAUTH_CLIENTSECRET,
            code: token,
            redirect_uri: url.origin + '/redirect-end',
            grant_type: 'authorization_code',
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (!resp.ok) error(403, { message: 'Failed to authenticate'})
    const data = await resp.json().catch(() => error(500, { message: 'Failed to authenticate'}))
    if (!data) error(500, { message: 'Failed to authenticate'})
    
    cookies.set('mc-auth', JSON.stringify({
        uuid: data.data.uuid,
        username: data.data.profile.name,
        bearer: btoa(data.access_token)
    }), {
        path: '/',
        httpOnly: false,
    })

    redirect(302, '/')
}