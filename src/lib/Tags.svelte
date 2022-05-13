<script>
    import { auth, firestore } from "../firebase";
    import { collection, orderBy, query, where } from "firebase/firestore";
    import { startWith } from "rxjs/operators";
    import { collectionData } from "rxfire/firestore";
    import { fly } from "svelte/transition";
    import { push } from "svelte-spa-router";

    let user = auth.currentUser;

    const tagsRef = query(
        collection(firestore, "tags"),
        // @ts-ignore
        where("uid", "==", user.uid),
        orderBy("created")
    );
    const tags = collectionData(tagsRef, { idField: "id" }).pipe(startWith([]));
</script>

{#if user}
    <section class="text-gray-404 body-font">
        <div
            class="container mx-auto flex px-5 py-4 items-center justify-center flex-col"
        >
            <div class="flex flex-col text-center w-full">
                <h1
                    class="sm:text-3xl text-2xl font-medium title-font mb-4 text-grey-404"
                >
                    Tags for {user.displayName}
                </h1>
                <ul class="gap-4">
                    {#each $tags as tag, i}
                        <button
                            class="px-8 py-4 lg:w-1/6 m-2 font-extrabold text-orange-404 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transform-all duration-300 ease-in-out hover:scale-110 shadow-lg shadow-cyan-500/50"
                            id={tag.id}
                            on:click={() => push(`/tags/${tag.id}`)}
                            in:fly={{ y: 100, delay: i * 100 }}
                        >
                            {tag.name}
                        </button>
                    {/each}
                </ul>
            </div>
            <button
                class="px-8 py-4 w-5/6 fixed my-4 bottom-0 mt-6 font-extrabold text-cyan-404 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg transform-all duration-300 ease-in-out hover:scale-105 shadow-lg shadow-cyan-500/50"
                id="create"
                on:click={() => push(`/tags/new`)}
                in:fly={{ y: 100, delay: $tags.length * 100 }}
            >
                Create new tag
            </button>
        </div>
    </section>
{/if}
