import React from 'react';
import { withRouter } from 'react-router-dom';
import styles from './index.less';

/**
 * 欢迎页
 * @author ChenGuangLong
 * @since 2024/10/11 14:49
*/
const Welcome = () => {
  return (
    window.location.pathname === '/' && (
      <div className={styles.welcome}>
        Welcome
      </div>
    )
  );
};

export default withRouter(Welcome);
