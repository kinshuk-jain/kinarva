import React from 'react';
import loaderGif from '../../icons/loader.gif';
import './loader.css'

const Loader = () => (
  <div className="Loader-container">
    <img src={loaderGif} alt="loading..." />
  </div>
)

export default Loader;
