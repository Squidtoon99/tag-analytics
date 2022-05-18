<script>
    import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

    import { addDoc, collection } from "firebase/firestore";
    import Fa from "svelte-fa";
    import { push } from "svelte-spa-router";
    import { fly } from "svelte/transition";
    import { auth, firestore } from "../firebase";
    import { tse } from "./stores";
    let user = auth.currentUser;

    let state = 0;

    let data = {
        name: "",
    };

    let token;

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

    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand("copy");
            var msg = successful ? "successful" : "unsuccessful";
            console.log("Fallback: Copying text command was " + msg);
        } catch (err) {
            console.error("Fallback: Oops, unable to copy", err);
        }

        document.body.removeChild(textArea);
    }
    function copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(
            function () {
                console.log("Async: Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Async: Could not copy text: ", err);
            }
        );
    }
</script>

{#if user}
    <section class="text-grey-404 body-font">
        <div
            class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
        >
            <div
                class="bg-slate-900 w-full lg:w-5/6 rounded-lg py-2 px-6 pb-6"
                in:fly={{ y: 100, delay: 500 }}
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
                                class="focus:ring-indigo-500 text-black bg-grey-404 focus:border-indigo-500 block flex-grow px-2 py-1 sm:text-sm border-gray-300 rounded-md disabled:bg-slate-800 disabled:text-white/75"
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
                    class="bg-slate-900 lg:w-5/6 rounded-lg py-2 px-6 pb-6 my-4"
                    in:fly={{ y: 100, delay: 500 }}
                >
                    <div class="flex flex-col text-center w-full lg:mb-4 m-1">
                        <h1
                            class="sm:text-3xl text-2xl font-medium title-font text-grey-404"
                        >
                            Setup Tag
                        </h1>
                    </div>
                    <div class="flex mb-6">
                        <div
                            class="flex flex-wrap rounded-md border border-blue-500 text-blue-500 p-2 w-full m-2"
                        >
                            <Fa class="m-1" icon={faInfoCircle} />
                            You can put the {"{analytics}"} variable in any image
                            in the output as long as it is sent by carl
                        </div>
                    </div>
                    <div class="flex">
                        <label
                            for="tse"
                            class="block text-md py-1 font-medium text-white/75 mx-4 align-middle"
                            >Add this tagscript to your carl-bot tag in the
                            dashboard</label
                        >
                    </div>

                    <div class="flex flex-col text-center w-full mb-4">
                        <p
                            class="text-md font-medium text-orange-404 bg-slate-900/75 border border-orange-404 rounded-lg p-2"
                        >
                            {$tse.replace("{{token}}", token)}
                        </p>
                        <button
                            on:click={() => {
                                copyTextToClipboard(
                                    $tse.replace("{{token}}", token)
                                );
                            }}
                            class="bg-orange-404/75 p-2 mt-2 rounded-lg hover:-translate-y-1 hover:opacity-50 transition-all duration-300 ease-in-out"
                            >Copy TagScript</button
                        >
                    </div>

                    <h2 class="text-md ml-2 px-1 mt-4 m-1 text-white/75">
                        This is how it should look like
                    </h2>
                    <div class="flex flex-col text-center w-full mb-4">
                        <img
                            src="/tutorial1.png"
                            class="w-full"
                            alt="instructions #1"
                        />
                        <img
                            src="/tutorial2.png"
                            class="w-full"
                            alt="instructions #2"
                        />
                    </div>
                </div>
                <div>
                    {#if state === 1}
                        <button
                            disabled={state !== 1}
                            on:click={() => push(`/tags/${token}/analytics`)}
                            class="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                        >
                            Enter Tag Dashboard
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    </section>
{/if}
