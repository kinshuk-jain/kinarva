import React from 'react'
import PropTypes from 'prop-types'
import './form.css'

export class FormInput extends React.Component {
  state = {
    value: '',
  }

  handleChange = (e) => {
    this.props.onChange()
    this.setState({
      value: e.target.value,
    })
  }

  render() {
    const { name, placeholder, isSubmitted, required } = this.props
    const { value } = this.state
    ;<div className="user-input-field">
      <input
        onChange={this.handleChange}
        value={value}
        name={name}
        placeholder={placeholder}
        className={`user-input-field-input ${
          required && isSubmitted && !value.trim() ? 'error' : ''
        }`}
      />
    </div>
  }
}

FormInput.defaultProps = {
  onChange: () => {},
  isSubmitted: false,
  required: false,
}

FormInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
}
