const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
let cache = [];
const src = "https://cdn.discordapp.com/emojis/880113406915538995.webp?size=80&quality=lossless";

exports.invoke = functions.https.onRequest(async (req, res) => {

    const {
        author_name, author_id, author_icon,
        channel_name, channel_id,
        guild_name, guild_id, guild_icon,
        args, token, unix
    } = req.query;

    if (Math.abs(Math.floor(Date.now() / 1000) - unix) >= 5) {
        console.log("Token expired");
        return res.redirect(src);
    }


    let key = `${token}:${unix}:${channel_id}`;
    if (cache.includes(key)) {
        console.log("Already cached");
        return res.redirect(src);
    } else {
        cache = cache.filter(x => new Date().getTime() - x.split(":")[1] < 60);
        cache.push(key);
        console.log("Cached");
    }



    // validation 
    if (!author_name || !author_id || !author_icon || !channel_name || !channel_id || !guild_name || !guild_id || !guild_icon || !args || !token) {
        console.log("Missing required fields");
        return res.redirect(src);

    }
    if (/[^a-zA-Z0-9_]/.test(token)) {
        console.log("Invalid token");
        return res.redirect(src);
    }

    // Check that all ids are numbers 
    if (!/^\d+$/.test(author_id) || !/^\d+$/.test(channel_id) || !/^\d+$/.test(guild_id)) {
        console.log("Invalid id");
        return res.redirect(src);
    }

    console.log(token);
    const tag = await admin.firestore().collection("tags").doc(token).get();
    console.log(tag.data());
    if (!tag.exists) {
        console.log("Tag not found");
        return res.redirect(src);
    }

    const data = {
        author_name, author_id, author_icon,
        channel_name, channel_id,
        guild_name, guild_id, guild_icon,
        args: args.trimEnd(),
        uid: tag.data().uid,
        tag: token,
        timestamp: Date.now()
    };

    await admin.firestore().collection("invokes").add(data);
    res.redirect(src);
});