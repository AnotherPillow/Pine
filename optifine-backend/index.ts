import 'dotenv/config'

import express from 'express'
import Database from './src/db'
import path from 'path'
import { Readable } from 'node:stream'
const app = express()

const db = new Database()

// app.get('*', (req, res) => {
//     console.log({
//         url: req.hostname + req.url,
//         body: req.body
//     })

//     // res.sendStatus(404)
// })

const forwardURL = process.env.FORWARDING_HOST!

app.get('/users/:username', async (req, res) => {
    console.log(req.path)
    const name = req.params.username.replace('.cfg', '')
    if (!name) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    const cosmetics = await db.getCosmeticsForUser(name)
    if (!cosmetics || !cosmetics?.cosmetics) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    
    const built = {
        items: cosmetics.cosmetics.toString().split(',').map(e => Object({
            type: e,
            active: true
        }))
    }
    return res.status(200).send(JSON.stringify(built, null, 4).trim())
})

app.get('/capes/:username', async (req, res) => {
    console.log(`/capes/${req.params.username}`)
    const name = req.params.username.replace('.png', '')
    
    if (!name) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    const capeName = await db.getCapeForUser(name)
    if (!capeName || !capeName?.cape) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    
    const cape = await db.getCapeImage(capeName.cape.toString())
    if (!cape || !cape?.assetURL) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);

    return res.redirect(302, cape.assetURL as string)
})

app.get('/items/:name/model.cfg', async (req, res) => {
    console.log(`/items/${req.params.name}/model.cfg`)
    
    const { name } = req.params
    
    if (!name) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    const model = await db.getCosmeticModel(name)
    if (!model || !model?.model) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);

    console.log(model.model)

    return res.status(200).send(model.model.toString().trim())
    
})

app.get('/items/:name/users/:user', async (req, res) => {
    const { name, user } = req.params
    console.log(`/items/${name}/users/${user}`)
    
    const img = await db.getCosmeticImage(name)
    if (!img || !img?.assetURL) return forwardURL ? 
        res.redirect(302, forwardURL + req.path) : res.status(404);
    console.log(img)

    // return res.redirect(302, img.assetURL as string)
    // return res.redirect(302, 'https://cdn.nest.rip/uploads/f7459e5d-9d58-4179-b14f-78a1ef5b2fbf.png')
    // res.status(200).sendFile(path.join(__dirname, "..", "assets/tail.png"))
    // res.status(200).sendFile(__dirname + '/../assets/tail.png')

    // I DONT KNOW WHY THIS IS NECESSARY. HGNGNGHGGNNGNGNGHGHGNG. BUT IT WORKS SO :SHRUG:
    const response = await fetch(img.assetURL.toString());
    if (!response.ok) return res.status(500)
    res.setHeader('Content-Type', response?.headers?.get('content-type') as any);
    const nodeReadableStream = Readable.fromWeb(response.body as any);
    nodeReadableStream.pipe(res);



})

app.listen(80, 's.optifine.net')