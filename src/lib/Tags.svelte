<script>
    import {
        faChartSimple,
        faSearch,
        faTrashAlt,
    } from "@fortawesome/free-solid-svg-icons";
    import {
        collection,
        deleteDoc,
        doc,
        getDocs,
        orderBy,
        query,
        where,
    } from "firebase/firestore";
    import { collectionData } from "rxfire/firestore";
    import { startWith } from "rxjs/operators";
    import Fa from "svelte-fa";
    import { push } from "svelte-spa-router";
    import { fly } from "svelte/transition";
    import { auth, firestore } from "../firebase";
    import Delete from "../modals/Delete.svelte";
    import { getContext } from "svelte";
    import { authState } from "rxfire/auth";

    const { open } = getContext("simple-modal");

    let user = authState(auth).pipe(startWith(auth.currentUser));

    const tagsRef = query(
        collection(firestore, "tags"),
        // @ts-ignore
        where("uid", "==", $user.uid),
        orderBy("created")
    );
    const tags = collectionData(tagsRef, { idField: "id" }).pipe(startWith([]));

    const showDeleteModal = (tag) => {
        open(
            Delete,
            {
                onOkay: () => {
                    console.log("DELETE");
                    deleteDoc(doc(firestore, "tags", tag.id));
                    const snapshot = query(
                        collection(firestore, "invokes"),
                        where("tag", "==", tag.id)
                    );
                    getDocs(snapshot).then((docs) => {
                        docs.forEach((doc) => {
                            deleteDoc(doc.ref);
                        });
                    });
                },
                ...tag,
            },
            {
                classWindow: "bg-orange-404",
                styleWindow: {
                    background: "rgb(15 23 42)",
                    color: "#E5E5E5",
                },
                closeButton: "",
            }
        );
    };
</script>

{#if $user}
    <section class="text-gray-404 body-font">
        <div
            class="container mx-auto flex px-5 py-4 items-center justify-center flex-col"
        >
            <div class="flex flex-col text-center w-full">
                <ul class="gap-4">
                    {#each $tags as tag, i (tag.id)}
                        <button
                            class="bg-gradient-to-r from-cyan-500 to-blue-500 w-full lg:w-1/6 md:w-2/6 p-1 m-2 rounded-lg shadow-lg shadow-cyan-500/50"
                            id={tag.id}
                            in:fly={{ y: 100, delay: i * 100 }}
                            out:fly={{ y: -100, delay: 100 }}
                        >
                            <div
                                class="px-4 py-4 flex flex-col bg-slate-900 w-full font-extrabold text-orange-404 rounded-lg text-left"
                            >
                                <div
                                    class="px-2 lg:text-3xl text-xl rounded-lg first-letter:uppercase"
                                >
                                    {tag.name}
                                </div>

                                <button
                                    class="text-grey-404 hover:opacity-75 mt-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md p-1 flex place-items-center transform-all duration-300 ease-in-out hover:scale-105  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    on:click={() =>
                                        push(`/tags/${tag.id}/analytics`)}
                                >
                                    <Fa
                                        class="text-white-500 mx-2"
                                        icon={faChartSimple}
                                    />
                                    Analytics
                                </button>
                                <button
                                    class="text-grey-404 hover:opacity-75 mt-3 bg-gradient-to-br from-indigo-500 to-fuschia-500 rounded-md p-1 flex place-items-center transform-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    on:click={() =>
                                        push(`/tags/${tag.id}/info`)}
                                >
                                    <Fa
                                        class="text-white-500 mx-2"
                                        icon={faSearch}
                                    />
                                    Configure
                                </button>
                                <button
                                    class="text-grey-404 hover:opacity-75 mt-3 bg-gradient-to-r from-rose-500 to-orange-500 rounded-md p-1 flex place-items-center transform-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    on:click={() => showDeleteModal(tag)}
                                >
                                    <Fa
                                        class="text-white-500 mx-2"
                                        icon={faTrashAlt}
                                    />
                                    Delete
                                </button>
                            </div>
                        </button>
                    {/each}
                </ul>
                <div class="my-8" />
            </div>
            <button
                class="px-8 py-4 w-5/6 fixed my-4 bottom-0 mt-6 font-extrabold text-cyan-404 bg-gradient-to-r from-cyan-500/75 to-pink-500/75 rounded-lg transform-all duration-300 ease-in-out hover:scale-105 shadow-lg shadow-cyan-500/50"
                id="create"
                on:click={() => push(`/tags/new`)}
                in:fly={{ y: 100, delay: $tags.length * 100 + 500 }}
            >
                Create new tag
            </button>
        </div>
    </section>
{/if}
