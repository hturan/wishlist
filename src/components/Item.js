import React from 'react';
import classNames from 'classnames';
import accounting from 'accounting';

export default class Item extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };
  }

  handleUpdateToggle() {
    if (this.state.editing) {
      this.props.handleItemUpdate({
        title: this.titleInput.value,
        ...this.unformatAmount(this.amountInput.value)
      });
    }

    this.setState({
      editing: !this.state.editing
    });
  }

  handleInput(event) {
    event.target.size = event.target.value.length > 5 ? event.target.value.length : 5;
  }

  formatAmount() {
    return accounting.formatMoney(this.props.amount, this.props.currency);
  }

  unformatAmount(amountString) {
    const currencies = ['£', '$', '€'];
    let currency, amount;

    if (currencies.indexOf(amountString.substr(0, 1)) > -1) {
      currency = amountString.substr(0, 1);
      amount = amountString.substr(1);
    } else {
      currency = '£';
      amount = amountString;
    }

    return {
      currency,
      amount
    };
  }

  render() {
    return (
      <li className={classNames('item', {'editing': this.state.editing})}>
        <span className="item-price">
          {this.state.editing ?
          <input
            type="text"
            ref={ref => this.amountInput = ref}
            defaultValue={this.formatAmount()}
            size={this.formatAmount().length}
            onInput={this.handleInput.bind(this)}
          />
          :
          <span>{this.formatAmount()}</span>
          }
        </span>
        <span className="item-title">
          {this.state.editing ?
          <input
            type="text"
            ref={ref => this.titleInput = ref}
            defaultValue={this.props.title}
            size={this.props.title.length}
            onInput={this.handleInput.bind(this)}
          />
          :
          <a className="item-link" href={this.props.url} target="_blank">{this.props.title}</a>
          }
        </span>
        <a className="delete-link" onClick={this.props.handleItemDelete}>✖</a>
        <a className="edit-link" onClick={this.handleUpdateToggle.bind(this)}>✎</a>
      </li>
    );
  }
};
