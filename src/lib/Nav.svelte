<script>
    import { fly } from "svelte/transition";
    import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
    import { authState } from "rxfire/auth";
    import Fa from "svelte-fa";
    import { push, location } from "svelte-spa-router";

    import { auth } from "../firebase";
    let user = authState(auth);
</script>

<nav class="flex items-center justify-between flex-wrap px-6 py-1">
    {#if $location != "/"}
        <div class="block lg:hidden" in:fly={{ y: -100, delay: 1000 }}>
            <button
                class="flex items-center px-3 py-2 border rounded mt-2 fixed z-50 opacity-75 hover:opacity-100 text-orange-404 border-orange-404 hover:text-white"
                on:click={() => {
                    push("/");
                }}
            >
                <Fa class="text-orange-404" icon={faArrowLeftLong} />
            </button>
        </div>
    {/if}
    <div
        class="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 bg-blue-404/50 z-20"
    >
        <div class="text-sm lg:flex-grow">
            <a
                href="#/"
                class="block mt-4 lg:inline-block lg:mt-0 text-orange-404 mr-4 hover:scale-105 hover:-translate-y-1 p-2 rounded-lg text-xl transition-all duration-500 ease-in-out"
            >
                Tags
            </a>
            <a
                href="https://github.com/Squidtoon99/tag-analytics"
                class="block mt-4 lg:inline-block lg:mt-0 text-orange-404 hover:scale-105 hover:-translate-y-1 p-2 rounded-lg text-xl transition-all duration-500 ease-in-out"
            >
                Github
            </a>
        </div>
        {#if $user}
            <div>
                <button
                    on:click={() => auth.signOut()}
                    class="inline-block text-sm px-4 py-2 leading-none border rounded text-orange-404 border-orange-404 hover:border-transparent hover:text-white hover:bg-orange-404/90 mt-4 lg:mt-0"
                >
                    Logout
                </button>
            </div>
        {/if}
    </div>
</nav>
