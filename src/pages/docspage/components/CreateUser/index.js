import React from 'react';
import '../common.css'
import { fetchApi } from '../../../../utils/fetch';

export class CreateUser extends React.Component {
  createUserHandler = (e) => {
    e.preventDefault();
    console.log(e.target.name.value);
    console.log(e.target.username.value);
    console.log(e.target.email.value);
    console.log(e.target.hasUpload.value);
    console.log(this.props.history)
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
    return (
      <form onSubmit={this.createUserHandler} method="POST">
        <div className="user-input-field">
          <p className="user-input-field-input">Create User</p>
        </div>
        <div className="user-input-field">
          <input name="name" placeholder="name" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <input name="username" placeholder="username" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <input name="email" placeholder="email" className="user-input-field-input" />
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
