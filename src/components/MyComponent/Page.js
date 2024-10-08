import React from 'react';
import { Card } from 'antd';
import styles from './TableList.less';

const Page = ({ children, className='' }) =>
  <Card bordered={false} className={`${styles.contentWrapper} ${className}`}>
    <div className={styles.tableList}>
      {children}
    </div>
  </Card>

export default Page;