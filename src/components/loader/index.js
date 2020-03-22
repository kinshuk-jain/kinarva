import React from 'react'
import loaderGif from '../../icons/loader.gif'
import './loader.css'

const Loader = ({ className }) => (
  <div className={`Loader-container ${className ? className : ''}`}>
    <img src={loaderGif} alt="loading..." />
  </div>
)

export default Loader
