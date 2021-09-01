import React, {PureComponent} from 'react';
import { Button } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './util.less';

class NavigatorPanel extends PureComponent {

  render() {
    const {
      title,
      action
    } = this.props;

    return (
      <div className={styles.navigatorPanelWrapper}>
        <span className={styles.title}>{title}</span>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    );
  }
}

export default NavigatorPanel;