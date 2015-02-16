## Wishlist
A React-fronted and Firebase-backed wishlist.

![](http://i.imgur.com/l4YtEAJ.png)

> NOTE: This project is mostly a sandbox for playing with React features and ideas. Whilst it works, it should by no means be used as an example of a well-factored React app. If you want to get this up and running, change the `firebaseEndpoint` global to point at your personal Firebase.

### Data Structure
Data is stored in Firebase in the following format:

```json
{
  "users" : {
      "[USER_ID]" : {
        "lists" : {
          "[LIST_ID]" : {
            "items" : {
              "[ITEM_ID]" : {
                "title": "My item",
                "url": "http://amazon.com",
                "amount": 19.99,
                "currency": "$"
              }
            }
          }
        }
      }
    }
  }
}
```

At some point in the not-so-distant future, I’d like to de-normalize the data structure into the following:

```json
{
  "users": {
    "[USER_ID]": {
      "lists": {
        "[LIST_ID]": true
      }
    }
  },
  "lists": {
    "[LIST_ID]": {
      "title": "Music",
      "items": {
        "[ITEM_ID]": true,
        "[ITEM_ID]": true,
        "[ITEM_ID]": true
      }
    }
  },
  "items": {
    "[ITEM_ID]" : {
      "title": "My item",
      "url": "http://amazon.com",
      "amount": 19.99,
      "currency": "$"
    }
  }      
}
```

### To Do
✔ ~~Editable items~~

✘ Actually usable editable items

✘ Sorting

✘ Domain visualisation (hostname, favicons)

✘ Project refactor (separate components, remove jQuery, etc)

✘ Firebase de-normalization

✘ Build tools (SASS, remove JSXTransformer)
