import React, { PureComponent, Fragment } from 'react';
import { Table, Icon, Popconfirm, Button, Empty } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import PropTypes from 'prop-types';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import PageLoading from '@/components/PageLoading';
import StandardTable from '@/components/StandardTable';
import emptySvg from '@/assets/common/img_empoty.svg';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { roleLocale } from './RoleLocale';
import styles from './role.less';
import { colWidth } from '@/utils/ColWidth';
import {
  ROLE_STATUS, RESOURCE_IWMS_ACCOUNT_ROLE_CREATE, RESOURCE_IWMS_ACCOUNT_ROLE_ONLINE,
  RESOURCE_IWMS_ACCOUNT_ROLE_REMOVE, RESOURCE_IWMS_ACCOUNT_ROLE_AUTHORIZE,
} from '@/utils/constants';
class RoleUserInfo extends PureComponent {

  static propTypes = {
    handleRoleUserTableChange: PropTypes.func,
    handleSelectRows: PropTypes.func,
    handleAddUserModalVisible: PropTypes.func,
    handleRemoveUser: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
  }

  state = {
    selectedRowKeys: [],
  };

  componentWillReceiveProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      this.setState({
        selectedRowKeys: [],
      });
    }
  }

  handleSelectRows = rows => {
    if (this.props.handleSelectRows) {
      this.props.handleSelectRows(rows);
    }
    this.setState({
      selectedRowKeys: rows,
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.handleRoleUserTableChange(pagination, filters, sorter);
  }

  handleDelete = (record) => {
    this.props.handleRemoveUser(record, true);
  }

  onView = (record) => {

  }

  /**
   * 国际化 - 表格中删除确认文字
   */
  confirmDeleteTips = () => {
    return roleLocale.makeSureDelete + "?";
  }

  renderTableAlert = (number) => {
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Total ' + number + ' user' + s;
    } else if (getLocale() === 'zh-CN') {
      return roleLocale.all + number + roleLocale.number + roleLocale.user;
    }
  }

  renderEmpty = () => {
    if (this.props.loading) {
      return <PageLoading />;
    } else {
      return <Empty
        image={emptySvg}
        style={{ position: 'absolute', top: '30%', left: '45%' }}
        description={
          <span>
            {roleLocale.noData}
          </span>
        }
      >
      </Empty>
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleAddUserModalVisible,
      handleBatchProcessConfirmModalVisible,
      taskTypeMap,
    } = this.props;

    const columns = [
      {
        title: commonLocale.codeLocale,
        dataIndex: 'code',
        key: 'code',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.nameLocale,
        dataIndex: 'name',
        key: 'name',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.contactPhoneLocale,
        dataIndex: 'phone',
        key: 'phone',
        width: colWidth.sourceBillNumberColWidth,
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      //showQuickJumper: true,
      ...pagination,
    };

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    return (
      <div className={styles.standardTable}>
        {this.props.data.list && this.props.data.list.length > 0 ?
          <div>
            {/* <div className={styles.tableAlert}>
              <span>{this.renderTableAlert(this.props.data.list ? this.props.data.pagination.total : 0)}</span>
              <div className={styles.rightBtnWrapper} style={{ float: 'right' }}>
                <Button style={{ marginRight: '8px' }}
                  disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_REMOVE)}
                  onClick={() => handleBatchProcessConfirmModalVisible(true, 'delete')}>
                  {roleLocale.batchRemove}
                </Button>
                  type="primary"
                  icon='plus'
                  disabled={!havePermission(RESOURCE_IWMS_ACCOUNT_ROLE_CREATE)}
                  onClick={() => handleAddUserModalVisible(true)}
                >
                  {roleLocale.addUser}
                </Button>
              </div>
            </div> */}
            <StandardTable
              selectedRows={selectedRowKeys}
              rowKey={record => record.uuid}
              loading={tableLoading}
              data={this.props.data}
              columns={columns}
              comId={'roloUserInfo.view.roloUserInfoTable'}
              onSelectRow={this.handleSelectRows}
              pagination={paginationProps}
              onChange={this.handleTableChange}
            />
          </div>
          :
          this.renderEmpty()
        }
      </div>
    );
  }
}

export default RoleUserInfo;
