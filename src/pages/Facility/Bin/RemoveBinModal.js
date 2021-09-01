import React, { PureComponent } from 'react';
import { Progress, Modal, Button } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import styles from './Bin.less';

/**
 * 确认离开提示 (按钮级别)
 */
const binFacilityTypeLocale = {
  'ZONE': '货区',
  'PATH': '货道',
  'SHELF': '货架',
  'BIN': '货位',
}
export default class RemoveBinModal extends PureComponent {

  /**
   * 国际化 - 确认离开提示
   */
  renderRemoveConfirmTips = (title) => {
    const { code } = this.props;
    if (getLocale() === 'en-US') {
      return "Are you sure to remove bins with the " + title + " ?";
    } else if (getLocale() === 'zh-CN') {
      return "确认要删除" + title + "`" + code + "`下的货位吗？";
    }
  }

  handleCancel = () => {
    const { handleRemoveModalVisible } = this.props;
    handleRemoveModalVisible();
  };

  handleRemoveOk = () => {
    const {
      handleRemove,
      binFacilityType,
      code
    } = this.props;

    handleRemove(code, binFacilityType);
  }

  render() {
    const { confirmRemoveVisible, confirmLoading,
      ModalTitle, code, binFacilityType, text } = this.props;

    const textInfo = binFacilityTypeLocale[binFacilityType];

    return (
      <div>
        <Modal
          title={ModalTitle}
          visible={confirmRemoveVisible}
          onOk={this.handleRemoveOk}
          onCancel={this.handleCancel}
          confirmLoading={confirmLoading}
          destroyOnClose={true}
        >
          <p className={styles.leaveTips}>
            {this.renderRemoveConfirmTips(textInfo)}
          </p>
        </Modal>
      </div>
    );
  }
}
