import React, {PureComponent} from 'react';
import { Progress, Modal, Button } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import styles from './ConfirmLeave.less';

/**
 * 确认离开提示 (按钮级别)
 */
class ConfirmLeave extends PureComponent {

  /**
   * 国际化 - 确认离开提示
   */
  renderLeaveConfirmTips = (action) => {
    let s = '';
    if (action === CONFIRM_LEAVE_ACTION['NEW']) {
      s = formatMessage({ id: 'common.leaveconfirm.action.new' });
    } else if (action === CONFIRM_LEAVE_ACTION['EDIT']) {
      s = formatMessage({ id: 'common.leaveconfirm.action.edit' });
    }
    if (getLocale() === 'en-US') {
      return "The contents will not be saved. Are you sure to leave the " + s + " page?";
    } else if (getLocale() === 'zh-CN') {
      return "所填写的内容将不会被保存，确认离开" + s + "页面吗？";
    }
  }

  render() {
    const {
      confirmLeaveVisible,
      action,
      handleLeaveConfirmOk,
      handleLeaveConfirmCancel,
    } = this.props;

    return (
      <div>
        <Modal
          visible={confirmLeaveVisible}
          onOk={handleLeaveConfirmOk}
          onCancel={handleLeaveConfirmCancel}
        >
          <p className={styles.leaveTips}>
            {this.renderLeaveConfirmTips(action)}
          </p>
        </Modal>
      </div>
    );
  }
}

export default ConfirmLeave