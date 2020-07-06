import React from 'react'
import '../common.css'
import { fetchApi } from '../../../../utils/fetch'
import { Spinner } from '../../../../components/spinner'

export class CreateUser extends React.Component {
  state = {
    noUsername: false,
    noName: false,
    noEmail: false,
    loading: false,
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  handleName = (e) => {
    if (e.target.value.trim()) {
      this.setState({
        noName: false,
      })
    }
  }

  handleUsername = (e) => {
    if (e.target.value.trim()) {
      this.setState({
        noUsername: false,
      })
    }
  }

  handleEmail = (e) => {
    if (e.target.value.trim()) {
      this.setState({
        noEmail: false,
      })
    }
  }

  createUserHandler = (e) => {
    e.preventDefault()
    const name = e.target.name.value
    const username = e.target.username.value
    const email = e.target.email.value
    const hasUpload = e.target.hasUpload.checked
    if (!username || !name || !email) {
      this.setState({
        noEmail: email ? false : true,
        noUsername: username ? false : true,
        noName: name ? false : true,
      })
      return
    }
    this.setState({
      loading: true,
    })
    fetchApi('/create-user', {
      method: 'POST',
      body: JSON.stringify({
        name,
        userid: username,
        email,
        canUpload: hasUpload,
      }),
    })
      .then(() => {
        this._isMounted &&
          this.setState({
            loading: false,
            message: 'User Successfully Created!!',
          })
      })
      .catch((e) => {
        this._isMounted &&
          this.setState({
            loading: false,
            message: e.response
              ? e.response.error
              : 'Something went wrong! Please try again',
          })
      })
  }

  render() {
    const { noEmail, noName, noUsername, loading, message } = this.state
    return !message ? (
      <form onSubmit={this.createUserHandler} method="POST">
        <div className="user-input-field">
          <p className="Modal-title">Create User</p>
        </div>
        <div className="user-input-field">
          <input
            tabIndex="1"
            autoFocus
            onChange={this.handleName}
            name="name"
            placeholder="name *"
            className={`user-input-field-input ${noName ? 'error' : ''}`}
          />
        </div>
        <div className="user-input-field">
          <input
            tabIndex="2"
            onChange={this.handleUsername}
            name="username"
            placeholder="username *"
            className={`user-input-field-input ${noUsername ? 'error' : ''}`}
          />
        </div>
        <div className="user-input-field">
          <input
            tabIndex="3"
            onChange={this.handleEmail}
            name="email"
            placeholder="email *"
            className={`user-input-field-input ${noEmail ? 'error' : ''}`}
          />
        </div>
        <div className="user-input-field">
          <input tabIndex="4" name="hasUpload" type="checkbox" />
          <p className="user-input-checkbox-text">
            Do you want to provide this user the permission to upload documents?
          </p>
        </div>
        <div className="user-input-field">
          <button
            tabIndex="5"
            type="submit"
            className="user-input-field-button"
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Submit'}
          </button>
        </div>
      </form>
    ) : (
      <div>
        <div className="user-input-field">
          <p className="user-input-field-input">{message}</p>
        </div>
        <div tabIndex="1" className="user-input-field">
          <button
            onClick={this.props.onClose}
            className="user-input-field-button"
          >
            Close
          </button>
        </div>
      </div>
    )
  }
}
