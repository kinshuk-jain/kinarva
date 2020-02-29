import React from 'react';
import '../common.css'
import { fetchApi } from '../../../../utils/fetch';

export class CreateUser extends React.Component {
  state = {
    noUsername: false,
    noName: false,
    noEmail: false,
    loading: false
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
    const hasUpload = e.target.hasUpload.checked;
    if (!username || !name || !email) {
      this.setState({
        noEmail: email ? false : true,
        noUsername: username ? false : true,
        noName: name ? false : true
      })
      return;
    }
    this.setState({
      loading: true
    })
    fetchApi('/create-user', {
      method: 'POST',
      body: JSON.stringify({
        name,
        userid: username,
        email,
        canUpload: hasUpload
      })
    }, this.props.history)
    .then(() => {
      this.setState({
        loading: false,
        message: 'User Successfully Created!!'
      });
    })
    .catch((e) => {
      this.setState({
        loading: false,
        message: e.response.error
      });
    })
  }

  render() {
    const { noEmail, noName, noUsername, loading, message } = this.state;
    return (
      !message ? (<form onSubmit={this.createUserHandler} method="POST">
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
          <button type="submit" className="user-input-field-button" disabled={loading}>Submit</button>
        </div>
      </form>) : (
        <div>
          <div className="user-input-field">
            <p className="user-input-field-input">{message}</p>
          </div>
          <div className="user-input-field">
            <button onClick={this.props.onClose} className="user-input-field-button">Close</button>
          </div>
        </div>
      )
    )
  }
}
