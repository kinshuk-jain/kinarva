import React, { Component } from 'react'
import { fetchApi } from '../../utils/fetch';
import Loader from '../../components/loader';
import gear from '../../icons/gear.svg'
import { List, ListItem } from '../../components/list';
import { Tabs, TabItem } from '../../components/tabs';
import { Modal } from '../../components/modal';
import { CreateUser } from './components/CreateUser';
import { UploadDoc } from './components/UploadDoc';
import { LoadUser } from './components/LoadUser';
import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showCreateUserModal: false,
      showUploadDocModal: false,
      showLoadUserModal: false,
      data: {}
    };
  }

  isEmpty = (obj) => {
    for(let prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }

  createUserHandler = (e) => {
    this.setState({
      showCreateUserModal: !this.state.showCreateUserModal,
      showMenu: false
    })
  }

  uploadDocHandler = (e) => {
    this.setState({
      showUploadDocModal: !this.state.showUploadDocModal,
      showMenu: false
    })
  }

  loadUserModalHandler = () => {
    this.setState({
      showLoadUserModal: !this.state.showLoadUserModal,
      showMenu: false
    })
  }

  closeUploadUserModal = () => {
    this.setState({
      showUploadDocModal: false
    })
  }

  closeCreateUserModal = () => {
    this.setState({
      showCreateUserModal: false
    })
  }

  closeLoadUserModal = () => {
    this.setState({
      showLoadUserModal: false
    })
  }

  showMenu = () => {
    this.setState({
      showMenu: !this.state.showMenu
    })
  }

  async componentDidMount() {
    if (true || window.kinarvaStore && window.kinarvaStore.accessToken) {
      try {
        // fetch doc data from backend and put it in state
        this.setState({
          loading: false
        })
      } catch(e) {
        window.kinarvaStore.accessToken = '';
        this.props.history.push('/');
      }
    } else {
      window.location.href = '/'
    }
  }

  renderMenu() {
    return (
      <div className="Panel-menu-dropdown">
        <div onClick={this.createUserHandler} className="Panel-menu-dropdown-item">
          Create User
        </div>
        <div onClick={this.uploadDocHandler} className="Panel-menu-dropdown-item">
          Upload
        </div>
        <div onClick={this.loadUserModalHandler} className="Panel-menu-dropdown-item">
          Load user
        </div>
        <div style={{ borderTop: '1px solid #efefef', width: '100%' }}/>
        <div className="Panel-menu-dropdown-item">
          Logout
        </div>
      </div>
    );
  }

  render() {
    const {
      loading,
      data,
      showCreateUserModal,
      showMenu,
      showUploadDocModal,
      showLoadUserModal
    } = this.state;

    const { history } = this.props;

    return loading ? <Loader /> : (
      <div className="Panel">
        <div className="Panel-header">
          <div className="Panel-logo">Kinarva.</div>
          <button className="Panel-menu" onClick={this.showMenu}>
            <img className="Panel-menu-image" src={gear} alt="menu" onClick={() => {}} />
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
            {
              this.isEmpty(data)
              ? (
                  <div className="Panel-empty-message">
                    Sorry there is nothing here right now
                  </div>
                )
              : null
            }
          </div>
        </div>
        {showCreateUserModal &&
          <Modal onClose={this.closeCreateUserModal}>
            <CreateUser history={history} />
          </Modal>
        }
        {showUploadDocModal &&
          <Modal onClose={this.closeUploadUserModal}>
            <UploadDoc />
          </Modal>
        }
        {showLoadUserModal &&
          <Modal onClose={this.closeLoadUserModal}>
            <LoadUser />
          </Modal>
        }
      </div>
    );
  }
}

export default PanelPage;
