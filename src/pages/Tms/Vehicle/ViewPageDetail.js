import React, { PureComponent } from 'react';
import { Switch } from 'antd';
import styles from '@/pages/Component/Page/inner/ViewPageDetail.less';
import Ellipsis from '@/components/Ellipsis';
import { VehicleState } from './VehicleLocale';

export default class ViewPageDetail extends PureComponent {
  render() {
    const {
      children,
      title,
      state,
      onChangeState,
      action,
      stateCaption,
      stateDisabled,
      realStateCaption,
      realChecked,
      billState
    } = this.props;

    const switchStateCaption = realStateCaption ? realStateCaption : state === 'Free'
      ? VehicleState.Free
      : realStateCaption;
    const switchChecked = realStateCaption ? realChecked : state === 'Free';

    return (
      <div className={styles.pageDetail}>
        <div className={styles.detailNavigatorPanelWrapper}>
          {
            billState &&
            <div className={styles.billState}>
              {billState}
            </div>
          }
          <span className={styles.title}>
            <Ellipsis style={{ display: 'inline' }} length={30} tooltip>
              {title}
            </Ellipsis>
          </span>

          {state &&
            <div className={styles.enableCheck}>
              <Switch disabled={stateDisabled} className={styles.enableSwitch} checked={switchChecked} onChange={onChangeState} />
              <span>
                {switchStateCaption}
              </span>
            </div>
          }
          {stateCaption && <div className={styles.enableCheck}><span>{stateCaption}</span></div>}
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