import React, { Component } from 'react';
import styles from './NewStylePage.less';

const ToolbarPane1Content = ({children}) => {
	return (
         <div className={styles.tableListOperator}>
           {children}
         </div>
		);
}

export default ToolbarPane1Content;
