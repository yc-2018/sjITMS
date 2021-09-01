import React, { Component } from 'react';
import styles from './Page.less';

const SearchPanel = ({children}) => {
  return (
    <div style={{'marginTop': '16px', 'marginBottom': '12px'}} className={styles.tableListForm}>
      {children}
    </div>
  );
}

export default SearchPanel;
