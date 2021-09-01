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
class FacilitiesMaintenanceTagTable extends PureComponent {

  static propTypes = {
    handleTagTableChange: PropTypes.func,
    handleSelectRows: PropTypes.func,
    handleRemoveTag: PropTypes.func,

    handleCreateModalVisible: PropTypes.func,
    handleEdit: PropTypes.func,

    handleTagEditModalVisible: PropTypes.func,
    handleTagEdit: PropTypes.func,

    handleTagCreateModalVisible: PropTypes.func,
    handleTagAdd: PropTypes.func,

    handleBatchProcessConfirmModalVisible: PropTypes.func,
    handOneTag: PropTypes.func,
    loading: PropTypes.bool,
    editTagModalVisible: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,

    entity: PropTypes.object
  }

  state = {
    selectedRowKeys: [],
    tagOneData: {}
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
    this.props.handleTagTableChange(pagination, filters, sorter);
  }

  // tagEdit = (record) => {
  //   this.props.handOneTag(record, true);
  // }

  handleDelete = (record) => {
    this.props.handleRemoveTag(record, true);
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
      return 'Total ' + number + ' tag' + s;
    } else if (getLocale() === 'zh-CN') {
      return facilitiesMaintenanceLocale.all + number + facilitiesMaintenanceLocale.number + facilitiesMaintenanceLocale.tag;
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleBatchProcessConfirmModalVisible,
      entity,
      handleEdit,
      handleTagAdd,
      handleTagEdit,
    } = this.props;

    const columns = [
      {
        title: facilitiesMaintenanceLocale.tagAddress,
        key: 'address',
        dataIndex: 'address',
        sorter: true,
        width: colWidth.codeColWidth,
      },
      {
        title: facilitiesMaintenanceLocale.tagType,
        width: colWidth.codeColWidth,
        render: (text, record) => (
          <span>
            { record.cls === 'LABEL' ? '标签' : record.cls === 'SCANER' ? '扫描枪' : '旋转灯' }
          </span>
        )
      },
      {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: (text, record) => (
          <span>
            <a href="javascript:;"
               onClick={() => handleTagEdit(record)}
            >
              {commonLocale.editLocale}
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleDelete(record)}
                       operate={commonLocale.deleteLocale}
                       object={facilitiesMaintenanceLocale.tag}>
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
                onClick={() => handleTagAdd(true)}
              >
                {facilitiesMaintenanceLocale.createBtn}
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
      </div>
    );
  }
}

export default FacilitiesMaintenanceTagTable;
