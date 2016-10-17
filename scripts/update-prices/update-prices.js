const firebase = require('firebase');
const fetch = require('isomorphic-fetch');
const inquirer = require('inquirer');

firebase.initializeApp({
  serviceAccount: "../credentials.json",
  databaseURL: "https://wishlist-hturan.firebaseio.com"
});

const userId = process.argv[2];

const db = firebase.database();
const ref = db.ref(`/users/simplelogin:${userId}/lists`);
ref.once('value', snapshot => {
  const data = snapshot.val();

  const choices = [];
  Object.keys(data).forEach(listId => {
    choices.push({
      name: data[listId].title,
      value: listId
    })
  });

  inquirer.prompt([
    {
      type: 'list',
      name: 'list',
      message: 'What should I check prices for?',
      choices: choices
    }
  ]).then(answers => {
    ref.child(`${answers['list']}/items`).once('value', snapshot => {
      const data = snapshot.val();

      Object.keys(data).forEach(itemId => {
        const item = data[itemId];

        fetch(`https://ezemflzd08.execute-api.eu-west-1.amazonaws.com/dev/details?url=${encodeURIComponent(item.url)}`)
        .then(response => response.json())
        .then(json => {
          if (json && json.amount) {
            if (item.currency !== json.currency) {
              console.log(`💷  Currency mismatch: ${item.url}`);
            } else {
              if (item.amount !== json.amount) {
                console.log(`${(json.amount < item.amount ? '👍' : '👎')}  Price change for ${item.title}: ${item.amount} -> ${json.amount}`);
                
                // Update data in Firebase
                ref.child(`${answers['list']}/items/${itemId}`).update({
                  amount: json.amount
                });
              } else {
                console.log(`👌  No change for ${item.title}: ${item.amount}`)
              }
            }
          } else {
            console.log(`❌  API Error: ${item.url}`);
          }
        });
      });
    })
  })
});
