import React, { PureComponent } from 'react';
import { Switch } from 'antd';
import styles from './PageDetail.less';
import { formatMessage } from 'umi/locale';

class PageDetail extends PureComponent {
  render() {
    const {
      children,
      title,
      enable,
      entity,
      handleEnableOrDisable,
      action,
      stateCaption,
      disabled
    } = this.props;

    const defaultState= enable ? 
        formatMessage({ id: 'common.table.content.enabled' }):
        formatMessage({ id: 'common.table.content.disabled' });

    return (
      <div className={styles.pageDetail}>
        <div className={styles.detailNavigatorPanelWrapper}>
          <span className={styles.title}>{title}</span>

          {enable != undefined &&
            <div className={styles.enableCheck}>
              <Switch className={styles.enableSwitch} defaultChecked={enable} disabled={disabled?disabled:true} onChange={() => handleEnableOrDisable(entity)} />
              <span>
                {stateCaption?stateCaption:defaultState}
              </span>
            </div>
          }
          <div className={styles.action}>
            {action}
          </div>
        </div>

        <div className={styles.tab}>
          {children}
        </div>
      </div>
    );
  }
}

export default PageDetail;