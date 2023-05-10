import React, { PureComponent } from 'react';
import { Button, Switch } from 'antd';
import { formatMessage } from 'umi/locale';
import PropTypes from 'prop-types';
import { commonLocale } from '@/utils/CommonLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { havePermission } from '@/utils/authority';
import {
  ROLE_STATUS,
  RESOURCE_IWMS_ACCOUNT_ROLE_CREATE,
  RESOURCE_IWMS_ACCOUNT_ROLE_ONLINE,
  RESOURCE_IWMS_ACCOUNT_ROLE_REMOVE,
  RESOURCE_IWMS_ACCOUNT_ROLE_AUTHORIZE,
} from '@/utils/constants';
import { roleLocale } from './RoleLocale';
import styles from './role.less';
class RoleToolbarPanel extends PureComponent {
  static propTypes = {
    entity: PropTypes.object,
    handleEnableOrDisable: PropTypes.func,
    handleEdit: PropTypes.func,
    handleDleteModalVisible: PropTypes.func,
  };
  state = {
    operate: '',
    modalVisible: false,
  };

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = operate => {
    if (operate) {
      this.setState({
        operate: operate,
      });
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    const { entity } = this.props;
    // this.onDelete();
    if (operate === commonLocale.deleteLocale) {
      this.props.handleDeleteConfirm();
    } else if (operate === commonLocale.offlineLocale || operate === commonLocale.onlineLocale) {
      this.props.handleEnableOrDisable(entity, true, false);
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  render() {
    const { entity, handleEnableOrDisable, handleEdit, handleDleteModalVisible } = this.props;
    let enabled = entity.status === ROLE_STATUS['ONLINE'];

    let isDdefault = entity && entity.sysDefault;
    return (
      <div className={styles.indexOperator}>
        <span className={styles.nameCode}>
          [{entity.code}]{entity.name}
        </span>
        <div className={styles.enableCheck}>
          <Switch
            disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_ONLINE) || isDdefault}
            className={styles.enableSwitch}
            checked={enabled ? true : false}
            onChange={() =>
              this.handleModalVisible(
                enabled ? commonLocale.offlineLocale : commonLocale.onlineLocale
              )
            }
          />
          <span>{enabled ? roleLocale.enabled : roleLocale.disabled}</span>
        </div>

        <div className={styles.rightBtnWrapper}>
          <Button
            disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_REMOVE) || isDdefault}
            onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
          >
            {commonLocale.deleteLocale}
          </Button>
          <Button
            type="primary"
            disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_CREATE) || isDdefault}
            onClick={() => handleEdit(entity)}
          >
            {commonLocale.editLocale}
          </Button>
        </div>
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={roleLocale.title + ':' + this.props.entity.code}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    );
  }
}

export default RoleToolbarPanel;
