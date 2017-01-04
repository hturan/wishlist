import React, { PropTypes } from 'react';

import Item from '../components/Item';

export default class List extends React.Component {
  constructor(props) {
    super(props);

    this.handleDelete = this.handleDelete.bind(this);
    this.handleItemCreate = this.handleItemCreate.bind(this);
    this.handeUpdatePrices = this.handeUpdatePrices.bind(this);
  }

  handleItemCreate(event) {
    event.preventDefault();

    const url = this.urlInput.value;
    if (url) {
      fetch(`https://us-central1-wishlist-hturan.cloudfunctions.net/details?url=${encodeURIComponent(url)}`)
      .then((response) => {
        if (response.ok) {
          return response;
        }

        throw new Error(response.statusText);
      })
      .catch(error => console.log(`API Error for ${url}`, error))
      .then(response => response.json())
      .then((json) => {
        const { amount, currency, title } = json;
        this.props.handleItemCreate(this.props.id, {
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

  handleDelete() {
    this.props.handleListDelete(this.props.id);
  }

  render() {
    return (
      <section className="list">
        <header>
          <strong>{this.props.title}</strong>
          <a className="delete-link" onClick={this.handleDelete}>✖</a>
          <a className="update-link" onClick={this.handeUpdatePrices}>Update</a>
        </header>

        {this.props.items &&
          <ul className="items">
            {
              Object.keys(this.props.items).map(itemId => (
                <Item
                  key={itemId}
                  handleItemUpdate={this.props.handleItemUpdate}
                  handleItemDelete={this.props.handleItemDelete}
                  id={itemId}
                  listId={this.props.id}
                  {...this.props.items[itemId]}
                />
              ))
            }
          </ul>
        }

        <form onSubmit={this.handleItemCreate}>
          <input ref={ref => this.urlInput = ref} type="text" placeholder="Item URL" />
        </form>
      </section>
    );
  }
}

List.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.objectOf(PropTypes.object),
  handleListDelete: PropTypes.func.isRequired,
  handleItemCreate: PropTypes.func.isRequired,
  handleItemUpdate: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired
};
