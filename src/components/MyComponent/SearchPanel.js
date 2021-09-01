import React, { Component } from 'react';
import styles from './TableList.less';

const SearchPanel = ({children}) => {
	return (
         <div className={styles.tableListForm}>
           {children}
         </div>
		);
} 

export default SearchPanel;