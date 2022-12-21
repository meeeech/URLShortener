const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { ShortURL } = require("./shortURL");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Methods

const shorten = functions.https.onRequest(async (req, res) => {
  if (req.method.toLowerCase() !== "post") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    // Grab long URL from req body 
    const longURL = JSON.parse(req.body).long;

    // Update link count in database
    const linkCountRef = db.collection("link_count").doc("count");
    await linkCountRef.update({ count: FieldValue.increment(1)});

    // Create new link id = new link count
    const newLinkId = await (await linkCountRef.get()).data().count;

    // Create short URL from new link id 
    const shortURL = ShortURL.encode(newLinkId);

    // Update links db table with new entry 
    await db
      .collection("links")
      .doc(newLinkId.toString())
      .set({
        long: longURL, 
        short: shortURL
      });

    // Send OK response with short URL
    res.status(200).send(`dd-url.web.app/${shortURL}`);
  } catch(error) {
    res.status(500).send(error.message);
  }
});

const restore = functions.https.onRequest(async (req, res) => {
  // Check if there is a valid short URL in the database
  const snap = await db
    .collection("links")
    .where("short", "==", req.path.split("/")[1])
    .get()
    .catch((e) => console.error(e));

  // Redirect to long URL or 404
  if (!snap || snap.size === 0) {
    res.status(404).send("Invalid short link");
  } else {
    res.redirect(snap.docs[0].data().long);
  }
});

module.exports = { shorten, restore };
