import React from 'react';
import './modal.css'

export class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
  }

  render() {
    return (
      <div onClick={this.props.onClose} className="Modal-parent-container">
        <div onClick={this.props.onClose} className="Modal-cross-button" />
        <div onClick={(e) => e.stopPropagation()} className="Modal-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}
