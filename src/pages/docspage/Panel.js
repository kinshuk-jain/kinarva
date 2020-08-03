import React, { Component } from 'react'
import { fetchApi } from '../../utils/fetch'
import Loader from '../../components/loader'
import gear from '../../icons/gear.svg'
import { List, ListItem } from '../../components/list'
import { Tabs, TabItem } from '../../components/tabs'
import { Modal } from '../../components/modal'
import { UploadDoc } from './components/UploadDoc'
import { storage } from '../../utils/storage'
import { FileInfo } from './components/FileInfo'
import filtersData from './data/filters.json'
import { openOrSaveFile, readStream } from './utils'
import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      loadingFile: false,
      showUploadDocModal: false,
      showLogoutModal: false,
      data: [],
      iframeSrc: '',
      fileName: '',
      fileType: '',
      currentValue: 0,
      maxValue: 0,
      fileViewerMessage: undefined,
      activeTab: 0,
    }
  }

  isEmpty = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false
      }
    }
    return true
  }

  fileDownloadHandler = (docid, name, size) => {
    this.setState({
      loadingFile: true,
      fileName: name,
      showMenu: false,
      maxValue: size,
    })
    fetchApi(`/download?q=${docid}`, {}, true)
      .then(async (r) => {
        const fileType = r.headers.get('Content-Type')
        this.streamReader = r.body.getReader()
        const chunks = await readStream(this.streamReader, (length) =>
          this.setState({ currentValue: length })
        )
        const { fileHref, hasVirus } = this.state.loadingFile
          ? openOrSaveFile(chunks, name, fileType)
          : {}
        if (!fileHref && !hasVirus) {
          this.closeIframeModal()
        } else {
          this.setState({
            iframeSrc: fileHref,
            fileType,
            fileViewerMessage: hasVirus
              ? 'This file may contain a virus. It has been downloaded but not opened. Please open it only if you trust the source of the file, otherwise delete it.'
              : undefined,
          })
        }
      })
      .catch(() => {
        // show error
        this.setState({
          iframeSrc: undefined,
          fileViewerMessage: 'File could not be downloaded, please try again.',
        })
      })
  }

  closeIframeModal = () => {
    this.streamReader && this.streamReader.cancel()
    this.streamReader = undefined
    this.setState({
      loadingFile: false,
      iframeSrc: '',
      fileName: '',
      fileType: '',
      currentValue: 0,
      maxValue: 0,
      fileViewerMessage: undefined,
    })
  }

  uploadDocHandler = (e) => {
    this.setState({
      showUploadDocModal: !this.state.showUploadDocModal,
      showMenu: false,
    })
  }

  closeUploadUserModal = () => {
    this.setState({
      showUploadDocModal: false,
    })
  }

  showMenu = () => {
    this.setState({
      showMenu: !this.state.showMenu,
    })
  }

  setData = (data) => {
    this.setState({
      data,
    })
  }

  closeLogoutUserModal = () => {
    this.setState({
      showLogoutModal: false,
    })
  }

  logoutHandler = () => {
    this.setState({
      showLogoutModal: true,
      showMenu: false,
    })

    fetchApi('/logout', {
      method: 'POST',
    })
      .then(() => {
        storage.setItem('accessToken', '')
        storage.setItem('role', '')
        window.location.href = '/'
      })
      .catch((e) => {
        this.setState({
          logoutError: 'There was a problem logging you out. Please try again!',
        })
      })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async componentDidMount() {
    this._isMounted = true
    this.setState({
      loading: true,
    })

    await fetchApi('/load-user?q=0', {
      method: 'POST',
    })
      .then((r) => {
        if (this._isMounted) {
          storage.setItem('role', r.role)
          if (r.role === 'owner') {
            this.ownerRole = true
            this.prefillUser = r.prefillUser
          }
          this.setData(r.results)
          this.setState({
            loading: false,
          })
        }
      })
      .catch(() => {
        this._isMounted &&
          this.setState({
            loading: false,
            error: 'Could not load user. Please try again',
          })
      })
  }

  renderMenu() {
    return (
      <div className="Panel-menu-dropdown">
        {this.ownerRole && (
          <div
            onClick={this.uploadDocHandler}
            className="Panel-menu-dropdown-item"
          >
            Upload
          </div>
        )}
        {this.ownerRole && (
          <div style={{ borderTop: '1px solid #efefef', width: '100%' }} />
        )}
        <div onClick={this.logoutHandler} className="Panel-menu-dropdown-item">
          Logout
        </div>
      </div>
    )
  }

  renderFileViewer(type, fileName, fileViewerMessage) {
    const { iframeSrc } = this.state
    if (fileViewerMessage) {
      return (
        <div title="fileviewer" className="Panel-FileViewer-error">
          {fileViewerMessage}
        </div>
      )
    }
    if (type.startsWith('image/')) {
      return (
        <img
          alt={fileName}
          className="Panel-FileViewer-image"
          src={iframeSrc}
        />
      )
    } else if (type.startsWith('text/')) {
      return (
        <iframe
          title="fileviewer"
          className="Panel-FileViewer-text"
          src={iframeSrc}
        />
      )
    } else {
      return (
        <iframe
          title="fileviewer"
          className="Panel-FileViewer-iframe"
          src={iframeSrc}
        />
      )
    }
  }

  setActiveTab = (i) => {
    this.setState({
      activeTab: i,
    })
  }

  render() {
    const {
      loading,
      data = [],
      showMenu,
      showUploadDocModal,
      showLogoutModal,
      logoutError,
      iframeSrc,
      loadingFile,
      fileName,
      fileType,
      currentValue,
      maxValue,
      fileViewerMessage,
      activeTab,
    } = this.state

    return loading ? (
      <Loader />
    ) : (
      <div className="Panel">
        <div className="Panel-header">
          <div className="Panel-logo">Kinarva.</div>
          <button className="Panel-menu" onClick={this.showMenu}>
            <img
              className="Panel-menu-image"
              src={gear}
              alt="menu"
              onClick={() => {}}
            />
          </button>
          {showMenu && this.renderMenu()}
        </div>
        <Tabs>
          {filtersData.filters.map((filter, ind) => {
            return (
              <TabItem
                onClick={() => this.setActiveTab(ind)}
                key={ind}
                label={filter.label}
              />
            )
          })}
        </Tabs>
        <div className="Panel-content">
          <div className="Left-pane">
            <List className="Panel-list">
              {filtersData.filters[activeTab] &&
                filtersData.filters[
                  activeTab
                ].subfilters.map((subfilter, i) => (
                  <ListItem key={i}>{subfilter.label}</ListItem>
                ))}
            </List>
          </div>
          <div className={`Right-pane ${data.length ? 'noBorder' : ''}`}>
            {this.isEmpty(data) ? (
              <div className="Panel-empty-message">
                Sorry there is nothing here right now
              </div>
            ) : (
              <FileInfo
                data={data}
                fileDownloadHandler={this.fileDownloadHandler}
              />
            )}
          </div>
        </div>
        {showUploadDocModal && (
          <Modal onClose={this.closeUploadUserModal}>
            <UploadDoc
              onClose={this.closeUploadUserModal}
              prefillValue={this.prefillUser}
            />
          </Modal>
        )}
        {showLogoutModal && (
          <Modal onClose={this.closeLogoutUserModal}>
            {logoutError ? (
              <div>
                <div>{logoutError}</div>
                <button
                  className="Panel-logout-close-button"
                  onClick={this.closeLogoutUserModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <Loader className="Panel-logout-loader" />
              </div>
            )}
          </Modal>
        )}
        {loadingFile && (
          <Modal fullModal onClose={this.closeIframeModal}>
            <div>
              <div className="Panel-FileViewer-Header">
                <span className="Panel-FileViewer-Close">X</span>
                <span className="Panel-FileViewer-FileName">{fileName}</span>
                {iframeSrc && (
                  <a href={iframeSrc} download={fileName}>
                    Download
                  </a>
                )}
              </div>
              {iframeSrc || fileViewerMessage ? (
                this.renderFileViewer(fileType, fileName, fileViewerMessage)
              ) : (
                <progress
                  className="Panel-FileViewer-progress"
                  value={currentValue}
                  max={maxValue}
                />
              )}
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

export default PanelPage
