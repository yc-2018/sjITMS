import React, { Component } from 'react';
import styles from './Page.less';

const ToolbarPane1Content = ({children}) => {
	return (
         <div className={styles.tableListOperator}>
           {children}
         </div>
		);
}

export default ToolbarPane1Content;
