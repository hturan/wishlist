import React from 'react';

export default class Item extends React.Component {
  render() {
    return (
      <section className="item">
        <span className="item-price">{this.props.currency}{ this.props.amount.toString().indexOf('.') > -1 ? this.props.amount : `${this.props.amount}.00` }</span>
        <span className="item-title"><a className="item-link" href={this.props.url} target="_blank">{this.props.title}</a></span>
        <a className="delete-link" onClick={this.props.handleItemDelete}>✖</a>
      </section>
    );
  }
}
