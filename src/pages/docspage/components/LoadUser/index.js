import React from 'react'
import PropTypes from 'prop-types'
import { fetchApi } from '../../../../utils/fetch'
import { SearchUser } from '../SearchUser'
import { Spinner } from '../../../../components/spinner'
import '../common.css'

export class LoadUser extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    setData: PropTypes.func.isRequired
  }

  state = {
    error: '',
    loading: false,
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  onSubmit = (username = '') => {
    this.setState({
      loading: true,
    })

    if (!username) {
      username = this.search.getSelectedData().username
    }

    fetchApi('/load-user', {
      method: 'POST',
      body: JSON.stringify({
        username,
      }),
    })
      .then((r) => {
        if (this._isMounted){
          this.props.setData(r.results)
          this.props.onClose()
        }
      })
      .catch(() => {
        this._isMounted && this.setState({
          loading: false,
          error: 'Could not load user. Please try again',
        })
      })
  }

  render() {
    const { loading, error } = this.state
    return (
      <div>
        <div className="user-input-field">
          <p className="Modal-title">Load User</p>
        </div>
        {error && (
          <div className="user-input-field">
            <p className="user-error-message">{error}</p>
          </div>
        )}
        <SearchUser
          ref={(el) => (this.search = el)}
          disabled={loading}
          tabIndex="1"
          onSubmit={this.onSubmit.bind(this)}
        />
        <div className="user-input-field">
          <button
            onClick={() => this.onSubmit()}
            tabIndex="2"
            className="user-input-field-button"
          >
            {this.state.loading ? <Spinner /> : 'Submit'}
          </button>
        </div>
      </div>
    )
  }
}
