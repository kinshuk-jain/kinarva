import React, { Component } from 'react'
import { fetchApi } from '../../utils/fetch'
import Loader from '../../components/loader'
import gear from '../../icons/gear.svg'
import { List, ListItem } from '../../components/list'
import { Tabs, TabItem } from '../../components/tabs'
import { Modal } from '../../components/modal'
import { CreateUser } from './components/CreateUser'
import { UploadDoc } from './components/UploadDoc'
import { storage } from '../../utils/storage'
import { LoadUser } from './components/LoadUser'
import { FileInfo } from './components/FileInfo'
import { ALLOWED_MAGIC_NUMBERS } from '../../constants'

import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      loadingFile: false,
      showCreateUserModal: false,
      showUploadDocModal: false,
      showLoadUserModal: false,
      showLogoutModal: false,
      data: [],
      iframeSrc: '',
      fileName: '',
      fileType: '',
      currentValue: 0,
      maxValue: 0
    }
    this.cancelReadingStream = false
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
    this.cancelReadingStream = false
    this.setState({
      loadingFile: true,
      fileName: name,
      showMenu: false,
      maxValue: size
    })
    fetchApi(`/download?q=${docid}`, {}, true)
      .then(async (r) => {
        const reader = r.body.getReader()
        let chunks = []
        let receivedLength = 0
        while(true) {
          const { done, value } = await reader.read()   
          if (done || this.cancelReadingStream) break
          chunks.push(value)
          receivedLength += value.length
          this.setState({
            currentValue: receivedLength,
          })
        }
        const blob = new Blob(chunks, { type: r.headers.get('Content-Type') })
        const first4Bytes = new Uint8Array((chunks[0] || []).slice(0, 4))
        const magicNumberInHex = first4Bytes.reduce((acc, val) => {
          return acc += val.toString(16)
        }, '')

        if (!ALLOWED_MAGIC_NUMBERS.includes(magicNumberInHex)) {
          // the file may contain virus
          console.log('file may have virus')
        }
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob)
          return
        }
        const iframeSrc = window.URL.createObjectURL(blob)
        const viewportWidth = Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        )
        if (viewportWidth > 720) {
          this.setState({
            iframeSrc,
            fileType: blob.type
          })
        } else {
          const anchor = document.createElement('a')
          anchor.href = iframeSrc
          anchor.download = name
          anchor.click()
          this.closeIframeModal()
        }
      })
      .catch(() => {
        // show error
      })
  }

  createUserHandler = (e) => {
    this.setState({
      showCreateUserModal: !this.state.showCreateUserModal,
      showMenu: false,
    })
  }

  uploadDocHandler = (e) => {
    this.setState({
      showUploadDocModal: !this.state.showUploadDocModal,
      showMenu: false,
    })
  }

  loadUserModalHandler = () => {
    this.setState({
      showLoadUserModal: !this.state.showLoadUserModal,
      showMenu: false,
    })
  }

  closeUploadUserModal = () => {
    // TODO: fetch data for currently loaded user again
    this.setState({
      showUploadDocModal: false,
    })
  }

  closeIframeModal = () => {
    this.cancelReadingStream = true
    this.setState({
      loadingFile: false,
      iframeSrc: '',
      fileName: '',
      fileType: ''
    })
  }

  closeCreateUserModal = () => {
    this.setState({
      showCreateUserModal: false,
    })
  }

  closeLoadUserModal = () => {
    this.setState({
      showLoadUserModal: false,
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
      loading: true
    })
    await fetchApi('/load-user?q=0', {
      method: 'POST',
    })
      .then((r) => {
        if (this._isMounted) {
          if(!r.role || r.role !== 'admin') {
            window.location.href = '/panel'
          }
          storage.setItem('role', r.role)
          this.setData(r.results)
          this.setState({
            loading: false
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
        <div
          onClick={this.createUserHandler}
          className="Panel-menu-dropdown-item"
        >
          Create User
        </div>
        <div
          onClick={this.uploadDocHandler}
          className="Panel-menu-dropdown-item"
        >
          Upload
        </div>
        <div
          onClick={this.loadUserModalHandler}
          className="Panel-menu-dropdown-item"
        >
          Load user
        </div>
        <div style={{ borderTop: '1px solid #efefef', width: '100%' }} />
        <div onClick={this.logoutHandler} className="Panel-menu-dropdown-item">
          Logout
        </div>
      </div>
    )
  }

  renderFileViewer(type, fileName) {
    const { iframeSrc } = this.state
    if (type.startsWith('image/')) {
      return (
        <img
          alt={fileName}
          className="Panel-FileViewer-image"
          src={iframeSrc}
        />
      )
    } else if (type.startsWith('text/')) {
      return <iframe title="fileviewer" className="Panel-FileViewer-text" src={iframeSrc} />
    } else {
      return <iframe title="fileviewer" className="Panel-FileViewer-iframe" src={iframeSrc} />
    }
  }

  render() {
    const {
      loading,
      data = [],
      showCreateUserModal,
      showMenu,
      showUploadDocModal,
      showLoadUserModal,
      showLogoutModal,
      logoutError,
      iframeSrc,
      loadingFile,
      fileName,
      fileType,
      currentValue,
      maxValue
    } = this.state
    const { history } = this.props

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
          <TabItem label="Audit Report" />
          <TabItem label="Financial Report" />
          <TabItem label="Income Tax Return" />
          <TabItem label="ddd" />
        </Tabs>
        <div className="Panel-content">
          <div className="Left-pane">
            <List className="Panel-list">
              <ListItem> 1234 </ListItem>
              <ListItem> 123 </ListItem>
              <ListItem> 12345 </ListItem>
            </List>
          </div>
          <div className={`Right-pane ${data.length ? 'noBorder' : ''}`}>
            {this.isEmpty(data) ? (
              <div className="Panel-empty-message">
                Sorry there is nothing here right now
              </div>
            ) : (
              <FileInfo data={data} fileDownloadHandler={this.fileDownloadHandler} />
            )}
          </div>
        </div>
        {showCreateUserModal && (
          <Modal onClose={this.closeCreateUserModal}>
            <CreateUser onClose={this.closeCreateUserModal} history={history} />
          </Modal>
        )}
        {showUploadDocModal && (
          <Modal onClose={this.closeUploadUserModal}>
            <UploadDoc onClose={this.closeUploadUserModal} />
          </Modal>
        )}
        {showLoadUserModal && (
          <Modal onClose={this.closeLoadUserModal}>
            <LoadUser
              setData={this.setData}
              onClose={this.closeLoadUserModal}
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
                {iframeSrc && <a href={iframeSrc} download={fileName}>
                  Download
                </a>}
              </div>
              {iframeSrc ? this.renderFileViewer(fileType, fileName) : <progress className="Panel-FileViewer-progress" value={currentValue} max={maxValue} />}
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

export default PanelPage
