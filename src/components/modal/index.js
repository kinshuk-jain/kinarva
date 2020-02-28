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
        <div onClick={(e) => e.stopPropagation()} className="Modal-container">
          <div onClick={this.props.onClose} className="Modal-cross-button">x</div>
          <div className="Modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
