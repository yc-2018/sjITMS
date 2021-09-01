import React, { Component } from 'react';
import styles from './NewStylePage.less';

const NewToolbarPanel = ({children}) => {
  return (
    <div className={styles.tableListOperator}>
      {children}
    </div>
  );
}

export default NewToolbarPanel;
