<script>
  import "./lib/Tailwind.css";
  import Router from "svelte-spa-router";

  import { auth, provider } from "./firebase";

  import { authState } from "rxfire/auth";

  import Tags from "./lib/Tags.svelte";
  import NewTag from "./lib/NewTag.svelte";
  import { signInWithPopup } from "firebase/auth";
  import Tag from "./lib/Tag.svelte";

  let user;
  $: console.log(user?.uid);
  authState(auth).subscribe((u) => (user = u));
  const login = () => signInWithPopup(auth, provider);

  let routes = {
    "/": Tags,
    "/tags/new": NewTag,
    "/tags/:id": Tag,
  };
</script>

{#if user}
  <Router {routes} />
{:else}
  <section class="text-grey-404 body-font">
    <div
      class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
    >
      <div class="flex flex-col text-center w-full mb-12">
        <h1
          class="sm:text-3xl text-2xl font-medium title-font mb-4 text-blu-404"
        >
          <button on:click={login} class="underline text-orange-404"
            >Sign in</button
          >
          to manage tags
        </h1>
      </div>
    </div>
  </section>
{/if}

<style>
  :global(body) {
    @apply text-grey-404 bg-blue-404;
  }
</style>
