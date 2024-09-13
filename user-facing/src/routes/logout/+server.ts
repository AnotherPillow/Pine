import { error, json, redirect } from "@sveltejs/kit"

export const GET = async ({ cookies  }) => {
    cookies.delete('mc-auth', {
        path: '/',
        httpOnly: false,  
    })

    return redirect(302, '/')
}

