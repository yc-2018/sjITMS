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
class LightStepTable extends PureComponent {

  static propTypes = {
    handleSelectRows: PropTypes.func,
    handleCreateLightStepModalVisible: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
    handleLightStepTableChange: PropTypes.func,
  }

  state = {
    selectedRowKeys: [],
    creatLightStepModalVisible: false,
    editLightStep: {},
    unShowRow: true
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
    this.props.handleLightStepTableChange(pagination, filters, sorter);
  }


  // /**
  //  * 新增编辑弹窗显示控制
  //  */
  // handleCreateModalVisible = (flag, facilitiesMaintenance) => {
  //   this.setState({
  //     createModalVisible: !!flag,
  //     editFacilitiesMaintenance: {
  //       ...facilitiesMaintenance
  //     },
  //   });
  // };

  /**
   * 编辑处理
   */
  handleEditFacility = value => {
    this.handleEdit(value);
  };

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
      return 'Total ' + number + ' lightStep' + s;
    } else if (getLocale() === 'zh-CN') {
      return facilitiesMaintenanceLocale.all + number + facilitiesMaintenanceLocale.number + facilitiesMaintenanceLocale.lightStep;
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
          onClick={() => this.props.handleCreateLightStepModalVisible(true)}>
          {facilitiesMaintenanceLocale.createLightStep}
        </Button>
      </Empty>
    }
  }

  render() {
    const { selectedRowKeys, unShowRow } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleCreateLightStepModalVisible,
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
        title: commonLocale.lightStepLocal,
        dataIndex: 'server',
        width: colWidth.sourceBillNumberColWidth,
      }
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
            </div>
            <StandardTable
              unShowRow={unShowRow}
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

export default LightStepTable;
