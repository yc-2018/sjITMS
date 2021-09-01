import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import styles from './FacilitiesMaintenance.less';

/**
 * 确认离开提示 (按钮级别)
 */
export default class RemoveModal extends PureComponent {

  /**
   * 国际化 - 确认离开提示
   */
  renderRemoveConfirmTips = () => {
    const { record, depth } = this.props;
    if (getLocale() === 'en-US') {
      if (depth === 1) {
        return "Are you sure to remove bins with the " + "网关服务" + " ?";
      }
      if (depth === 2) {
        return "Are you sure to remove bins with the " + "网关" + " ?";
      }
      // return "Are you sure to remove bins with the " + title + " ?";
    } else if (getLocale() === 'zh-CN' && record && record.code) {

      if (depth === 1) {
        return "确认要删除" + "网关服务" + "`" + record.code + "`吗？";
      }
      if (depth === 2) {
        return "确认要删除" + "网关" + "`" + record.code + "`吗？";
      }

      // return "确认要删除" + title + "`" + record.code + "`吗？";
    }
  }

  handleCancel = () => {
    const { handleRemoveModalVisible } = this.props;
    handleRemoveModalVisible();
  };

  handleRemoveOk = () => {
    const {
      handleRemove,
      depth,
      record
    } = this.props;

    handleRemove(record, depth);
  }

  render() {
    const { confirmRemoveVisible, confirmLoading,
      ModalTitle } = this.props;
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
            {this.renderRemoveConfirmTips()}
          </p>
        </Modal>
      </div>
    );
  }
}
