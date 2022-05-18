<script>
    import { fly } from "svelte/transition";
    import { doc } from "firebase/firestore";
    import { docData } from "rxfire/firestore";

    import { auth, firestore } from "../firebase";
    import { tse } from "./stores";
    import Fa from "svelte-fa";
    import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
    import Footer from "./Footer.svelte";

    export let params;

    const user = auth.currentUser;

    const { id } = params;

    const tagRef = doc(firestore, `tags`, id);

    const tag = docData(tagRef, { idField: "id" });
</script>

{#if user && $tag}
    <section
        class="text-gray-404 body-font"
        in:fly={{ y: 100, delay: 500, duration: 500 }}
    >
        <div
            class="container mx-auto flex px-5 py-4 items-center justify-center flex-col"
        >
            <div
                class="flex flex-col lg:w-5/6 text-center w-full bg-slate-900 lg:px-4 px-2 py-1 rounded-lg"
            >
                <h1
                    class="sm:text-4xl text-2xl font-medium title-font mb-4 mt-2 text-orange-404"
                >
                    {$tag.name}
                </h1>
            </div>
            <div class="bg-slate-900 lg:w-5/6 rounded-lg py-2 px-6 pb-6 my-4">
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
                        You can put the {"{analytics}"} variable in any image in
                        the output as long as it is sent by carl
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
                        class="text-md font-medium text-orange-404 bg-black rounded-lg p-2"
                    >
                        {$tse.replace("{{token}}", $tag.id)}
                    </p>
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
        </div>
        <Footer />
    </section>
{/if}
