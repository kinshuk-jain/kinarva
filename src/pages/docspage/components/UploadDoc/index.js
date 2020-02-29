import React from 'react';
import '../common.css'

export class UploadDoc extends React.Component {
  render() {
    return (
      <div>
        <div className="user-input-field">
          <p className="user-input-field-input">Upload User</p>
        </div>
        <div className="user-input-field">
          <input placeholder="name *" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <select className="user-input-select">
            <option value='audit-report'>Audit report</option>
            <option value='finance-report'>Finance report</option>
            <option value='gullu-report'>Gullu report</option>
          </select>
        </div>
        <div className="user-input-field">
          <input placeholder="year" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <input type="file" placeholder="upload" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <button className="user-input-field-button">Submit</button>
        </div>
      </div>
    )
  }
}
