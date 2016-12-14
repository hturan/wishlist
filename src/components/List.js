import React from 'react';

import Item from '../components/Item';

export default class List extends React.Component {
  handleItemCreate(event) {
    event.preventDefault();

    const url = this.urlInput.value;
    if (url) {
      fetch(`https://us-central1-wishlist-hturan.cloudfunctions.net/details?url=${encodeURIComponent(url)}`)
      .then(response => {
        if (response.ok) {
          return response;
        }

        throw new Error(response.statusText)
      })
      .catch(error => console.log(`API Error for ${url}`, error))
      .then(response => response.json())
      .then(json => {
        const { amount, currency, title } = json;
        this.props.handleItemCreate({
          title,
          amount,
          currency,
          url
        });
        this.urlInput.value = '';
      });
    }
  }

  handeUpdatePrices() {
    fetch(`https://us-central1-wishlist-hturan.cloudfunctions.net/updatePrices?userId=2&listId=${this.props.id}`);
  }

  render() {
    return (
      <section className="list">
        <header>
          <strong>{this.props.title}</strong>
          <a className="delete-link" onClick={this.props.handleListDelete}>✖</a>
          <a className="update-link" onClick={this.handeUpdatePrices.bind(this)}>Update</a>
        </header>

        {this.props.items ?
        <ul className="items">
          {
            Object.keys(this.props.items).map(itemId => (
            <Item
              key={itemId}
              handleItemUpdate={this.props.handleItemUpdate.bind(this, itemId)}
              handleItemDelete={this.props.handleItemDelete.bind(this, itemId)}
              {...this.props.items[itemId]}
            />
            ))
          }
        </ul>
        : null
        }

        <form onSubmit={this.handleItemCreate.bind(this)}>
          <input ref={ref => this.urlInput = ref} type="text" placeholder="Item URL" />
        </form>
      </section>
    );
  }
}
