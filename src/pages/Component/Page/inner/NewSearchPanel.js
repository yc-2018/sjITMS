import React, { Component } from 'react';
import styles from './NewStylePage.less';

const NewSearchPanel = ({children}) => {
  return (
    <div style={{'marginTop': '16px', 'marginBottom': '12px'}} className={styles.tableListForm}>
      {children}
    </div>
  );
}

export default NewSearchPanel;
