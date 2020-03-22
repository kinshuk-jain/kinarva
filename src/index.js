import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import './index.css'

import Loader from './components/loader'
import App from './pages/homepage/App'

const PanelComponent = lazy(() =>
  import(/* webpackChunkName: "panel" */ './pages/docspage/Panel')
)

const Panel = (props) => (
  <Suspense fallback={<Loader />}>
    <PanelComponent {...props} />
  </Suspense>
)

ReactDOM.render(
  <Router>
    <Route exact path="/" component={App} />
    <Route path="/panel" component={Panel} />
  </Router>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
