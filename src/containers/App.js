import React from 'react';
import Firebase from 'firebase';

import List from '../components/List';

import '../index.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.firebase = new Firebase('https://wishlist-hturan.firebaseio.com/');

    this.state = {
      lists: {},
      auth: this.firebase.getAuth()
    };

    if (this.state.auth) {
      this.connectFirebase();
    }
  }

  connectFirebase() {
    console.log('Authenticated as', this.state.auth.password.email);
    this.firebase = this.firebase.child(`users/${this.state.auth.uid}/`);
    this.firebase.on('value', snapshot => {
      this.setState(snapshot.val());
    }, error => {
      console.warn(error);
    });
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

  handleItemDelete(listId, itemId) {
    this.firebase.child(`lists/${listId}/items/${itemId}`).remove();
  }

  handleAuth(event) {
    event.preventDefault();

    this.firebase.authWithPassword({
      email: this.emailInput.value,
      password: this.passwordInput.value
    }, error => {
      if (!error) {
        this.setState({
          auth: this.firebase.getAuth()
        }, () => {
          // setState might not be synchronous, so let's configure Firebase when ready
          this.connectFirebase();
        });
      } else {
        console.warn(error);
      }
    });
  }

  handleUnauth() {
    this.firebase.unauth();
  }

  render() {
    return (
      this.state.auth ?
      <section className="lists">
        {Object.keys(this.state.lists).map(listId => (
          <List
            key={listId}
            handleListDelete={this.handleListDelete.bind(this, listId)}
            handleItemCreate={this.handleItemCreate.bind(this, listId)}
            handleItemDelete={this.handleItemDelete.bind(this, listId)}
            {...this.state.lists[listId]}
          />
        ))}

        <section className="list">
          <form onSubmit={this.handleListCreate.bind(this)}>
            <input ref={ref => this.listTitleInput = ref} type="text" placeholder="New List" />
          </form>
        </section>
      </section>
      :
      <form onSubmit={this.handleAuth.bind(this)}>
        <input ref={ref => this.emailInput = ref} type="email" placeholder="Email" />
        <input ref={ref => this.passwordInput = ref} type="password" placeholder="Password" />
        <button>Sign In</button>
      </form>
    );
  }
}
