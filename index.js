var firebaseEndpoint = "https://wishlist-hturan.firebaseio.com/";

var resizeInput = function (e) {
  var length = e.target.value.length;

  if (length === 0) {
    length = 1;
  }

  if (length > 1) {
    length -= 1;
  }

  e.target.size = length;
};

var WishlistApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function () {
    var ref = new Firebase(firebaseEndpoint);
    var authData = ref.getAuth();

    var user = false;

    if (authData) {
      user = authData
    }

    return {
      lists: [],
      user: authData
    };
  },

  componentWillMount: function() {
    if (this.state.user) {
      this.bindAsObject(new Firebase(firebaseEndpoint+"users/"+this.state.user.uid+"/lists/"), "lists");
    }
  },

  addList: function (formData) {
    this.firebaseRefs.lists.push(formData);
  },

  removeList: function (listId) {
    this.firebaseRefs.lists.child(listId).remove()
  },

  signIn: function (formData) {
    var ref = new Firebase(firebaseEndpoint);
    var self = this;

    ref.authWithPassword(formData, function (error, authData) {
      if (error) {
        console.log(error);
      } else {
        self.setState({user: authData})
        self.bindAsObject(new Firebase(firebaseEndpoint+"users/"+self.state.user.uid+"/lists/"), "lists");
      }
    })
  },

  signOut: function () {
    // Kill our Firebase session
    new Firebase(firebaseEndpoint).unauth();

    // Reset app state
    this.replaceState(this.getInitialState())
  },

  render: function() {
    var lists = [];

    for (var list in this.state.lists) {
      lists.push(<WishList key={list} listId={list} userId={this.state.user.uid} title={this.state.lists[list].title} removeList={this.removeList} />);
    }

    if (this.state.user) {
      var appTemplate = (
        <section className="lists">
          <UserPanel user={this.state.user} signOut={this.signOut} />
          {lists}
          <AddListForm addList={this.addList} />
        </section>
      )
    } else {
      var appTemplate = <SignInForm signIn={this.signIn} />
    }

    return appTemplate;
  }

});

var WishList = React.createClass({
  mixins: [ReactFireMixin],

  componentWillMount: function() {
    this.bindAsObject(new Firebase(firebaseEndpoint+"users/"+this.props.userId+"/lists/"+this.props.listId), "list");
  },

  getInitialState: function () {
    return {
      list: {
        title: this.props.title,
        items: []
      }
    };
  },

  addItem: function (formData) {
    this.firebaseRefs.list.child('items').push(formData)
  },

  removeList: function () {
    this.props.removeList(this.props.listId);
  },

  handleTitleChange: function (e) {
    this.firebaseRefs.list.update({
      title: e.target.value
    })
  },

  render: function() {
    var items = [];

    for (var item in this.state.list.items) {
      items.push(<WishListEntry key={item} itemId={item} listId={this.props.listId} userId={this.props.userId} item={this.state.list.items[item]} />);
    }

    return (
      <section className="list">
        <header>
          <input name="title" className="title" defaultValue={this.state.list.title} size={this.state.list.title.length - 1} onBlur={this.handleTitleChange} onChange={resizeInput} />
          <a onClick={this.removeList} className="delete">✖</a>
        </header>
        <ul className="items">
          {items}
        </ul>
        <AddItemForm addItem={this.addItem} />
      </section>
    );
  }

});

var WishListEntry = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function () {
    return (
      {
        item: {
          title: '',
          url: '',
          currency: '£',
          amount: 0
        },
        isEditing: false
      }
    );
  },

  componentWillMount: function() {
    this.bindAsObject(new Firebase(firebaseEndpoint+"users/"+this.props.userId+"/lists/"+this.props.listId+"/items/"+this.props.itemId), "item");
  },

  removeItem: function () {
    this.firebaseRefs.item.remove();
  },

  updateItemTitle: function (e) {
    this.firebaseRefs.item.update({
      title: e.target.value
    });
  },

  handleTitleClick: function (e) {
    if (!e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      window.open(this.state.item.url)
    }
  },

  render: function () {
    return (
      <li className="item">
        <input className="name" defaultValue={this.state.item.title} size={this.state.item.title.length - 1} onMouseDown={this.handleTitleClick} onBlur={this.updateItemTitle} onChange={resizeInput} />
        <span className="amount">{this.state.item.currency}{this.state.item.amount}</span>
        <a onClick={this.removeItem} className="delete">✖</a>
      </li>
    );
  }

});

var AddListForm = React.createClass({

  handleSubmit: function (e) {
    e.preventDefault();

    var data = {
      title: this.refs.title.getDOMNode().value
    };

    this.props.addList(data);

    e.target.reset();
  },

  render: function () {
    return (
      <form className="addListForm" onSubmit={this.handleSubmit}>
        <input type="text" ref="title" name="title" placeholder="New List" />
        <input type="submit" />
      </form>
    );
  }

});

var AddItemForm = React.createClass({

  handleSubmit: function (e) {
    var currency,
        amount;

    e.preventDefault();

    var amountValue = this.refs.amount.getDOMNode().value;
    var validCurrencies = ['£', '$', '€'];

    if (validCurrencies.indexOf(amountValue.substr(0,1)) === -1) {
      currency = '£';
      amount = amountValue;
    } else {
      currency = amountValue.substr(0,1);
      amount = amountValue.substring(1);
    }

    var data = {
      title: this.refs.title.getDOMNode().value,
      amount: amount,
      currency: currency,
      url: this.refs.url.getDOMNode().value,
    }

    this.props.addItem(data);

    e.target.reset();
  },

  handleURLChange: function (e) {
    var targetURL = e.target.value;

    if (targetURL) {
      $.ajax({
        context: this,
        url: e.target.value,
        success: function(response) {
          this.refs.title.getDOMNode().value = response.match("<title>(.*?)</title>")[1];
        }
      });
    }
  },

  render: function () {
    return (
      <form className="addItemForm" onSubmit={this.handleSubmit}>
        <input type="text" ref="title" name="title" placeholder="Name" />
        <input type="text" ref="url" onChange={this.handleURLChange} name="url" placeholder="URL" />
        <input type="text" ref="amount" name="amount" placeholder="Amount" />
        <input type="submit" />
      </form>
    );
  }

});

var SignInForm = React.createClass({

  signIn: function (e) {
    e.preventDefault();

    var data = {
      email: this.refs.email.getDOMNode().value,
      password: this.refs.password.getDOMNode().value
    };

    this.props.signIn(data);
  },

  render: function () {
    return (
      <form onSubmit={this.signIn} className="signInForm">
        <input type="text" ref="email" name="email" placeholder="Email" />
        <input type="password" ref="password" name="password"  placeholder="Password" />
        <input type="submit" />
      </form>
    )
  }

});

var UserPanel = React.createClass({

  render: function () {
    return (
      <section className="userPanel">
        <span className="email">{this.props.user.password.email}</span><a onClick={this.props.signOut}>⫸</a>
      </section>
    );
  }

});

React.render(
  <WishlistApp />,
  document.getElementById('app')
);
