import React from 'react';
import '../common.css'

export const LoadUser = () => {
  return (
    <div>
      <div className="user-input-field">
        <p className="user-input-field-input">Load User</p>
      </div>
      <div className="user-input-field">
        <input placeholder="name" className="user-input-field-input" />
      </div>
      <div className="user-input-field">
        <button className="user-input-field-button">Submit</button>
      </div>
    </div>
  );
}
