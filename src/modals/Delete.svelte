<script>
    import { getContext } from "svelte";
    export let name;
    export let onCancel = (/** @type {any} */ _) => {};
    export let onOkay = (/** @type {any} */ _) => {};

    const { close } = getContext("simple-modal");

    let value;
    let onChange = (/** @type {any} */ _) => {};

    function _onCancel() {
        onCancel();
        close();
    }

    function _onOkay() {
        onOkay(value);
        close();
    }

    $: onChange(value);
</script>

<div class="p-1">
    <h2 class="px-2 mb-4">Do you want to delete {name}?</h2>

    <div class="flex justify-between">
        <button
            class="bg-orange-404 flex rounded-lg p-2 text-xl"
            on:click={_onCancel}
        >
            Cancel
        </button>
        <button
            class="bg-rose-500 flex rounded-lg p-2 text-xl"
            on:click={_onOkay}
        >
            Delete
        </button>
    </div>
</div>

<style>
    h2 {
        font-size: 2rem;
        text-align: center;
    }
</style>
