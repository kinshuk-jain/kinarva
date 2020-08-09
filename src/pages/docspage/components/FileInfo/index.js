import React from 'react'
import PropTypes from 'prop-types'
import supportsPassive from '../../../../utils/passive-events'
import filersData from '../../data/filters.json'
import './fileInfo.css'

export class FileInfo extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    fileDownloadHandler: PropTypes.func.isRequired,
    onLongPress: PropTypes.func,
  }

  state = {
    sticky: false,
    mouseDownTime: 0,
    mouseDownFile: -1,
  }

  onMouseDown = (i) => {
    this.setState({
      mouseDownTime: Date.now(),
      mouseDownFile: i,
    })
  }

  onMouseUp = () => {
    if (
      Date.now() - this.state.mouseDownTime > 3000 &&
      this.state.mouseDownFile >= 0
    ) {
      const f = this.props.data[this.state.mouseDownFile]
      typeof this.props.onLongPress === 'function' &&
        this.props.onLongPress(f.docName, f.docid)
    }
    this.setState({
      mouseDownTime: 0,
      mouseDownFile: -1,
    })
  }

  componentDidMount() {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.pageYOffset || document.documentElement.scrollTop
        if (y > 160) {
          return this.setState({
            sticky: true,
          })
        }
        this.setState({
          sticky: false,
        })
      },
      supportsPassive ? { passive: true } : false
    )
  }

  getFileSize = (sizeInBytes) => {
    let byte = sizeInBytes && sizeInBytes.length
    let size = +sizeInBytes
    size = isNaN(size) ? 0 : size
    let extension = ''
    switch (true) {
      case byte >= 3 && byte < 6:
        extension = parseFloat(size / 1000).toFixed(2) + ' KB'
        break
      case byte >= 6:
        extension = parseFloat(size / 1000000).toFixed(2) + ' MB'
        break
      default:
        extension = size + ' B'
    }
    return extension
  }

  getFileType = (type) => {
    const filter = filersData.filters.find((filter) => filter.value === type)
    return filter && filter.label
  }

  getDate = (dateStr) => {
    return dateStr && new Date(+dateStr).toUTCString()
  }

  renderFile(f = {}, i) {
    const { fileDownloadHandler } = this.props
    return (
      <div
        className="File-data"
        key={i}
        onMouseDown={() => this.onMouseDown(i)}
        onMouseUp={this.onMouseUp}
      >
        <label className="File-info-label" htmlFor={`info-label-${i}`}>
          <span>i</span>
        </label>
        <input
          style={{ display: 'none' }}
          type="checkbox"
          id={`info-label-${i}`}
        />
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => fileDownloadHandler(f.docid, f.docName, +f.size)}
        >
          <span className="File-data-label">Name</span>
          <span title={f.docName} className="File-data-name">
            {f.docName || 'N/A'}
          </span>
          <span className="File-data-label">Created by</span>
          <span title={f.createdBy} className="File-data-createdBy">
            {f.createdBy || 'Unkown'}
          </span>
          <div className="File-data-type">
            <span className="File-data-label">Type</span>
            <span title={this.getFileType(f.metadata.docType)} className="">
              {this.getFileType(f.metadata.docType) || 'N/A'}
            </span>
          </div>
          <div className="File-data-year">
            <span className="File-data-label">Year</span>
            <span title={f.createdBy}>{f.metadata.year || 'Unkown'}</span>
          </div>
          <div className="File-data-size">
            <span className="File-data-label">Size</span>
            <span>{this.getFileSize(f.size)}</span>
          </div>
        </div>
        <div className="File-metadata">
          <div className="File-metadata-label">
            <span className="">Last accessed by: </span>
            <span title={f.lastAccessedBy} className="">
              {f.lastAccessedBy || 'Unkown'}
            </span>
          </div>
          <div className="File-metadata-label">
            <span className="">Last accessed on: </span>
            <span title={f.lastAccessedOn} className="">
              {this.getDate(f.lastAccessedOn) || 'Unkown'}
            </span>
          </div>
          <div className="File-metadata-label">
            <span className="">Created on: </span>
            <span title={this.getDate(f.dateCreated)} className="">
              {this.getDate(f.dateCreated)}
            </span>
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
        <div className={`File-data-title ${sticky ? 'sticky' : ''}`}>
          <span className="File-data-name">Name</span>
          <span className="File-data-createdBy">Created By</span>
          <span className="File-data-type">Type</span>
          <span className="File-data-year">Year</span>
          <span className="File-data-size">Size</span>
        </div>
        <div className="File-data-container">
          {data.map((f, i) => this.renderFile(f, i))}
        </div>
      </div>
    )
  }
}
