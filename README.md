## Wishlist
A React-fronted and Firebase-backed wishlist.

![](http://i.imgur.com/l4YtEAJ.png)

### Data Storage
We use Firebase as the single app state atom. The main `App` component is connected to Firebase and mirrors changes to the component's state. We then pass data down as `props` to child components for rendering.

Why not use [`re-base`](https://github.com/tylermcginnis/re-base)? It's over-complicated for our needs. Updating a component's store on Firebase changes is a single line of code, and Firebase's library is simple enough to use directly for our needs.

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
- [ ] `npm` build/serve scripts
- [ ] Editable items
- [ ] Sorting
- [ ] Domain visualisation (hostname, favicons)
- [ ] Firebase de-normalization
