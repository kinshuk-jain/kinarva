import React from 'react'
import PropTypes from 'prop-types'
import { fetchApi } from '../../../../utils/fetch'
import { storage } from '../../../../utils/storage'
import { Spinner } from '../../../../components/spinner'
import '../common.css'

export class SearchUser extends React.Component {
  static propTypes = {
    gainFocus: PropTypes.bool,
    onSubmit: PropTypes.func,
    tabIndex: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    prefillValue: PropTypes.object,
  }

  state = {
    userList: [],
    filteredList: [],
    fetchedWithPrefix: '',
    name: '',
    username: '',
    selectedKey: -1,
    loading: false,
    expand: false,
  }

  recentSearches = []

  componentDidMount() {
    this.recentSearches = JSON.parse(storage.getItem('recentLoadUser')) || []
    this._isMounted = true
    if (this.props.prefillValue) {
      this.setState({
        name: this.props.prefillValue.name,
        username: this.props.prefillValue.username,
      })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  setRecentSearches(obj) {
    /* Maximum 3 queries can be saved */
    let { recentSearches } = this
    recentSearches = recentSearches.filter(
      (search) => search.username !== obj.username
    )
    if (recentSearches.length >= 3) {
      recentSearches.pop()
    }
    recentSearches.unshift(obj)
    /* Save recentSearches in storage */
    storage.setItem('recentLoadUser', JSON.stringify(recentSearches))
  }

  getFilteredList = (prefix) =>
    this.state.userList.filter((user) => user.name.startsWith(prefix))

  onChangeHandler = (e) => {
    const prefix = e.target.value.trim()
    const { userList, fetchedWithPrefix } = this.state

    if (
      prefix.length >= 3 &&
      (!userList.length || !prefix.startsWith(fetchedWithPrefix))
    ) {
      this.setState({
        loading: true,
        name: e.target.value,
      })
      return fetchApi('/get-names', {
        method: 'POST',
        body: JSON.stringify({
          prefix,
        }),
      })
        .then((resp) => {
          this._isMounted &&
            this.setState({
              userList: resp.suggestions,
              fetchedWithPrefix: prefix,
              filteredList: resp.suggestions.slice(0, 4),
              loading: false,
              expand: true,
            })
        })
        .catch(() => {
          this._isMounted &&
            this.setState({
              loading: false,
            })
        })
    }
    this.setState({
      filteredList: this.getFilteredList(prefix),
      selectedKey: -1,
      name: e.target.value,
      username: '',
      expand: true,
    })
  }

  keyHandler = (e) => {
    const { filteredList, username } = this.state
    if (!filteredList.length && !this.recentSearches.length) return
    const searchContentLength = filteredList.length + this.recentSearches.length
    // get key pressed by user
    const key = e.which || e.keyCode
    let selectedKey = this.state.selectedKey
    switch (key) {
      case 38: // up arrow
        this.setState({
          selectedKey:
            selectedKey > 0
              ? --selectedKey
              : searchContentLength +
                (Math.max(--selectedKey, -1) % searchContentLength),
        })
        break
      case 40: // down arrow
        this.setState({
          selectedKey:
            selectedKey >= -1
              ? ++selectedKey % searchContentLength
              : searchContentLength + ++selectedKey,
        })
        break
      case 13: // enter key
        if (selectedKey > -1) {
          selectedKey < filteredList.length &&
            this.setRecentSearches(filteredList[selectedKey])
          this.setState({
            name:
              selectedKey < filteredList.length
                ? filteredList[selectedKey].name
                : this.recentSearches[selectedKey - filteredList.length].name,
            username:
              selectedKey < filteredList.length
                ? filteredList[selectedKey].username
                : this.recentSearches[selectedKey - filteredList.length]
                    .username,
            filteredList: [],
            selectedKey: -1,
            expand: false,
          })
        }
        if (username && this.props.onSubmit) {
          this.props.onSubmit(username)
        }
        break
      default:
        return
    }
  }

  getSelectedData = () => ({
    username: this.state.username,
    name: this.state.name,
  })

  suggestionClickHandler = (i) => {
    this.setRecentSearches(this.state.filteredList[i])
    this.setState({
      name: this.state.filteredList[i].name,
      username: this.state.filteredList[i].username,
      filteredList: [],
      selectedKey: -1,
      expand: false,
    })
  }

  recentClickHandler = (i) => {
    this.setState({
      name: this.recentSearches[i].name,
      username: this.recentSearches[i].username,
      filteredList: [],
      selectedKey: -1,
      expand: false,
    })
  }

  onMouseOverHandler = (i) => {
    this.setState({
      selectedKey: i,
    })
  }

  onFocusHandler = () => {
    this.setState({
      expand: true,
    })
  }

  onBlurHandler = () => {
    this.setState({
      expand: false,
    })
  }

  render() {
    const { name, filteredList, selectedKey, loading, expand } = this.state
    const {
      disabled,
      gainFocus,
      tabIndex,
      className,
      prefillValue,
    } = this.props
    const length = filteredList.length

    return (
      <div className="user-input-field" style={{ flexDirection: 'column' }}>
        <input
          tabIndex={tabIndex}
          disabled={disabled || prefillValue}
          autoFocus={gainFocus}
          onBlur={this.onBlurHandler}
          onFocus={this.onFocusHandler}
          value={name}
          onKeyUp={this.keyHandler}
          style={{ marginBottom: 0, paddingRight: '30px' }}
          onChange={this.onChangeHandler}
          placeholder="name *"
          className={`user-input-field-input ${className}`}
        />
        {loading && (
          <div className="load-user-spinner">
            <Spinner />
          </div>
        )}
        {expand && (length || this.recentSearches.length) ? (
          <div className="user-suggestion-box">
            {filteredList.map((suggestion, i) => (
              <div
                onMouseDown={(e) => e.preventDefault()}
                onMouseOver={this.onMouseOverHandler.bind(this, i)}
                onClick={this.suggestionClickHandler.bind(this, i)}
                className={`user-suggestion ${
                  selectedKey === i ? 'user-suggestion-active' : ''
                }`}
                key={i}
              >
                {suggestion.name}
              </div>
            ))}
            <label className="user-suggestion-recent-searches">
              Recent searches
            </label>
            {this.recentSearches.map((suggestion, i) => (
              <div
                onMouseDown={(e) => e.preventDefault()}
                onMouseOver={this.onMouseOverHandler.bind(this, i + length)}
                onClick={this.recentClickHandler.bind(this, i)}
                className={`user-suggestion ${
                  selectedKey === i + length ? 'user-suggestion-active' : ''
                }`}
                key={i}
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
}
