import React from 'react';
import firebase from 'firebase';
import 'whatwg-fetch';

import List from '../components/List';

import '../index.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    firebase.initializeApp({
      apiKey: 'AIzaSyDaA4bP4YIaPR7fnDTVg1EQbfMSMbmpGDE',
      authDomain: ' wishlist-hturan.firebaseapp.com',
      databaseURL: 'https://wishlist-hturan.firebaseio.com'
    });

    this.state = {
      loading: true,
      user: null,
      lists: {},
      groupByHostname: false
    };

    this.firebase = null;

    this.getItemsByHostname = this.getItemsByHostname.bind(this);
    this.handleToggleListDisplay = this.handleToggleListDisplay.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleListCreate = this.handleListCreate.bind(this);
    this.handleListDelete = this.handleListDelete.bind(this);
    this.handleItemCreate = this.handleItemCreate.bind(this);
    this.handleItemUpdate = this.handleItemUpdate.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Authenticated
        this.setState({
          user
        });
        this.firebase = firebase.database().ref(`users/${user.uid}/`);
        this.firebase.on('value', (snapshot) => {
          this.setState({
            lists: snapshot.val().lists,
            loading: false
          });
        });
      } else {
        // Unauthenticated
        this.setState({
          user: null,
          loading: false
        });
        this.firebase = null;
      }
    });
  }

  getItemsByHostname() {
    const itemsByHostname = {};
    const element = document.createElement('a');

    Object.keys(this.state.lists).forEach((listId) => {
      const list = this.state.lists[listId];
      Object.keys(list.items).forEach((itemId) => {
        const item = list.items[itemId];

        element.href = item.url;

        itemsByHostname[element.hostname] = itemsByHostname[element.hostname] || { title: element.hostname, items: {} };
        itemsByHostname[element.hostname].items[itemId] = item;
      });
    });

    return itemsByHostname;
  }

  handleListCreate(event) {
    event.preventDefault();

    this.firebase.child('lists').push({
      title: this.listTitleInput.value
    });

    this.listTitleInput.value = '';
  }

  handleListDelete(listId) {
    if (window.confirm('All items within this this will be deleted. Do you wish to proceed?')) {
      this.firebase.child(`lists/${listId}`).remove();
    }
  }

  handleItemCreate(listId, data) {
    this.firebase.child(`lists/${listId}/items`).push(data);
  }

  handleItemUpdate(listId, itemId, data) {
    this.firebase.child(`lists/${listId}/items/${itemId}`).update(data);
  }

  handleItemDelete(listId, itemId) {
    this.firebase.child(`lists/${listId}/items/${itemId}`).remove();
  }

  handleAuth(event) {
    event.preventDefault();

    this.setState({
      loading: true
    });

    firebase.auth().signInWithEmailAndPassword(this.emailInput.value, this.passwordInput.value).catch((err) => {
      this.setState({
        loading: false
      });

      window.alert(err.message);
    });
  }

  handleUnauth() {
    firebase.auth().signOut();
  }

  handleToggleListDisplay() {
    this.setState({
      groupByHostname: !this.state.groupByHostname
    });
  }

  render() {
    if (this.state.loading) return <section className="loader" />;

    const lists = this.state.groupByHostname ? this.getItemsByHostname() : this.state.lists;

    return (
      this.state.user ?
        <section className="lists">
          <a onClick={this.handleToggleListDisplay}>Toggle</a>
          {Object.keys(lists).map(listId => (
            <List
              key={listId}
              id={listId}
              handleListDelete={this.handleListDelete}
              handleItemCreate={this.handleItemCreate}
              handleItemUpdate={this.handleItemUpdate}
              handleItemDelete={this.handleItemDelete}
              {...lists[listId]}
            />
          ))}

          <section className="list">
            <form onSubmit={this.handleListCreate}>
              <input ref={ref => this.listTitleInput = ref} type="text" placeholder="New List" />
            </form>
          </section>
        </section>
      :
        <form id="sign-in-form" onSubmit={this.handleAuth}>
          <input ref={ref => this.emailInput = ref} type="email" placeholder="Email" />
          <input ref={ref => this.passwordInput = ref} type="password" placeholder="Password" />
          <button className="submit">Sign In</button>
        </form>
    );
  }
}
