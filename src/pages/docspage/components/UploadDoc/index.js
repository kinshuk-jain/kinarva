import React from 'react';
import { SearchUser } from '../SearchUser';
import { storage } from '../../../../utils/storage';
import { fetchApi } from '../../../../utils/fetch';
import '../common.css'

export class UploadDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: window.File && window.FileReader && window.FileList ? '' : 'Your browser does not support file upload. Please use a different browser',
      filesUploaded: [],
      uploadResponses: Array(5).fill(undefined)
    };
    this.progressBars = [];
  }

  componentWillUnmount() {
    // if form has not been submitted
    // abort xhr reqeusts and tell serveer to delete files
    // if form submitted do nothing
  }

  submitHandler = () => {
    // upload data to backend on submit
    // do not stop loading till all files are loaded
    // and data is submitted
    // close modal after data is submitted
    // abort submit also if files not uploaded and user closes modal
  }

  fileValidation = () => {
    if (!this.fileInput) {
      this.setState({
        error: 'Technical error! Please try again'
      });
      return;
    }

    const { filesUploaded, uploadResponses } = this.state;

    // cannot upload same file twice
    const files = Array.from(this.fileInput.files)
      .filter(file => filesUploaded.every(f => {
        if (!f)
          return true;
        return f.name !== file.name
      }));

    if ((files.length + filesUploaded.length) > 5) {
      this.setState({
        error: 'Too many files. Cannot upload more than 5 files at a time!'
      });
      return;
    }

    let formData;
    let xhr;

    // TODO: before file uploading begins we must check whether access token
    // has not expired
    // env vars
    for (let i = 0; i < files.length; i++) {
      // find position where file can go in filesUploaded
      let index = filesUploaded.findIndex(v => v === null || v === undefined);
      index = index > -1 ? index : filesUploaded.length;
      // return if file size is more than 25MB
      if(files[i].size > 25000000) {
        this.setState({
          error: 'One or more files greater than 25MB in size!'
        });
        return;
      }

      // create a formData to upload file
      formData = new FormData()
      formData.append(`file${i+1}`, files[i]);

      // send file
      xhr = new XMLHttpRequest();
      xhr.timeout = 60000; // time in milliseconds
      xhr.open('POST', 'http://localhost:8080/upload-file', true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Authorization', `Bearer ${storage.getItem('accessToken')}`);
      xhr.upload.onprogress = ((key) => (e) => {
        if (e.lengthComputable) {
          this.progressBars[key].value = 100 * (e.loaded/e.total);
        }
      })(index);
      xhr.upload.onloadend = ((key) => (e) => {
        if (e.lengthComputable && e.loaded === e.total) {
          uploadResponses.splice(key, 1, 'ok');
        }
        else {
          uploadResponses.splice(key, 1, 'notok');
        }
        this.setState({
          uploadResponses,
        });
      })(index);
      xhr.send(formData);

      // update filesUploaded array
      filesUploaded[index] = {
        name: files[i].name,
        xhr,
      };
    }

    this.fileInput.value = '';

    // update state
    this.setState({
      filesUploaded,
      error: ''
    });
  }

  stopUploadHandler = (i) => {
    const { filesUploaded, uploadResponses } = this.state;
    filesUploaded[i].xhr.abort();
    filesUploaded[i] = null;
    uploadResponses[i] = '';
    this.setState({
      filesUploaded,
      uploadResponses
    });
  }

  renderFile(name, i) {
    const { uploadResponses } = this.state;
    return (
      <ul key={i} className="FileList-container">
        <li className="FileList-file-wrapper">
          <div className="FileList-file-name">
          <div className="FileList-file-name-label">{name}</div>
            {uploadResponses[i] === 'ok'
              ? <div style={{ cursor: 'default', color: 'green' }} className="FileList-file-name-cross">&#10004;</div>
              : <div title="remove file" onClick={() => this.stopUploadHandler(i)} className="FileList-file-name-cross">x</div>
            }
          </div>
          <progress ref={el => this.progressBars[i] = el} className="FileList-file-progress" value="0" max="100" />
          {
            uploadResponses[i] === 'notok' && <div style={{ color: 'red' }} className="FileList-file-name-label">Upload failed. Please retry</div>
          }
        </li>
      </ul>
    )
  }

  render() {
    const { filesUploaded, error } = this.state;
    return (
      <div>
        <div className="user-input-field">
          <p className="user-input-field-input">Upload User</p>
        </div>
        {error && <div className="user-input-field">
          <p className="user-error-message">{error}</p>
        </div>}
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
          <label
            htmlFor="file-upload"
            className="File-upload-label"
          >
            Upload Files <i>(Max 5, less than 25MB)</i>
          </label>
          <input
            tabIndex="4"
            id="file-upload"
            ref={el => this.fileInput = el}
            style={{ width: '280px', display: 'none' }}
            type="file"
            placeholder="upload"
            onChange={this.fileValidation}
            multiple
          />
        </div>
        {
          filesUploaded.map((v, i) => {
            if (v === undefined || v === null)
              return null;
            return this.renderFile(v.name, i)
          })
        }
        <div className="user-input-field">
          <button onClick={this.submitHandler} tabIndex="5" className="user-input-field-button">Submit</button>
        </div>
      </div>
    )
  }
}
