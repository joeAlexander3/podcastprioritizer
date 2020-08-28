import React from 'react';

const Input = props => 
  <>
    <label htmlFor={props.inputFor}>{props.label}</label>
    <input
      type="text"
      name={props.inputFor}
      id={props.inputFor}
      value={props.inputState}
      onChange={props.handleTextChange}
      placeholder={props.placeholder}
      required
    />
  </>

export default Input;
