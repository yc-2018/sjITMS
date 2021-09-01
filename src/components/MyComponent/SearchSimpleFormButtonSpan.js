import React, { Component } from 'react';
import { Card } from 'antd';
import styles from './TableList.less';

const SearchSimpleFormButtonSpan = ({children}) => {
	return (
        <span className={styles.submitButtons}>
           {children}
        </span>
		);
} 

export default SearchSimpleFormButtonSpan;