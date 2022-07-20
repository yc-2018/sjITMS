import React from 'react';
import styles from './ToolbarPanel.less';

const ToolbarPanel = ({ children }) => {
  return <div className={styles.tableListOperator}>{children}</div>;
};

export default ToolbarPanel;
