import React from 'react';
import '../common.css'
import { fetchApi } from '../../../../utils/fetch';

export class CreateUser extends React.Component {
  state = {
    noUsername: false,
    noName: false,
    noEmail: false
  }

  handleName = (e) => {
    if(e.target.value.trim()) {
      this.setState({
        noName: false,
      })
    }
  }

  handleUsername = (e) => {
    if(e.target.value.trim()) {
      this.setState({
        noUsername: false,
      })
    }
  }

  handleEmail = (e) => {
    if(e.target.value.trim()) {
      this.setState({
        noEmail: false,
      })
    }
  }

  createUserHandler = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const username = e.target.username.value;
    const email = e.target.email.value;
    const hasUpload = e.target.hasUpload.value === 'on' ? true : false;
    if (!username || !name || !email) {
      this.setState({
        noEmail: email ? false : true,
        noUsername: username ? false : true,
        noName: name ? false : true
      })
      return;
    }
    // fetchApi('/create-user', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     username,
    //     password,
    //     captcha
    //   })
    // }, this.props.history)
  }

  render() {
    const { noEmail, noName, noUsername } = this.state;
    return (
      <form onSubmit={this.createUserHandler} method="POST">
        <div className="user-input-field">
          <p className="user-input-field-input">Create User</p>
        </div>
        <div className="user-input-field">
          <input onChange={this.handleName} name="name" placeholder="name *" className={`user-input-field-input ${noName ? 'error': ''}`} />
        </div>
        <div className="user-input-field">
          <input onChange={this.handleUsername} name="username" placeholder="username *" className={`user-input-field-input ${noUsername ? 'error': ''}`} />
        </div>
        <div className="user-input-field">
          <input onChange={this.handleEmail} name="email" placeholder="email *" className={`user-input-field-input ${noEmail ? 'error': ''}`} />
        </div>
        <div className="user-input-field">
          <input name="hasUpload" type="checkbox" />
          <p>Do you want to provide this user the permission to upload documents?</p>
        </div>
        <div className="user-input-field">
          <button type="submit" className="user-input-field-button">Submit</button>
        </div>
      </form>
    )
  }
}
