const admin = require("firebase-admin")

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const firestore = admin.firestore();

module.exports = {firestore}
