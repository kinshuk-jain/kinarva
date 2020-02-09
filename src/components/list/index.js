import React from 'react';
import './list.css'

export const ListItem = ({ children, onClick }) => (
  <li className="List-Item" onClick={onClick}>
    {children}
  </li>
)

export const List = ({ onClick, children, className }) => (
  <div className={className}>
    <ul className="List" onClick={onClick}>
      {children}
    </ul>
  </div>
)
