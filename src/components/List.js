import React from 'react';

import Item from '../components/Item';

export default class List extends React.Component {
  handleItemCreate(event) {
    event.preventDefault();

    const currencies = ['£', '$', '€'];
    let currency, amount;

    if (currencies.indexOf(this.amountInput.value.substr(0, 1)) > -1) {
      currency = this.amountInput.value.substr(0, 1);
      amount = this.amountInput.value.substr(1);
    } else {
      currency = '£';
      amount = this.amountInput.value;
    }

    this.props.handleItemCreate({
      title: this.titleInput.value,
      amount,
      currency,
      url: this.urlInput.value
    });

    // Clear inputs
    this.titleInput.value = '';
    this.amountInput.value = '';
    this.urlInput.value = '';
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
          <input ref={ref => this.titleInput = ref} type="text" placeholder="Title" />
          <input ref={ref => this.amountInput = ref} type="text" placeholder="Amount" />
          <input ref={ref => this.urlInput = ref} type="text" placeholder="URL" />
          <button>Create</button>
        </form>
      </section>
    );
  }
}
