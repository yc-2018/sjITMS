/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-18 15:00:36
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { Component } from 'react';
import { Modal, Tabs, Button, Tooltip, message, Typography } from 'antd';
import DispatchingTable from './DispatchingTable';
import DispatchingCreatePage from './DispatchingCreatePage';
import ScheduleSearchForm from './ScheduleSearchForm';
import { ScheduleColumns, ScheduleDetailColumns, pagination } from './DispatchingColumns';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import dispatchingStyles from './Dispatching.less';
import {
  querySchedule,
  approve,
  cancelApprove,
  cancelAborted,
  remove,
} from '@/services/sjitms/ScheduleBill';

const { Text } = Typography;
const { TabPane } = Tabs;

export default class SchedulePage extends Component {
  state = {
    loading: false,
    savedRowKeys: [],
    savedChildRowKeys: [],
    approvedRowKeys: [],
    abortedRowKeys: [],
    scheduleData: [],
    activeTab: 'Saved',
    editPageVisible: false,
    scheduleDetail: {},
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.getSchedules(this.state.activeTab);
  }
  //刷新
  refreshTable = searchKeyValues => {
    this.setState({ loading: true });
    this.getSchedules(this.state.activeTab, searchKeyValues);
    this.props.refreshDetail(undefined);
  };
  //获取排车单
  getSchedules = (stat, searchKeyValues) => {
    if (searchKeyValues == undefined) searchKeyValues = {};
    searchKeyValues.stat = stat;
    querySchedule(searchKeyValues).then(response => {
      if (response.success) {
        this.setState({
          loading: false,
          scheduleData: response.data,
          savedRowKeys: [],
          savedChildRowKeys: [],
          approvedRowKeys: [],
          abortedRowKeys: [],
        });
      } else {
        this.setState({ loading: false });
      }
    });
  };
  //标签页切换
  handleTabChange = activeKey => {
    this.setState({ activeTab: activeKey, loading: true });
    this.getSchedules(activeKey);
  };

  //排车单编辑
  editTable = record => {
    return () => {
      this.createPageModalRef.show(true, record);
    };
  };

  //取消作废
  handleCancelAborted = () => {
    const { scheduleData, activeTab, abortedRowKeys } = this.state;
    if (abortedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    const schedule = scheduleData.find(x => x.uuid == abortedRowKeys[0]);
    cancelAborted(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('取消作废成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //取消批准
  handleCancelApprove = () => {
    const { scheduleData, activeTab, approvedRowKeys } = this.state;
    if (approvedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    const schedule = scheduleData.find(x => x.uuid == approvedRowKeys[0]);
    cancelApprove(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('取消批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //批准
  handleApprove = () => {
    const { scheduleData, activeTab, savedRowKeys } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    const schedule = scheduleData.find(x => x.uuid == savedRowKeys[0]);
    approve(schedule.uuid, schedule.version).then(response => {
      if (response.success) {
        message.success('批准成功！');
        this.getSchedules(activeTab);
      }
    });
  };

  //删除
  handleDelete = () => {
    const { activeTab, savedRowKeys } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    Modal.confirm({
      title: '是否确认删除排车单？',
      onOk: async () => {
        remove(savedRowKeys[0]).then(response => {
          if (response.success) {
            message.success('删除成功！');
            this.getSchedules(activeTab);
            this.props.refreshOrder();
            this.props.refreshPending();
          }
        });
      },
    });
  };

  //表格行选择
  tableChangeRows = tableType => {
    return selectedRowKeys => {
      switch (tableType) {
        case 'Approved':
          this.setState({ approvedRowKeys: selectedRowKeys });
          break;
        case 'Aborted':
          this.setState({ abortedRowKeys: selectedRowKeys });
          break;
        default:
          this.setState({ savedRowKeys: selectedRowKeys });
          break;
      }
    };
  };
  //表格行点击
  onClickRow = record => {
    const { scheduleData } = this.state;
    let selectSchedule = {};
    let newScheduleData = scheduleData.map(item => {
      if (item.uuid == record.uuid) {
        selectSchedule = item;
      }
      item.clicked = item.uuid == record.uuid;
      return item;
    });
    this.setState({ scheduleData: newScheduleData });
    this.props.refreshDetail(selectSchedule);
  };

  render() {
    const {
      scheduleData,
      loading,
      savedRowKeys,
      savedChildRowKeys,
      approvedRowKeys,
      abortedRowKeys,
      activeTab,
      editSchedule,
      editPageVisible,
      scheduleDetail,
    } = this.state;

    const buildOperations = () => {
      switch (activeTab) {
        case 'Approved':
          return (
            <Button style={{ marginLeft: 10 }} onClick={this.handleCancelApprove}>
              取消批准
            </Button>
          );
        case 'Aborted':
          return (
            <Button style={{ marginLeft: 10 }} onClick={this.handleCancelAborted}>
              取消作废
            </Button>
          );
        default:
          return (
            <div>
              <Button>新建排车单</Button>
              <Button type={'primary'} style={{ marginLeft: 10 }} onClick={this.handleApprove}>
                批准
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleDelete}>
                删除
              </Button>
            </div>
          );
      }
    };

    const billNumberColumn = {
      title: '单号',
      dataIndex: 'billNumber',
      width: 150,
    };
    const editRender = {
      render: (val, record) => (
        <a href="#" onClick={this.editTable(record)}>
          {val}
        </a>
      ),
    };

    return (
      <Tabs
        activeKey={activeTab}
        onChange={this.handleTabChange}
        tabBarExtraContent={buildOperations()}
      >
        <TabPane tab={<Text className={dispatchingStyles.cardTitle}>排车单</Text>} key="Saved">
          <ScheduleSearchForm refresh={this.refreshTable} />
          <DispatchingTable
            pagination={pagination}
            loading={loading}
            onClickRow={this.onClickRow}
            selectedRowKeys={savedRowKeys}
            changeSelectRows={this.tableChangeRows()}
            dataSource={scheduleData}
            columns={[{ ...billNumberColumn, ...editRender }, ...ScheduleColumns]}
            scrollY="calc(68vh - 152px)"
          />
          {/* 编辑排车单 */}
          <DispatchingCreatePage
            modal={{ title: '编辑排车单' }}
            refresh={() => {
              this.refreshTable();
              this.props.refreshOrder();
              this.props.refreshPending();
            }}
            onRef={node => (this.createPageModalRef = node)}
          />
        </TabPane>
        <TabPane tab={<Text className={dispatchingStyles.cardTitle}>已批准</Text>} key="Approved">
          <ScheduleSearchForm refresh={this.refreshTable} />
          <DispatchingTable
            pagination={pagination}
            loading={loading}
            onClickRow={this.onClickRow}
            selectedRowKeys={approvedRowKeys}
            changeSelectRows={this.tableChangeRows('Approved')}
            dataSource={scheduleData}
            columns={[billNumberColumn, ...ScheduleColumns]}
            scrollY="calc(68vh - 152px)"
          />
        </TabPane>
        <TabPane tab={<Text className={dispatchingStyles.cardTitle}>已作废</Text>} key="Aborted">
          <ScheduleSearchForm refresh={this.refreshTable} />
          <DispatchingTable
            pagination={pagination}
            loading={loading}
            onClickRow={this.onClickRow}
            selectedRowKeys={abortedRowKeys}
            changeSelectRows={this.tableChangeRows('Aborted')}
            dataSource={scheduleData}
            columns={[billNumberColumn, ...ScheduleColumns]}
            scrollY="calc(68vh - 152px)"
          />
        </TabPane>
      </Tabs>
    );
  }
}
