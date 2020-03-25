import React from 'react'
import PropTypes from 'prop-types'
import supportsPassive from '../../../../utils/passive-events'
import './fileInfo.css'

export class FileInfo extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    sticky: false
  }

  componentDidMount() {
    window.addEventListener('scroll', () => {
      const y = window.pageYOffset || document.documentElement.scrollTop
      if (y > 160) {
        return this.setState({
          sticky: true
        })
      }
      this.setState({
        sticky: false
      })
    }, supportsPassive ? { passive: true } : false)
  }

  getFileSize = (sizeInBytes) => {
    let byte = sizeInBytes && sizeInBytes.length
    let size = +sizeInBytes
    size = isNaN(size) ? 0 : size
    let extension = ''
    switch(true) {
      case byte >=3 && byte < 6: extension = parseFloat(size/1000).toFixed(2) + ' KB'; break;
      case byte >=6: extension = parseFloat(size/1000000).toFixed(2) + ' MB'; break;
      default: extension = size + ' B';
    }
    return extension
  }

  getFileType = (type) => {
    const docTypeObj = {
      'audit-report': 'Audit Report',
      'finance-report': 'Finance Report',
      'abc-report': 'ABC Report'
    }
    return docTypeObj[type]
  }

  getDate = (dateStr) => {
    return new Date(+dateStr).toUTCString()
  }

  renderFile(f = {}, i) {
    return (
      <div className="File-data" key={i}>
        <label className="File-info-label" htmlFor={`info-label-${i}`}>
          <span>i</span>
        </label>
        <input style={{ display: 'none' }} type="checkbox" id={`info-label-${i}`} />
        <div>
          <span className="File-data-label">Name</span>
          <span title={f.docName} className="File-data-name">{f.docName || 'N/A'}</span>
          <span className="File-data-label">Created by</span>
          <span title={f.createdBy} className="File-data-createdBy">{f.createdBy || 'Unkown'}</span>
          <div className="File-data-type">
            <span className="File-data-label">Type</span>
            <span title={this.getFileType(f.docType)} className="">{this.getFileType(f.docType) || 'N/A'}</span>
          </div>
          <div className="File-data-size">
            <span className="File-data-label">Size</span>
            <span className="">{this.getFileSize(f.size)}</span>
          </div>
        </div>
        <div className="File-metadata">
          <div className="File-metadata-label">
            <span className="">Last accessed by: </span>
            <span title={f.lastAccessedBy} className="">{f.lastAccessedBy || 'Unkown'}</span>
          </div>
          <div className="File-metadata-label">
            <span className="">Last accessed on: </span>
            <span title={f.lastAccessedOn} className="">{f.lastAccessedOn || 'Unkown'}</span>
          </div>
          <div className="File-metadata-label">
            <span className="">Created on: </span>
            <span title={this.getDate(f.dateCreated)} className="">{this.getDate(f.dateCreated)}</span>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { sticky } = this.state
    const { data = [] } = this.props
    return (
      <div className="File-container">
        <div className={`File-data-title ${sticky? 'sticky' : ''}`}>
          <span className="File-data-name">Name</span>
          <span className="File-data-createdBy">Created By</span>
          <span className="File-data-type">Type</span>
          <span className="File-data-size">Size</span>
        </div>
        <div className="File-data-container">
          {
            data.map((f, i) => this.renderFile(f, i))
          }
        </div>
      </div>
    )
  }
}
