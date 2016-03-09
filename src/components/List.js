import React from 'react';

import Item from '../components/Item';

export default class List extends React.Component {
  handleItemCreate(event) {
    event.preventDefault();

    const url = this.urlInput.value;
    if (url) {
      fetch(`https://hturan-wishlist.herokuapp.com/details/${window.encodeURIComponent(url)}`)
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

  render() {
    return (
      <section className="list">
        <header>
          <strong>{this.props.title}</strong>
          <a className="delete-link" onClick={this.props.handleListDelete}>✖</a>
        </header>

        {this.props.items ?
        Object.keys(this.props.items).map(itemId => (
          <Item
            key={itemId}
            handleItemDelete={this.props.handleItemDelete.bind(this, itemId)}
            {...this.props.items[itemId]}
          />
        ))
        : null
        }

        <form onSubmit={this.handleItemCreate.bind(this)}>
          <input ref={ref => this.urlInput = ref} type="text" placeholder="URL" />
          <button>Create</button>
        </form>
      </section>
    );
  }
}
