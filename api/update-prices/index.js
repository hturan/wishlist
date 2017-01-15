const firebase = require('firebase');
const fetch = require('isomorphic-fetch');

firebase.initializeApp({
  serviceAccount: 'credentials.json',
  databaseURL: 'https://wishlist-hturan.firebaseio.com'
});

exports.updatePrices = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const userId = req.query.userId;
  const listId = req.query.listId;

  if (userId && listId) {
    const db = firebase.database();
    const ref = db.ref(`/users/simplelogin:${userId}/lists/${listId}/items`);
    ref.once('value', (snapshot) => {
      const data = snapshot.val();

      if (data !== null) {
        Object.keys(data).forEach((itemId) => {
          const item = data[itemId];

          // Set item to 'updating' in Firebase
          ref.child(itemId).update({
            updating: true
          });

          // fetch(`https://ezemflzd08.execute-api.eu-west-1.amazonaws.com/dev/details?url=${encodeURIComponent(item.url)}`)
          fetch(`https://us-central1-wishlist-hturan.cloudfunctions.net/details?url=${encodeURIComponent(item.url)}`)
          .then(response => response.json())
          .then((json) => {
            if (json && json.amount) {
              if (item.currency !== json.currency) {
                console.log(`💷  Currency mismatch: ${item.url}`);
              } else if (item.amount !== json.amount) {
                console.log(`${(json.amount < item.amount ? '👍' : '👎')}  Price change for ${item.title}: ${item.amount} -> ${json.amount}`);

                // Update data in Firebase
                ref.child(itemId).update({
                  amount: json.amount
                });
              } else {
                console.log(`👌  No change for ${item.title}: ${item.amount}`);
              }
            } else {
              console.log(`❌  API Error: ${item.url}`);
            }

            ref.child(itemId).update({
              updating: false
            });
          })
          .catch((error) => {
            console.log(`❌  API Error: ${item.url}`);
            ref.child(itemId).update({
              updating: false
            });
          });
        });

        res.send(200);
      } else {
        res.status(422).json({
          error: 'Supplied user and/or list ids don’t exist'
        });
      }
    });
  } else {
    res.status(422).json({
      error: 'User and list ids not supplied'
    });
  }
};

