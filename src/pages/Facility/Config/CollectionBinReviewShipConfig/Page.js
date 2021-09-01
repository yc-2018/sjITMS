import React, { Component } from 'react';
import { Card } from 'antd';
import styles from './TableList.less';

const Page = ({children}) => {
	return (
        <Card bordered={false} className={styles.contentWrapper}>
          <div className={styles.tableList}>
           {children}
          </div>
        </Card>
		);
} 

export default Page;