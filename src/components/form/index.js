import React, { Component } from 'react';
import { FormInput } from './formInput';
import './form.css';

const FormSubmit = ({ className = '', submitButtonText = '' }) => (
  <div className="user-input-field">
    <button type="submit" className={className}>{submitButtonText}</button>
  </div>
)

export class Form extends Component {
  static Input = FormInput;
  static Submit = FormSubmit;
  render() {
    <form onSubmit={this.props.onSubmit} method="POST">
      {this.props.children}
    </form>
  }
}
