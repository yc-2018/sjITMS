import React, { PureComponent, Fragment } from 'react';
import { Table, Icon, Popconfirm, Button, Empty, Divider } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import PropTypes from 'prop-types';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import PageLoading from '@/components/PageLoading';
import StandardTable from '@/components/StandardTable';
import emptySvg from '@/assets/common/img_empoty.svg';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import facilitiesMaintenanceLocale  from './FacilitiesMaintenanceLocale';
import styles from './FacilitiesMaintenance.less';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
class FacilitiesMaintenanceTable extends PureComponent {

  static propTypes = {
    handleSelectRows: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    handleEdit: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
    handleControllerTableChange: PropTypes.func,
    handleControllerRemove: PropTypes.func,
  }

  state = {
    selectedRowKeys: [],
    createModalVisible: false,
    editFacilitiesMaintenance: {},
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
    this.props.handleControllerTableChange(pagination, filters, sorter);
  }


  /**
   * 新增编辑弹窗显示控制
   */
  handleCreateModalVisible = (flag, facilitiesMaintenance) => {
    this.setState({
      createModalVisible: !!flag,
      editFacilitiesMaintenance: {
        ...facilitiesMaintenance
      },
    });
  };

  handleDelete = (record) => {
    this.props.handleControllerRemove(record, true);
  }

  /**
   * 国际化 - 表格中删除确认文字
   */
  confirmDeleteTips = () => {
    return facilitiesMaintenanceLocale.makeSureDelete + "?";
  }

  renderTableAlert = (number) => {
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Total ' + number + ' controller' + s;
    } else if (getLocale() === 'zh-CN') {
      return facilitiesMaintenanceLocale.all + number + facilitiesMaintenanceLocale.number + facilitiesMaintenanceLocale.controller;
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
            {facilitiesMaintenanceLocale.noData}
          </span>
        }
      >
        <Button
          type="primary"
          icon="plus"
          onClick={() => this.props.handleCreateModalVisible(true)}>
          {facilitiesMaintenanceLocale.createTag}
        </Button>
      </Empty>
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleEdit,
      handleBatchProcessConfirmModalVisible,
      taskTypeMap,
    } = this.props;

    const columns = [
      {
        title: commonLocale.codeLocale,
        dataIndex: 'code',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.nameLocale,
        dataIndex: 'name',
        width: colWidth.codeColWidth,
      },
      {
        title: commonLocale.ipLocal,
        dataIndex: 'ip',
        width: colWidth.sourceBillNumberColWidth,
      },
      {
        title: commonLocale.portLocal,
        dataIndex: 'port',
        width: colWidth.sourceBillNumberColWidth,
      },
      {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: (text, record) => (
          <span>
            <a href="javascript:;"
               onClick={() => handleEdit(record)}
            >
              {commonLocale.editLocale}
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleDelete(record)}
                         operate={commonLocale.deleteLocale}
                         object={facilitiesMaintenanceLocale.controller}>
              <a>{commonLocale.deleteLocale}</a>
            </IPopconfirm>
          </span>
        ),
      },
    ];

    const paginationProps = {
      total: this.props.data.list ? this.props.data.pagination.total : 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100', '200'],
      showTotal: total => `共 ${total} 条`,
      ...pagination,
    };

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    return (
      <div className={styles.standardTable}>
        {this.props.data.list && this.props.data.pagination.total > 0 ?
          <div>
            <div className={styles.tableAlert}>
              <span>{this.renderTableAlert(this.props.data.list ? this.props.data.pagination.total : 0)}</span>
              <div className={styles.rightBtnWrapper} style={{ float: 'right' }}>
                <Button style={{ marginRight: '8px' }}
                        onClick={() => handleBatchProcessConfirmModalVisible(true, 'delete')}>
                  {facilitiesMaintenanceLocale.batchRemove}
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleEdit(true)}
                >
                  {facilitiesMaintenanceLocale.createTag}
                </Button>
              </div>
            </div>
            <StandardTable
              selectedRows={selectedRowKeys}
              rowKey={record => record.uuid}
              loading={tableLoading}
              data={this.props.data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              pagination={paginationProps}
              onChange={this.handleTableChange}
            />
          </div>
          : this.renderEmpty()
        }
      </div>
    );
  }
}

export default FacilitiesMaintenanceTable;
