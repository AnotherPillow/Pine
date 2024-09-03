import 'dotenv/config'

import express from 'express'
import Database from './src/db'
const app = express()

const db = new Database()

// app.get('*', (req, res) => {
//     console.log({
//         url: req.hostname + req.url,
//         body: req.body
//     })

//     // res.sendStatus(404)
// })


app.get('/users/:username', async (req, res) => {
    console.log(`/users/${req.params.username}`)
    const name = req.params.username.replace('.cfg', '')
    if (!name) return res.status(404);
    const cosmetics = await db.getCosmeticsForUser(name)
    if (!cosmetics || !cosmetics?.cosmetics) return res.status(404);
    
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
    
    if (!name) return res.status(404);
    const capeName = await db.getCapeForUser(name)
    if (!capeName || !capeName?.cape) return res.status(404);
    
    const cape = await db.getCapeImage(capeName.cape.toString())
    if (!cape || !cape?.assetURL) return res.status(404);

    return res.redirect(302, cape.assetURL as string)
})

app.get('/items/:name/model.cfg', async (req, res) => {
    console.log(`/items/${req.params.name}/model.cfg`)
    
    const { name } = req.params
    
    if (!name) return res.status(404);
    const model = await db.getCosmeticModel(name)
    if (!model || !model?.model) return res.status(404);

    console.log(model.model)

    return res.status(200).send(JSON.stringify(model.model, null, 4).trim())
    
})

app.get('/items/:name/users/:user', (req, res) => {
    const { name, user } = req.params
    console.log(`/items/${name}/users/${user}`)
    res.status(200).sendFile(__dirname + '/assets/tail.png')
})

app.listen(80, 's.optifine.net')