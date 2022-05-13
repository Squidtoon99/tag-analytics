<script>
    import { addDoc, collection } from "firebase/firestore";
    import { push } from "svelte-spa-router";
    import { fly } from "svelte/transition";
    import { auth, firestore } from "../firebase";
    let user = auth.currentUser;

    let state = 0;

    let data = {
        name: "",
    };
    let tse;

    let token;
    $: tse = `{=(analytics): https://analytics.squid.pink/invoke?unix={unix}&author_name={urlencode:{user(proper)}}&author_id={user(id)}&author_icon={urlencode:{user(icon)}}&channel_name={urlencode:{channel(name)}}&channel_id={channel(id)}&guild_id={server(id)}&guild_name={urlencode:{server(name)}}&guild_icon={urlencode:{server(icon)}}&token=${token}&args={urlencode:{message} }}`;

    const submit = async () => {
        state++;
        let doc = await addDoc(collection(firestore, "tags"), {
            uid: user.uid,
            slug: data.name.toLowerCase().replace(/\s/g, "-"),
            name: data.name,
            created: Date.now(),
        });
        token = doc.id;
    };
</script>

{#if user}
    <section class="text-grey-404 body-font">
        <div
            class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
        >
            <div
                class="bg-slate-900 w-5/6 rounded-lg py-2 px-6 pb-6"
                in:fly={{ y: 100 }}
            >
                <div class="flex flex-col text-center w-full mb-4">
                    <h1
                        class="sm:text-3xl text-2xl font-medium title-font text-grey-404"
                    >
                        Tag Creator
                    </h1>
                </div>
                <form on:submit|preventDefault={submit}>
                    <div class="flex">
                        <label
                            for="price"
                            class="block text-sm py-1 font-medium text-white/75 mx-4 align-middle"
                            >Name</label
                        >
                        <div class="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                name="price"
                                id="price"
                                class="focus:ring-indigo-500 text-black bg-grey-404 focus:border-indigo-500 block flex-grow px-2 py-1 sm:text-sm border-gray-300 rounded-md"
                                bind:value={data.name}
                                disabled={state !== 0}
                            />
                        </div>
                    </div>
                    {#if state === 0}
                        <button
                            type="submit"
                            disabled={state !== 0}
                            out:fly
                            class="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                        >
                            Create Token
                        </button>
                    {/if}
                </form>
            </div>
            {#if state >= 1 && token}
                <div
                    class="bg-slate-900 w-5/6 rounded-lg py-2 px-6 pb-6 my-4"
                    in:fly={{ y: 100, delay: 300, duration: 500 }}
                >
                    <div class="flex flex-col text-center w-full mb-4">
                        <h1
                            class="sm:text-3xl text-2xl font-medium title-font text-grey-404"
                        >
                            Setup Tag
                        </h1>
                    </div>
                    <!-- Create a box showing the tse variable -->
                    <div class="flex">
                        <label
                            for="tse"
                            class="block text-sm py-1 font-medium text-white/75 mx-4 align-middle"
                            >Add this tagscript to your carl-bot tag in the
                            dashboard</label
                        >
                    </div>

                    <div class="flex flex-col text-center w-full mb-4">
                        <p
                            class="text-md font-medium text-orange-404 bg-black rounded-lg p-2"
                        >
                            {tse}
                        </p>
                    </div>
                    <div class="flex flex-col text-center w-full mb-4">
                        <img
                            src="/tutorial.png"
                            class="w-full"
                            alt="instructions"
                        />
                    </div>

                    <div>
                        {#if state === 1}
                            <button
                                disabled={state !== 1}
                                out:fly
                                on:click={() => push("/tags/" + token)}
                                class="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                            >
                                Enter Tag Dashboard
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </section>
{/if}
