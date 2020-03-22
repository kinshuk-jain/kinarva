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
import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      showCreateUserModal: false,
      showUploadDocModal: false,
      showLoadUserModal: false,
      showLogoutModal: false,
      data: {},
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
    this.setState({
      showUploadDocModal: false,
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

  async componentDidMount() {
    if (storage.getItem('accessToken')) {
      try {
        // fetch doc data from backend and put it in state
        this.setState({
          loading: false,
        })
      } catch (e) {
        /* failed to fetch doc data */
      }
    } else {
      storage.setItem('accessToken', '')
      window.location.href = '/'
    }
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

  render() {
    const {
      loading,
      data,
      showCreateUserModal,
      showMenu,
      showUploadDocModal,
      showLoadUserModal,
      showLogoutModal,
      logoutError,
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
          <TabItem label="ABd" />
          <TabItem label="ccc" />
          <TabItem label="bbb" />
          <TabItem label="ddd" />
        </Tabs>
        <div className="Panel-content">
          <div className="Left-pane">
            <List className="Panel-list">
              <ListItem> Avno </ListItem>
              <ListItem> Avnos </ListItem>
              <ListItem> Guddu </ListItem>
            </List>
          </div>
          <div className="Right-pane">
            {this.isEmpty(data) ? (
              <div className="Panel-empty-message">
                Sorry there is nothing here right now
              </div>
            ) : null}
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
            <LoadUser onClose={this.closeLoadUserModal} />
          </Modal>
        )}
        {showLogoutModal && (
          <Modal>
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
      </div>
    )
  }
}

export default PanelPage
