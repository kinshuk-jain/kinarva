import React from 'react';
import { SearchUser } from '../SearchUser';
import '../common.css'

export class UploadDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: window.File && window.FileReader && window.FileList ? '' : 'Your browser does not support file upload. Please use a different browser',
      filesUploaded: []
    }
  }

  fileValidation = (e) => {
    if (!this.fileInput) {
      this.setState({
        error: 'Technical error! Please try again'
      });
      return;
    }

    const files = this.fileInput.files;
    let filesUploaded = []
    if (files.length > 5) {
      this.setState({
        error: 'Too many files. Cannot upload more than 5 files at a time!'
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if(files[i].size > 25000000) {
        this.setState({
          error: 'One or more files greater than 25MB in size!'
        });
        return;
      }
      filesUploaded.push(files[i].name)
    }
    this.setState({
      filesUploaded
    })
  }

  renderFile(name) {
    return (
      <ul className="FileList-container">
        <li className="FileList-file-wrapper">
          <div className="FileList-file-name">
          <div className="FileList-file-name-label">{name}</div>
            <div className="FileList-file-name-cross">x</div>
          </div>
          <progress className="FileList-file-progress" value="0" max="100" />
        </li>
      </ul>
    )
  }

  render() {
    const { filesUploaded } = this.state;
    return (
      <div>
        <div className="user-input-field">
          <p className="user-input-field-input">Upload User</p>
        </div>
        <div className="user-input-field">
          <SearchUser ref={el => this.search = el} tabIndex="1" />
        </div>
        <div className="user-input-field">
          <select tabIndex="2" className="user-input-select">
            <option value='audit-report'>Audit report</option>
            <option value='finance-report'>Finance report</option>
            <option value='gullu-report'>Gullu report</option>
          </select>
        </div>
        <div className="user-input-field">
          <input style={{ width: '280px' }} tabIndex="3" placeholder="year" className="user-input-field-input" />
        </div>
        <div className="user-input-field">
          <input
            ref={el => this.fileInput = el}
            style={{ width: '280px' }}
            tabIndex="4"
            type="file"
            placeholder="upload"
            onChange={this.fileValidation}
            className="user-input-field-input"
            multiple
          />
        </div>
        {
          filesUploaded.map(name => this.renderFile(name))
        }
        <div className="user-input-field">
          <button tabIndex="5" className="user-input-field-button">Submit</button>
        </div>
      </div>
    )
  }
}
