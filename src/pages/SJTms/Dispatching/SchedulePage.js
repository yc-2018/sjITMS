/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 11:58:04
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { Component } from 'react';
import { Modal, Tabs, Button, message, Typography } from 'antd';
import DispatchingTable from './DispatchingTable';
import DispatchingCreatePage from './DispatchingCreatePage';
import ScheduleSearchForm from './ScheduleSearchForm';
import BatchProcessConfirm from './BatchProcessConfirm';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { ScheduleColumns, pagination } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import {
  querySchedule,
  approve,
  cancelApprove,
  cancelAborted,
  aborted,
  remove,
} from '@/services/sjitms/ScheduleBill';

const { Text } = Typography;
const { TabPane } = Tabs;

export default class SchedulePage extends Component {
  state = {
    loading: false,
    columns: [...ScheduleColumns],
    savedRowKeys: [],
    approvedRowKeys: [],
    abortedRowKeys: [],
    scheduleData: [],
    activeTab: 'Saved',
    editPageVisible: false,
    scheduleDetail: {},
    task: {},
  };

  componentDidMount() {
    this.scheduleColSetting.handleOK();
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

  //作废
  handleAborted = () => {
    const { activeTab, savedRowKeys } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (savedRowKeys.length == 1) {
      this.abortedSchedule(savedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('作废成功！');
          this.getSchedules(activeTab);
        }
      });
    } else {
      this.setState({ task: this.abortedSchedule }, () =>
        this.batchProcessConfirmRef.show('作废', savedRowKeys)
      );
    }
  };
  abortedSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.stat != 'Saved') {
      return null;
    }
    return await aborted(schedule.uuid);
  };

  //取消作废
  handleCancelAborted = () => {
    const { activeTab, abortedRowKeys } = this.state;
    if (abortedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (abortedRowKeys.length == 1) {
      this.cancelAbortedSchedule(abortedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('取消作废成功！');
          this.getSchedules(activeTab);
        }
      });
    } else {
      this.setState({ task: this.cancelAbortedSchedule }, () =>
        this.batchProcessConfirmRef.show('取消作废', abortedRowKeys)
      );
    }
  };
  cancelAbortedSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.stat != 'Aborted') {
      return null;
    }
    return await cancelAborted(schedule.uuid, schedule.version);
  };

  //取消批准
  handleCancelApprove = () => {
    const { approvedRowKeys, activeTab } = this.state;
    if (approvedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (approvedRowKeys.length == 1) {
      this.cancelApproveSchedule(approvedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('取消批准成功！');
          this.getSchedules(activeTab);
        }
      });
    } else {
      this.setState({ task: this.cancelApproveSchedule }, () =>
        this.batchProcessConfirmRef.show('取消批准', approvedRowKeys)
      );
    }
  };
  cancelApproveSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.stat != 'Approved') {
      return null;
    }
    return await cancelApprove(schedule.uuid, schedule.version);
  };

  //批准
  handleApprove = () => {
    const { savedRowKeys, activeTab } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (savedRowKeys.length == 1) {
      this.approveSchedule(savedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('批准成功！');
          this.getSchedules(activeTab);
        }
      });
    } else {
      this.setState({ task: this.approveSchedule }, () =>
        this.batchProcessConfirmRef.show('批准', savedRowKeys)
      );
    }
  };
  approveSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.stat != 'Saved') {
      return null;
    }
    return await approve(schedule.uuid, schedule.version);
  };

  //删除
  handleDelete = () => {
    const { activeTab, savedRowKeys } = this.state;
    if (savedRowKeys.length != 1) {
      message.error('一次只允许删除一张排车单！');
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
    let selectSchedule = undefined;
    let newScheduleData = scheduleData.map(item => {
      const selected = item.uuid == record.uuid;
      if (selected && !item.clicked) {
        selectSchedule = item;
      }
      item.clicked = selected && !item.clicked;
      return item;
    });
    this.setState({ scheduleData: newScheduleData });
    this.props.refreshDetail(selectSchedule);
  };

  //更新列配置
  setColumns = (columns, index, width) => {
    index ? this.scheduleColSetting.handleWidth(index, width) : {};
    this.setState({ columns });
  };

  render() {
    const {
      scheduleData,
      loading,
      columns,
      savedRowKeys,
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
              <Button>新建</Button>
              <Button type={'primary'} style={{ marginLeft: 10 }} onClick={this.handleApprove}>
                批准
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={this.handleAborted}>
                作废
              </Button>
            </div>
          );
      }
    };

    const settingColumns = (
      <RyzeSettingDrowDown
        columns={ScheduleColumns}
        comId={'ScheduleColumns'}
        getNewColumns={this.setColumns}
        onRef={ref => (this.scheduleColSetting = ref)}
      />
    );
    columns[0].render = (val, record) => {
      return record.stat == 'Saved' ? (
        <a href="#" onClick={this.editTable(record)}>
          {val}
        </a>
      ) : (
        <EllipsisCol colValue={val} />
      );
    };
    return (
      <div>
        <BatchProcessConfirm
          task={this.state.task}
          refreshTable={this.refreshTable}
          onRef={node => (this.batchProcessConfirmRef = node)}
        />
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
              refreshDataSource={scheduleData => {
                this.setState({ scheduleData });
              }}
              columns={columns}
              setColumns={this.setColumns}
              children={settingColumns}
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
              refreshDataSource={scheduleData => {
                this.setState({ scheduleData });
              }}
              columns={columns}
              setColumns={this.setColumns}
              children={settingColumns}
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
              refreshDataSource={scheduleData => {
                this.setState({ scheduleData });
              }}
              columns={columns}
              setColumns={this.setColumns}
              children={settingColumns}
              scrollY="calc(68vh - 152px)"
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
