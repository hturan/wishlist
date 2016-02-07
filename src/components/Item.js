import React from 'react';

export default class Item extends React.Component {
  render() {
    return (
      <section className="item">
        <a className="item-link" href={this.props.url} target="_blank">{this.props.title}</a> — {this.props.currency}{this.props.amount}
        <a className="delete-link" onClick={this.props.handleItemDelete}>✖</a>
      </section>
    );
  }
}
