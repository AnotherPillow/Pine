<script lang="ts">
    import { env } from '$env/dynamic/public';
    import { dev } from '$app/environment';
    import { community_name, backdrop } from '$lib/assets/text.json'
    import '@fontsource-variable/montserrat';
    import '@fontsource-variable/nunito';
    import { onMount } from 'svelte';
    import { Toasts, toast } from 'svoast';
    import readFileContent from '$lib/readFileContent.js';

    export let data;
    // console.log(data)

    const authenticateUser = () => {
        // const redirURL = new URL('')
        // redirURL.searchParams.append('client_id', env.PUBLIC_MCAUTH_CLIENTID)
        // redirURL.searchParams.append('redirect_uri', 'http://localhost:58932/redirect-end')
        // redirURL.searchParams.append('response_type', 'token')

        window.location.href = `https://mc-auth.com/oAuth2/authorize?client_id=${env.PUBLIC_MCAUTH_CLIENTID}&redirect_uri=${window.location.origin + '/redirect-end'}&response_type=code&scope=profile`
    }

    let _capeCanvas: HTMLCanvasElement;
    let _capeCtx: CanvasRenderingContext2D;
    onMount(() => {
        if (!_capeCanvas) return;
        let _ctx = _capeCanvas.getContext("2d");
        if (_ctx) 
            _capeCtx = _ctx;
        else 
            throw new Error("Could not get cape canvas context");

        _capeCtx.imageSmoothingEnabled = false;


        let img = new Image()
        img.src = data.cosmetics?.currentCape.assetURL
        img.onload = () => {
            _capeCtx.drawImage(img, 
                1, 1, 
                10, 16,
                0, 0, 
                80, 128,
            )
        }      
    })


    let _chosenCosmetics = data.cosmetics?.currentCosmetics?.cosmetics ?? ''
    let _chosenCape = structuredClone(data.cosmetics?.currentCape.name.cape ?? '') ?? ''

    const doSubmission = async () => {
        const message = {
            cosmetics: _chosenCosmetics,
            cape: _chosenCape
        }

        toast.info('Attempting to change...')

        const res = await fetch('/change-outfit', {
            body: JSON.stringify(message),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        })

        const status = res.status
        const json = await res.json().catch(toast.error)
        if (status == 200) toast.success('Successfully updated.')
        else if (!json.capeSuccess || !json.cosmeticSuccess) return toast.error('Failed to change cape/cosmetic.')
        else return toast.error('Failed to change: ' + json)

        setTimeout(() => window.location.reload(), 5000)
        

        // console.log(res.status, res.statusText, )
    }

    let _creationUIMode: null | 'cape' | 'cosmetic'
    let _creationUIItemName: string | undefined | null = undefined
    let _creationUIAssetURL: string | undefined | null = undefined
    let _creationUIModelFile: FileList | undefined | null = undefined

    const submitNewItem = async () => {
        if (!_creationUIItemName) return toast.error('You must specify a name!')
        if (!_creationUIAssetURL && _creationUIMode == 'cape') return toast.error('You must specify an asset URL!')
        if (!((_creationUIModelFile?.length ?? -1) > 0) && _creationUIMode == 'cosmetic') return toast.error('You must specify a model file!')
        toast.info('Creating...')

        const res = await fetch('/new-item', {
            body: JSON.stringify({
                type: _creationUIMode,
                name: _creationUIItemName,
                asset: _creationUIAssetURL,
                model: ((_creationUIModelFile?.length ?? -1) > 0) ? await readFileContent(_creationUIModelFile![0]) : undefined,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        })

        const status = res.status
        const json = await res.json().catch(toast.error)

        if (status == 200) {
            //@ts-ignore
            document.querySelector('#newmake')?.close()
            toast.success('Successfully created ' + _creationUIItemName)
        }
        else if (json.error) toast.error('Creation failed ' + json.error)

    }
</script>

<Toasts />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog open={false} id="newmake" on:click={(e) => {if (//@ts-ignore
    e.target.id == 'newmake') {
    _creationUIMode = null
    //@ts-ignore
    document.querySelector('#newmake')?.close()
}}}>
    <div id="newmake-inner">
        <h1>Create a new {_creationUIMode}</h1>
        <div class="flex-break2"></div>
        <label for="new-thing-name-input">New {_creationUIMode} name:</label>
        <input id="new-thing-name-input" type="text" bind:value={_creationUIItemName}>
        <div class="flex-break2"></div>
        <label for="new-thing-asset-input">C{_creationUIMode?.slice(1)} Asset URL {_creationUIMode == 'cosmetic' ? `(leave bank for player texture)` : ''}:</label>
        <input id="new-thing-asset-input" type="text" bind:value={_creationUIAssetURL}>
        <div class="flex-break2"></div>
        {#if _creationUIMode == 'cosmetic'}
            <label for="new-thing-model-input">Cosmetic Model (.cfg file):</label>
            <input id="new-thing-model-input" bind:files={_creationUIModelFile} type="file" accept=".cfg">
            <div class="flex-break2"></div>
        {/if}

        <button type="button" id="new-thing-button" on:click={() => {
            submitNewItem()
        }}>Create</button>
        
    </div>
</dialog>
<main style={`--bg-url: url(` + backdrop + `);`}>
    <div id="container">
        <h1>{community_name}{community_name.endsWith('s') ? "'" : "'s"} <a href="https://github.com/AnotherPillow/Pine" target="_blank">Pine</a> Instance</h1>

        {#if data.loggedIn}
            <div id="user-logged-in-details">
                <img src={`https://minotar.net/helm/${data.authData.username}/100.png`} alt="pfp">
                <h3>Signed in as: {data.authData.username}</h3>
                <a href="/logout" target="_self"><h4 class="material-symbols-outlined">logout</h4></a>
            </div>
            <div id="main-form">

                <div id="cape-showoff" class="showing-off-div">
                    <h2>Cape</h2>
                    <h3>{data.cosmetics?.currentCape.name.cape ?? ''}</h3>
                    <canvas
                        bind:this={_capeCanvas}
                        height={128}
                        width={80}
                        data-original-url={data.cosmetics?.currentCape.assetURL}
                        id="cape-canvas"
                    >Icon.</canvas>
                    <div class="row">
                        <input class="text-input" bind:value={_chosenCape}>
                    </div>
                    <div class="row">
                        <button type="button" id="new-cape-button" on:click={() => {
                            _creationUIMode = 'cape'
                            //@ts-ignore
                            document.querySelector('#newmake')?.showModal()
                        }}>Upload New Cape</button>
                    </div>
                </div>
                
                <div id="cosmetic-showoff" class="showing-off-div">
                    <h2>Cosmetics</h2>
                    <ul id="cosmetics-list">
                        {#each _chosenCosmetics.split(",").filter(//@ts-ignore
                            x => x.trim() != '') as cosmetic}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <li>{cosmetic} <button on:click={() => {
                                //@ts-ignore
                                if (_chosenCosmetics == cosmetic)
                                    _chosenCosmetics = ''
                                else _chosenCosmetics = _chosenCosmetics.replace(","+cosmetic, "")
                            }} class="hidden-button delete-cosmetic" type="button"><span class="material-symbols-outlined">delete</span></button></li>
                        {/each}
                    </ul>
                    <div class="row">
                        <input class="text-input" type="text" placeholder="Add an existing cosmetic" on:keydown={(e) => {
                            
                            /**
                             * @type {KeyboardEvent} wow this is weird
                            */
                            e = e
                            if (e.key == 'Enter')  {
                                //@ts-ignore
                                if (/^[A-Za-z0-9\-_]+$/.test(e.target.value.trim())) {
                                    //@ts-ignore
                                    _chosenCosmetics = _chosenCosmetics + "," + e.target.value.trim()
                                    // console.log(_chosenCosmetics)
                                } else {
                                    toast.error('Invalid cosmetic name!')
                                }
                                
                                //@ts-ignore
                                e.target.value = ''
                                e.preventDefault()
                            }
                        }}>
                    </div>
                    <div class="row">
                        <button type="button" id="new-cosmetic-button" on:click={() => {
                            _creationUIMode = 'cosmetic'
                            //@ts-ignore
                            document.querySelector('#newmake')?.showModal()
                        }}>Upload New Cosmetic</button>
                    </div>
                    
                </div>
                <div class="flex-break" />
                <div class="row">
                    <button id="submit-btn" on:click={doSubmission}>Submit</button>
                </div>
            </div> 
        {:else}
            <button class="hidden-button" id="auth-user-btn" on:click={authenticateUser}>
                <h2>Please sign in to continue.</h2>
            </button>

        {/if}
    </div>
    <span id="info-collection-warning">By <strong>signing in</strong> to {community_name}{community_name.endsWith('s') ? "'" : "'s"} <a href="https://github.com/AnotherPillow/Pine" target="_blank">Pine</a> Instance, your Minecraft username and UUID will be collected as is necessary to function. So will all information collected on this page (images, item names, models) as are also necessary. A salted MD5 hash of your IP address will also be stored for moderation purposes.</span>
</main>

<style lang="scss">
    #newmake {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;

        margin: 0;
        padding: 0;
        overflow:hidden;

        background-color: #22222290;
        
        font-family: 'Montserrat Variable', sans-serif;
        font-weight: 500;

        &:modal {
            max-width: 100vw;
        }

        #newmake-inner {
            width: 80vw;
            min-height: 80vh;
            background-color: #343434;
            border-radius: 1em;

            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;

            h1, label {
                color: whitesmoke;
            }

            input[type="text"] {
                min-width: 4em;
                min-height: 2em;
                
                border-radius: 4px;
                outline: none;
                border: none;
                
                padding: 0.2em;
                margin: 0.2em;

                background-color: #1a1a1a;
                color: white;

                &:hover {
                    filter: brightness(0.8)
                }
            }

            input[type="file"] {
                min-width: 4em;
                min-height: 2em;
                
                border-radius: 4px;
                outline: none;
                border: none;
                
                padding: 0.2em;
                margin: 0.2em;

                color: white;
                cursor: pointer;

                &:hover {
                    filter: brightness(0.8)
                }
            }

            #new-thing-button {
                outline: none;
                width: fit-content;
                padding: 1em;
                border-radius: 8px;
                border: none;
                cursor: pointer;

                background: linear-gradient(to top right, rgb(149, 35, 255), rgb(244, 110, 166));

                &:hover {
                    filter: brightness(0.8);
                }
            }
        }
    }
    .material-symbols-outlined {
        font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24
    }

    main {
        position: absolute;
        inset: 0;

        margin: 0;
        width: 100vw;
        min-height: 100vh;
        
        background-image: var(--bg-url);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        background-attachment: fixed;

        display: grid;
        place-items: center;

        font-family: 'Montserrat Variable', sans-serif;
        font-weight: 500;

        color: white;

        a {
            color: rgb(255, 189, 246);
        }

    }   

    #container {
        width: 80vw;
        min-height: 80vh;

        text-align: center;

        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 1em;
    }

    .hidden-button {
        background: none;
        outline: none;
        font-size: inherit;
        color: inherit;
        border: none;

        cursor: pointer;

        &:hover {
            filter: brightness(0.8);
        }
    }

    #user-logged-in-details {
        width: calc(100% - 6em);
        height: fit-content;
        background-color: rgb(52, 52, 52);
        border-radius: 0.5em;
        padding: 0 2em;
        margin: 1em 1em;
        display: flex;
        justify-content: space-between;
        align-content: center;

        img {
            height: 24px;
            width: 24px;
            margin: auto 0;
        }
        h3 {
            width: 50%;
            margin: auto 0;
        }
        a {
            text-decoration: none;
            color: inherit;

            &:hover {
                filter: brightness(0.8);
            }
        }
    }

    .flex-break {
        flex-basis: 100%;
        height: 2em;
        width: 100%;
        min-width: 100%;
    }
    
    .flex-break2 {
        flex-basis: 100%;
        width: 90vw;
    }

    #main-form {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        
        .row {
            width: 100%;
            height: fit-content;
        }
        
        .showing-off-div {
            width: 45%;
    
            background-color: rgb(42, 42, 42);
            border-radius: 1em;

            margin: 0 0.5em;

            .text-input {
                background-color: #1a1a1a;
                outline: none;
                border: none;
                color: white;
                border-radius: 4px;
                padding: 5px;
                margin: 2px;

                &:hover {
                    filter: brightness(0.8);
                    color: rgb(177, 114, 208);
                }
            }
            #new-cape-button, #new-cosmetic-button {
                background-color: #1a1a1a;
                outline: none;
                border: none;
                color: white;
                border-radius: 4px;
                padding: 5px;
                margin: 2px;

                cursor: pointer;
                
                &:hover {
                    filter: brightness(0.8);
                    color: rgb(177, 114, 208);
                }
            }
        }

        #submit-btn {
            outline: none;
            width: fit-content;
            padding: 1em;
            border: 2px solid rgba(80, 80, 80, 0.442);
            border-radius: 4px;
            cursor: pointer;

            background: linear-gradient(to bottom right, rgb(255, 132, 0), rgb(255, 103, 217));

            &:hover {
                filter: brightness(0.8);
            }
        }
    }

    .delete-cosmetic {
        color: rgb(177, 114, 208);

    }

    span.material-symbols-outlined  {
        vertical-align: bottom;
    }

    :global(.svoast-container) {
        font-family: 'Nunito Variable', sans-serif;
        font-weight: 600;
    }   

    :global(.svoast-container .svoast-wrapper) {
        transform-origin: bottom right !important;
    }

    :global(.svoast-container[data-position*="-left"][class*="svelte-"]) {
        left: auto !important;
        right: 0 !important;
        align-items: flex-end !important;

        top: auto !important;
        bottom: 2em !important;
    }

    #info-collection-warning {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 10px;
    }
</style>