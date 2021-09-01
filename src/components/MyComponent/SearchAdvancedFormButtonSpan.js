import React, { Component } from 'react';
import { Card } from 'antd';

const SearchAdvancedFormButtonSpan = ({children}) => {
	return (
        <span style={{ float: 'right', marginBottom: 24 }}>
           {children}
        </span>
		);
} 

export default SearchAdvancedFormButtonSpan;