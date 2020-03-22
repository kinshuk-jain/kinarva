import React from 'react'
import './tabs.css'

export const TabItem = (props) => (
  <div className="Tab-Item">
    <input name="tabs" id={props.label} type="radio" onClick={props.onClick} />
    <label htmlFor={props.label}>{props.label}</label>
  </div>
)

export const Tabs = (props) => <div className="Tabs-List">{props.children}</div>
