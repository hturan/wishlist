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
      lists: {}
    };

    this.firebase = null;
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // Authenticated
        this.setState({
          user
        });
        this.firebase = firebase.database().ref(`users/${user.uid}/`);
        this.firebase.on('value', snapshot => {
          this.setState({
            lists: snapshot.val().lists,
            loading: false
          })
        });
      } else {
        // Unauthenticated
        this.setState({
          user: null,
          loading: false
        });
        this.firebase = null;
      }
    })
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

    firebase.auth().signInWithEmailAndPassword(this.emailInput.value, this.passwordInput.value).catch(err => {
      this.setState({
        loading: false
      });

      alert(err.message);
    });
  }

  handleUnauth() {
    firebase.auth().signOut();
  }

  render() {
    if (this.state.loading) return <section className="loader" />;

    return (
      this.state.user ?
      <section className="lists">
        {Object.keys(this.state.lists).map(listId => (
          <List
            key={listId}
            id={listId}
            handleListDelete={this.handleListDelete.bind(this, listId)}
            handleItemCreate={this.handleItemCreate.bind(this, listId)}
            handleItemUpdate={this.handleItemUpdate.bind(this, listId)}
            handleItemDelete={this.handleItemDelete.bind(this, listId)}
            {...this.state.lists[listId]}
          />
        ))}

        <section className="list">
          <form onSubmit={this.handleListCreate.bind(this)}>
            <input ref={ref => {this.listTitleInput = ref}} type="text" placeholder="New List" />
          </form>
        </section>
      </section>
      :
      <form id="sign-in-form" onSubmit={this.handleAuth.bind(this)}>
        <input ref={ref => {this.emailInput = ref}} type="email" placeholder="Email" />
        <input ref={ref => {this.passwordInput = ref}} type="password" placeholder="Password" />
        <button className="submit">Sign In</button>
      </form>
    );
  }
}
