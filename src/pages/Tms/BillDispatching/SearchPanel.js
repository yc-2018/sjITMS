import React, { Component } from 'react';
import styles from '@/pages/Component/Page/inner/Page.less';
const SearchPanel = ({children}) => {
  return (
    <div className={styles.tableListForm}>
      {children}
    </div>
  );
}
export default SearchPanel;
