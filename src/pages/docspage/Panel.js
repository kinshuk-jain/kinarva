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
import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      showUploadDocModal: false,
      showLogoutModal: false,
      data: [],
      iframeSrc: '',
      fileName: '',
      fileType: '',
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

  uploadDocHandler = (e) => {
    this.setState({
      showUploadDocModal: !this.state.showUploadDocModal,
      showMenu: false,
    })
  }

  iframeModalHandler = (iframeSrc = '', name, type) => {
    this.setState({
      iframeSrc,
      fileName: name,
      fileType: type,
      showMenu: false,
    })
  }

  closeUploadUserModal = () => {
    this.setState({
      showUploadDocModal: false,
    })
  }

  closeIframeModal = () => {
    this.setState({
      iframeSrc: '',
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
      loading: true
    })

    await fetchApi('/load-user?q=0', {
      method: 'POST',
    })
      .then((r) => {
        if (this._isMounted) {
          storage.setItem('role', r.role)
          if(r.role === 'owner') {
            this.ownerRole = true
            this.prefillUser = r.prefillUser
          }
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
        {this.ownerRole && <div
          onClick={this.uploadDocHandler}
          className="Panel-menu-dropdown-item"
        >
          Upload
        </div>}
        {this.ownerRole && <div style={{ borderTop: '1px solid #efefef', width: '100%' }} /> }
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
      return <iframe className="Panel-FileViewer-text" src={iframeSrc} />
    } else {
      return <iframe className="Panel-FileViewer-iframe" src={iframeSrc} />
    }
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
      fileName,
      fileType,
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
              <FileInfo data={data} showFile={this.iframeModalHandler} />
            )}
          </div>
        </div>
        {showUploadDocModal && (
          <Modal onClose={this.closeUploadUserModal}>
            <UploadDoc onClose={this.closeUploadUserModal} prefillValue={this.prefillUser} />
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
        {iframeSrc && (
          <Modal fullModal onClose={this.closeIframeModal}>
            <div>
              <div className="Panel-FileViewer-Header">
                <span className="Panel-FileViewer-Close">X</span>
                <span className="Panel-FileViewer-FileName">{fileName}</span>
                <a href={iframeSrc} download={fileName}>
                  Download
                </a>
              </div>
              {this.renderFileViewer(fileType, fileName)}
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

export default PanelPage
