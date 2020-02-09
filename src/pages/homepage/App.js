import React, { Component } from 'react';
import jwtDecode from 'jwt-decode'
import openEye from '../../icons/open-eye.svg';
import closedEye from '../../icons/closed-eye.svg';
import { fetchApi, refreshAccessToken } from '../../utils/fetch';
import Loader from '../../components/loader';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      noUsername: false,
      noPassword: false,
      error: '',
      loading: true
    };
  }

  async componentDidMount() {
    if (window.kinarvaStore && window.kinarvaStore.accessToken) {
      try {
        const decoded = jwtDecode(window.kinarvaStore.accessToken);
        const currTime = new Date().getTime() / 1000;
        if (currTime >= decoded.exp) {
          const { token } = await refreshAccessToken();
          window.kinarvaStore.accessToken = token;
        }
        this.props.history.push('/panel');
      } catch(e) {
        window.location.reload(true);
      }
    }
    this.setState({
      loading: false
    })
  }

  componentWillUnmount() {
    this.setState({
      loading: true
    })
  }

  showPass = () => {
    this.setState({
      showPassword: !this.state.showPassword,
    });
  }

  handlePassword = (e) => {
    if(e.target.value.trim()) {
      this.setState({
        noPassword: false,
        error: ''
      })
    }
  }

  handleUsername = (e) => {
    if(e.target.value.trim()) {
      this.setState({
        noUsername: false,
        error: ''
      })
    }
  }

  submitForm = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const captcha = window.grecaptcha.getResponse();

    // validate form
    if(!username || !password || !captcha) {
      this.setState({
        noUsername: username ? false : true,
        noPassword: password ? false : true,
        error: captcha ? '' : 'Please solve captcha'
      });
      return
    }

    fetchApi('/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        captcha
      })
    }, this.props.history)
    .then(res => {
      window.kinarvaStore.accessToken = res.token
      this.props.history.push('/panel')
    })
    .catch((e) => {
      if (e.status === 401) {
        this.setState({
          error: e.response.error || e.response.message
        })
      } else {
        this.setState({
          error: 'There was an error with your request. Please try again later'
        })
      }
    })
  }

  render() {
    const { showPassword, noPassword, noUsername, error, loading } = this.state;
    return loading ? <Loader /> : (
      <div className="App">
        <header className="App-header">
          <div className="App-logo">Kinarva.</div>
          <div className={`App-error-message ${error ? 'App-show-message': ''}`}>
            {error}
          </div>
          <form className="App-form" onSubmit={this.submitForm} method="POST">
            <input onChange={this.handleUsername} className={`App-input ${noUsername ? 'App-input-error' : ''}`} type="text" name="username" placeholder="Username" tabIndex="1" />
            <div className="App-passContainer">
              <input onChange={this.handlePassword} className={`App-input App-password ${noPassword ? 'App-input-error' : ''}`} type={ showPassword ? 'text' : 'password' } name="password" tabIndex="2" placeholder="Password" />
              {
                showPassword
                ? <img onClick={this.showPass} src={closedEye} className="App-eye" alt="show password" />
                : <img onClick={this.showPass} src={openEye} className="App-eye" alt="hide password" />
              }
            </div>
            <div id="login-captcha"></div>
            <button type="submit" className="App-login">Login</button>
          </form>
        </header>
      </div>
    );
  }
}

export default App;
