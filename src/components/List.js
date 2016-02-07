import React from 'react';

import Item from '../components/Item';

export default class List extends React.Component {
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
      </section>
    );
  }
}
