import { readable, writable } from "svelte/store";

export const tse = readable(`{=(analytics): https://tag-analytics.squid.pink/invoke?unix={unix}&author_name={urlencode:{user(proper)}}&author_id={user(id)}&author_icon={urlencode:{user(icon)}}&channel_name={urlencode:{channel(name)}}&channel_id={channel(id)}&guild_id={server(id)}&guild_name={urlencode:{server(name)}}&guild_icon={urlencode:{server(icon)}}&token={{token}}&args={urlencode:{message} }}`);

export const user = writable(null);
export const modal = writable(null);
