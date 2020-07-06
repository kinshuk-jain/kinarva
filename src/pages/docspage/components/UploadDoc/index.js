import React from 'react'
import PropTypes from 'prop-types'
import { SearchUser } from '../SearchUser'
import { storage } from '../../../../utils/storage'
import { fetchApi } from '../../../../utils/fetch'
import { refreshTokenOnExpiry } from '../../../../utils/refresh-token-on-expiry'
import { Spinner } from '../../../../components/spinner'
import { DISALLOWED_MIME_TYPES } from '../../../../constants'
import '../common.css'

const MAX_UPLOADABLE_FILES = 5
const FILE_SIZE_LIMIT = 25

export class UploadDoc extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    prefillValue: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this._isMounted = false
    this.state = {
      error:
        window.File && window.FileList
          ? ''
          : 'Your browser does not support file upload. Please use a different browser',
      filesUploaded: [],
      uploadResponses: Array(MAX_UPLOADABLE_FILES).fill(undefined),
      submitted: false,
      successfulSubmit: false,
      noSelectError: false,
      noYearError: false,
      noFileError: false,
      noSearchError: false,
    }
    this.progressBars = []
    this.yearInput = React.createRef()
    this.fileTypeInput = React.createRef()
    this.search = React.createRef()
  }

  static getDerivedStateFromError() {
    this.progressBars = []
    return {
      error: 'Something went wrong! Please reload the page and try again.',
      filesUploaded: [],
      uploadResponses: Array(MAX_UPLOADABLE_FILES).fill(undefined),
      submitted: false,
      successfulSubmit: false,
      noSelectError: false,
      noYearError: false,
      noFileError: false,
      noSearchError: false,
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    const { filesUploaded } = this.state
    filesUploaded.forEach((f) => {
      if (f) {
        f.xhr.abort()
      }
    })
    this._isMounted = false
  }

  submitData = () => {
    const { username } = this.search.current.getSelectedData()
    const year = this.yearInput.current.value
    const docType = this.fileTypeInput.current.value
    return fetchApi('/upload-file/submit', {
      method: 'POST',
      body: JSON.stringify({
        username,
        year,
        docType,
        numOfFilesUploaded: this.state.uploadResponses.filter((v) => v === 'ok')
          .length,
      }),
    })
      .then(() => {
        this.progressBars = []
        this._isMounted &&
          this.setState({
            submitted: false,
            successfulSubmit: true,
            filesUploaded: [],
            error: '',
            uploadResponses: Array(MAX_UPLOADABLE_FILES).fill(undefined),
          })
        setTimeout(() => {
          this._isMounted &&
            this.setState({
              successfulSubmit: false,
            })
        }, 5000)
      })
      .catch((e) => {
        this._isMounted &&
          this.setState({
            submitted: false,
            error:
              e.response.error ||
              'Error submitting information. Please try again!',
          })
      })
  }

  submitHandler = () => {
    const { uploadResponses, filesUploaded } = this.state
    if (!window.File || !window.FileList) {
      return
    }

    if (
      !filesUploaded.filter((v) => !!v).length ||
      !this.search.current.getSelectedData().username ||
      !this.yearInput.current.value ||
      !this.yearInput.current.value.trim() ||
      !this.fileTypeInput.current.value
    ) {
      this.setState({
        noFileError: !filesUploaded.filter((v) => !!v).length ? true : false,
        noYearError:
          !this.yearInput.current.value || !this.yearInput.current.value.length === 4
            ? true
            : false,
        noSearchError: !this.search.current.getSelectedData().username
          ? true
          : false,
        noSelectError: !this.fileTypeInput.current.value ? true : false,
      })

      setTimeout(() => {
        this._isMounted &&
          this.setState({
            noFileError: false,
            noYearError: false,
            noSearchError: false,
            noSelectError: false,
          })
      }, 5000)
      return
    }

    // check if any file could not be uploaded
    if (uploadResponses.some((v) => v !== 'ok')) {
      this.setState({
        error:
          'There was a problem with one or more of your files. Please remove that file or re-upload it before submitting',
      })
      return
    }

    this.setState({
      submitted: true,
    })

    // if all files have been uploaded
    if (
      filesUploaded.filter((v) => !!v).length ===
      uploadResponses.filter((v) => v === 'ok').length
    ) {
      this.submitData()
    } else {
      // promisify all xhr and wait for their completion
      // eslint-disable-next-line
      Promise.all(
        filesUploaded.map((f) => {
          if (
            f === null ||
            f === undefined ||
            (f.xhr.status >= 200 && f.xhr.status < 300)
          ) {
            return Promise.resolve()
          }
          new Promise((res, rej) => {
            f.xhr.onload = function () {
              if (this.status >= 200 && this.status < 300) {
                res(this.response)
                return
              }
              rej(this.response)
            }
            f.xhr.onerror = function () {
              rej(this.reponse)
            }
          })
        })
      )
        .then(() => {
          return this.submitData()
        })
        .catch(() => {
          this._isMounted &&
            this.setState({
              submitted: false,
              error: 'Something went wrong. Please try again!',
            })
        })
    }
  }

  yearValidation = value => {
    if (!/^[0-9]{0,4}$/.test(value)) return
  }

  fileValidation = async () => {
    if (!window.File || !window.FileList) {
      return
    }
    if (!this.fileInput) {
      this.setState({
        error: 'Technical error! Please try again',
      })
      return
    }
    const { filesUploaded, uploadResponses } = this.state

    // cannot upload same file twice
    const files = Array.from(this.fileInput.files).filter((file) =>
      filesUploaded.every((f) => {
        if (!f) return true
        return f.name !== file.name
      })
    )

    if (files.length + filesUploaded.length > MAX_UPLOADABLE_FILES) {
      this.setState({
        error: `Too many files. Cannot upload more than ${MAX_UPLOADABLE_FILES} files at a time!`,
      })
      return
    }

    let formData
    let xhr

    await refreshTokenOnExpiry()

    for (let i = 0; i < files.length; i++) {
      // find position where file can go in filesUploaded
      let index = filesUploaded.findIndex((v) => v === null || v === undefined)
      index = index > -1 ? index : filesUploaded.length
      // return if file size is more than FILE_SIZE_LIMIT in MB
      if (files[i].size > FILE_SIZE_LIMIT * 1000000) {
        this.setState({
          error: `One or more files greater than ${FILE_SIZE_LIMIT}MB in size!`,
        })
        return
      }

      if (
        DISALLOWED_MIME_TYPES.some((mime) => files[i].type.search(mime) !== -1)
      ) {
        this.setState({
          error: `${files[i].name.slice(
            ((files[i].name.lastIndexOf('.') - 1) >>> 0) + 2
          )} extension not allowed`,
        })
        return
      }

      // create a formData to upload file
      formData = new FormData()
      formData.append(`file${i + 1}`, files[i])

      // send file
      xhr = new XMLHttpRequest()
      xhr.timeout = 60000 // time in milliseconds
      xhr.open('POST', `${process.env.REACT_APP_API_URL}/upload-file`, true)
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${storage.getItem('accessToken')}`
      )
      xhr.upload.onprogress = ((key) => (e) => {
        if (e.lengthComputable) {
          this.progressBars[key].value = 100 * (e.loaded / e.total)
        }
      })(index)
      xhr.onloadend = ((key) => (e) => {
        const status = e.target.status
        if (status >= 200 && status < 300) {
          uploadResponses.splice(key, 1, 'ok')
        } else {
          uploadResponses.splice(key, 1, JSON.parse(e.target.response || "{}").error || 'notok')
        }
        this._isMounted &&
          this.setState({
            uploadResponses,
          })
      })(index)
      xhr.send(formData)

      // update filesUploaded array
      filesUploaded[index] = {
        name: files[i].name,
        xhr,
      }
    }

    this.fileInput.value = ''

    // update state
    this.setState({
      filesUploaded,
      error: '',
    })
  }

  stopUploadHandler = (i) => {
    const { filesUploaded, uploadResponses } = this.state
    filesUploaded[i].xhr.abort()
    filesUploaded[i] = null
    uploadResponses[i] = ''
    this.setState({
      filesUploaded,
      uploadResponses,
    })
  }

  renderFile(name, i) {
    const { uploadResponses } = this.state
    return (
      <ul key={i} className="FileList-container">
        <li className="FileList-file-wrapper">
          <div className="FileList-file-name">
            <div className="FileList-file-name-label">{name}</div>
            {uploadResponses[i] === 'ok' ? (
              <div
                style={{ cursor: 'default', color: 'green' }}
                className="FileList-file-name-cross"
              >
                &#10004;
              </div>
            ) : (
              <div
                title="remove file"
                onClick={() => this.stopUploadHandler(i)}
                className="FileList-file-name-cross"
              >
                x
              </div>
            )}
          </div>
          <progress
            ref={(el) => (this.progressBars[i] = el)}
            className="FileList-file-progress"
            value="0"
            max="100"
          />
          {uploadResponses[i] !== 'ok' && (
            <div style={{ color: 'red' }} className="FileList-file-name-label">
              { uploadResponses[i] === 'notok' ? 'Upload failed. Please retry' : uploadResponses[i] }
            </div>
          )}
        </li>
      </ul>
    )
  }

  render() {
    const {
      filesUploaded,
      error,
      submitted,
      successfulSubmit,
      noFileError,
      noSearchError,
      noSelectError,
      noYearError,
    } = this.state
    return (
      <div>
        <div className="user-input-field">
          <p className="Modal-title">Upload Documents</p>
        </div>
        {(error || successfulSubmit) && (
          <div className="user-input-field">
            <p
              className={`user-error-message ${
                successfulSubmit ? 'user-successfully-uploaded' : ''
              }`}
            >
              {successfulSubmit ? 'Successfully Uploaded!' : error}
            </p>
          </div>
        )}
        <div className="user-input-field">
          <SearchUser
            className={noSearchError ? 'error' : ''}
            disabled={submitted}
            ref={this.search}
            prefillValue={this.props.prefillValue}
            tabIndex="1"
          />
        </div>
        <div className="user-input-field">
          <select
            disabled={submitted}
            ref={this.fileTypeInput}
            tabIndex="2"
            className={`user-input-select ${noSelectError ? 'error' : ''}`}
          >
            <option value="">Select report type</option>
            <option value="audit-report">Audit report</option>
            <option value="finance-report">Finance report</option>
            <option value="gullu-report">Gullu report</option>
          </select>
        </div>
        <div className="user-input-field">
          <input
            ref={this.yearInput}
            disabled={submitted}
            style={{ width: '280px' }}
            onChange={this.yearValidation}
            tabIndex="3"
            placeholder="year (YYYY)"
            className={`user-input-field-input ${noYearError ? 'error' : ''}`}
          />
        </div>
        <div className="user-input-field">
          <label
            htmlFor="file-upload"
            className={`File-upload-label ${noFileError ? 'error' : ''}`}
          >
            Upload Files{' '}
            <i>{`(Max ${MAX_UPLOADABLE_FILES}, less than ${FILE_SIZE_LIMIT}MB)`}</i>
          </label>
          <input
            tabIndex="4"
            id="file-upload"
            ref={(el) => (this.fileInput = el)}
            style={{ width: '280px', display: 'none' }}
            type="file"
            placeholder="upload"
            onChange={this.fileValidation}
            multiple
            disabled={submitted}
          />
        </div>
        {filesUploaded.map((v, i) => {
          if (v === undefined || v === null) return null
          return this.renderFile(v.name, i)
        })}
        <div className="user-input-field">
          <button
            onClick={this.submitHandler}
            tabIndex="5"
            className="user-input-field-button"
          >
            {submitted ? <Spinner /> : 'Submit'}
          </button>
        </div>
      </div>
    )
  }
}
