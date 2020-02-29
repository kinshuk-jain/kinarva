import React from 'react';
import { fetchApi } from '../../../../utils/fetch';
import '../common.css'

export class LoadUser extends React.Component {
  state = {
    userList: [],
    fetchedWithPrefix: '',
    name: ''
  }

  onChangeHandler = (e) => {
    const prefix = e.target.value.trim();
    const { userList, fetchedWithPrefix } = this.state;
    if(prefix.length >= 3) {
      if (!userList.length || !prefix.startsWith(fetchedWithPrefix)) {
        fetchApi('/get-names', {
          method: 'POST',
          body: JSON.stringify({
            prefix
          })
        })
        .then(resp => {
          this.setState({ userList: resp.suggestions, fetchedWithPrefix: prefix })
        })
      }
    }
    this.setState({
      name: e.target.value
    })
  }

  render() {
    return (
      <div>
        <div className="user-input-field">
          <p className="user-input-field-input">Load User</p>
        </div>
        <div className="user-input-field">
          <input onChange={this.onChangeHandler} placeholder="name *" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <button className="user-input-field-button">Submit</button>
        </div>
      </div>
    );
  }
}
