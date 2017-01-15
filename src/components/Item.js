import React, { PropTypes } from 'react';
import classNames from 'classnames';

import { formatAmount, unformatAmount } from '../utils';

export default class Item extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleUpdateToggle = this.handleUpdateToggle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    this.props.handleItemDelete(this.props.listId, this.props.id);
  }

  handleUpdateToggle() {
    if (this.state.editing) {
      this.props.handleItemUpdate(this.props.listId, this.props.id, {
        title: this.titleInput.value,
        ...unformatAmount(this.amountInput.value)
      });
    }

    this.setState({
      editing: !this.state.editing
    });
  }

  handleInput(event) {
    const eventTarget = event.target;
    eventTarget.size = event.target.value.length > 5 ? event.target.value.length : 5;
  }

  render() {
    return (
      <li className={classNames('item', { editing: this.state.editing, updating: this.props.updating })}>
        <span className="item-price">
          {this.state.editing ?
            <input
              type="text"
              ref={ref => this.amountInput = ref}
              defaultValue={formatAmount(this.props.currency, this.props.amount)}
              size={formatAmount(this.props.currency, this.props.amount).length}
              onInput={this.handleInput}
            />
          :
            <span>{formatAmount(this.props.currency, this.props.amount)}</span>
          }
        </span>
        <span className="item-title">
          {this.state.editing ?
            <input
              type="text"
              ref={ref => this.titleInput = ref}
              defaultValue={this.props.title}
              size={this.props.title.length}
              onInput={this.handleInput}
            />
          :
            <a className="item-link" href={this.props.url} target="_blank">{this.props.title}</a>
          }
        </span>
        <a className="delete-link" onClick={this.handleDelete}>✖</a>
        <a className="edit-link" onClick={this.handleUpdateToggle}>✎</a>
      </li>
    );
  }
}

Item.propTypes = {
  id: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  updating: PropTypes.bool,
  handleItemUpdate: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired
};
