import React from 'react';
import 'whatwg-fetch';

import List from '../components/List';

import '../index.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.horizon = Horizon();

    this.horizon('lists').watch().subscribe(items => this.setState({
      lists: items
    }));

    this.horizon.status(message => console.log(message));

    this.state = {
      lists: []
    };
  }

  handleListCreate(event) {
    event.preventDefault();

    this.horizon('lists').store({
      title: this.listTitleInput.value
    });

    this.listTitleInput.value = '';
  }

  handleListDelete(listId) {
    if (window.confirm('All items within this this will be deleted. Do you wish to proceed?')) {
      this.horizon('lists').remove(listId);
    }
  }

  handleItemCreate(listId, data) {
    const list = this.state.lists.filter(list => list.id === listId)[0];
    this.horizon('lists').replace({
      ...list,
      items: list.items ? list.items.concat([data]) : [data]
    });
  }

  handleItemUpdate(listId, itemIndex, data) {
    const list = this.state.lists.filter(list => list.id === listId)[0];
    this.horizon('lists').replace({
      ...list,
      items: [
        ...list.items.slice(0, itemIndex),
        {
          ...list.items[itemIndex],
          ...data
        },
        ...list.items.slice(itemIndex + 1)
      ]
    });
  }

  handleItemDelete(listId, itemIndex) {
    const list = this.state.lists.filter(list => list.id === listId)[0];
    this.horizon('lists').replace({
      ...list,
      items: [
        ...list.items.slice(0, itemIndex),
        ...list.items.slice(itemIndex + 1)
      ]
    });
  }

  render() {
    return (
      <section className="lists">
        {this.state.lists.map(list => (
          <List
            key={list.id}
            handleListDelete={this.handleListDelete.bind(this, list.id)}
            handleItemCreate={this.handleItemCreate.bind(this, list.id)}
            handleItemUpdate={this.handleItemUpdate.bind(this, list.id)}
            handleItemDelete={this.handleItemDelete.bind(this, list.id)}
            {...list}
          />
        ))}

        <section className="list">
          <form onSubmit={this.handleListCreate.bind(this)}>
            <input ref={ref => this.listTitleInput = ref} type="text" placeholder="New List" />
          </form>
        </section>
      </section>
    );
  }
}
