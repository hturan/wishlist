const firebase = require("firebase");
const fetch = require("isomorphic-fetch");

firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://wishlist-hturan.firebaseio.com"
});

const userId = process.argv[2];
const listId = process.argv[3];

const db = firebase.database();
const ref = db.ref(`/users/simplelogin:${userId}/lists/${listId}/items`);
ref.once("value", function(snapshot) {
  const data = snapshot.val();

  Object.keys(data).forEach(itemId => {
    const item = data[itemId];

    fetch(`https://ezemflzd08.execute-api.eu-west-1.amazonaws.com/dev/details?url=${encodeURIComponent(item.url)}`)
    .then(response => response.json())
    .then(json => {
      if (json) {
        if (item.amount !== json.amount) {
          console.log(`${(json.amount < item.amount ? '👍' : '👎')}  Price change for ${item.title}: ${item.amount} -> ${json.amount}`);
          
          // Update data in Firebase
          ref.child(itemId).update({
            amount: json.amount
          });
        } else {
          console.log(`No change for ${item.title}: ${item.amount}`)
        }
      } else {
        console.log(`❌  API Error: ${item.url}`);
      }
    });
  })
});
