import React from 'react';
import moment from 'moment';
import { Avatar } from 'antd';
import styles from './index.less';
import timeSvg from '@/assets/common/ic_time.svg';
import configs from '@/utils/config';
import { isBlank } from '@/utils/utils';


const ArticleListContent = ({ data: { publishTime,avatar, publisherName,replitionCount } }) => (
  <div className={styles.listContent}>
    <div className={styles.extra}>
    <Avatar src={!isBlank(avatar)?avatar:configs[API_ENV]['avatar.default.url']} />
	  <a style={{color:'rgba(127,143,164,1)'}}>{publisherName}</a>&nbsp;&nbsp;
	  <img src={timeSvg} style={{marginRight:-10}}/>
	  <em>{moment(publishTime).format('YYYY-MM-DD HH:mm')}</em>
      <span style={{float:'right'}}>共&nbsp;{replitionCount}&nbsp;条&nbsp;回复</span>
    </div>
  </div>
);

export default ArticleListContent;
