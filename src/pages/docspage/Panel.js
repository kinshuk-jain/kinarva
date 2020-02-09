import React, { Component } from 'react'
import { fetchApi } from '../../utils/fetch';
import Loader from '../../components/loader';
import gear from '../../icons/gear.svg'
import { List, ListItem } from '../../components/list';
import { Tabs, TabItem } from '../../components/tabs';
import './Panel.css'

class PanelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
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

  render() {
    const { loading, data } = this.state;

    return loading ? <Loader /> : (
      <div className="Panel">
        <div className="Panel-header">
          <div className="Panel-logo">Kinarva.</div>
          <button className="Panel-menu">
            <img className="Panel-menu-image" src={gear} alt="menu" onClick={() => {}} />
          </button>
          <div className="Panel-menu-dropdown">
            <div className="Panel-menu-dropdown-item">
              Create User
            </div>
            <div className="Panel-menu-dropdown-item">
              Upload
            </div>
            <div className="Panel-menu-dropdown-item">
              Load user
            </div>
            <div style={{ borderTop: '1px solid #efefef', width: '100%' }}/>
            <div className="Panel-menu-dropdown-item">
              Logout
            </div>
          </div>
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
      </div>
    );
  }
}

export default PanelPage;
