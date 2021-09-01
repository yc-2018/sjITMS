import React, { Component } from 'react';
import styles from './Page.less';

const ToolbarPanel = ({children}) => {
  return (
    <div className={styles.tableListOperator}>
      {children}
    </div>
  );
}

export default ToolbarPanel;
