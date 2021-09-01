import React from 'react';
import moment from 'moment';
import { Avatar } from 'antd';
import styles from './index.less';
const ReplitionContent = ({ data: { content, replyTime,replyOrg },props }) => (
  
  <div className={styles.listContent}>
    <div className={styles.description} style={{marginLeft:'50px'}}>
      {content}
    </div>
    <div className={styles.extra} style={{marginLeft:'33px'}}>
      <em>{moment(replyTime).format('YYYY-MM-DD HH:mm')}</em>
      <em>{replyOrg.name}</em>
    </div>
  </div>
);

export default ReplitionContent;
