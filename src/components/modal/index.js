import React from 'react'
import PropTypes from 'prop-types'
import './modal.css'

export class Modal extends React.Component {
  static propTypes = {
    fullModal: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
    }
  }

  render() {
    const { fullModal = false } = this.props
    return (
      <div onClick={this.props.onClose} className="Modal-parent-container">
        {!fullModal ? (<div onClick={(e) => e.stopPropagation()} className="Modal-container">
          <div onClick={this.props.onClose} className="Modal-cross-button">
            x
          </div>
          <div className="Modal-content">{this.props.children}</div>
        </div>) : (
          <div>{this.props.children}</div>
        )}
      </div>
    )
  }
}
