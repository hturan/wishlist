import React from 'react';

const Item = props => (
  <section className="item">
    <span className="item-price">{props.currency}{props.amount.toString().indexOf('.') > -1 ? props.amount : `${props.amount}.00` }</span>
    <span className="item-title"><a className="item-link" href={props.url} target="_blank">{props.title}</a></span>
    <a className="delete-link" onClick={props.handleItemDelete}>✖</a>
  </section>
);

export default Item;
