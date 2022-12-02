/*
 * @Author: guankongjin
 * @Date: 2022-03-31 09:15:58
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-02 15:47:25
 * @Description: 排车单面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SchedulePage.js
 */
import React, { Component } from 'react';
import { Modal, Tabs, Button, message, Typography, Dropdown, Menu, Icon } from 'antd';
import DispatchingTable from './DispatchingTable';
import DispatchingCreatePage from './DispatchingCreatePage';
import OrderPoolSearchForm from './OrderPoolSearchForm';
import BatchProcessConfirm from './BatchProcessConfirm';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import mapIcon from '@/assets/common/map.svg';
import { ScheduleColumns, pagination } from './DispatchingColumns';
import DispatchMap from '@/pages/SJTms/MapDispatching/schedule/ScheduleMap';
import dispatchingStyles from './Dispatching.less';
import { convertDateToTime } from '@/utils/utils';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { orderBy } from 'lodash';
import { queryAllData, queryData } from '@/services/quick/Quick';
import {
  approve,
  cancelApprove,
  cancelAborted,
  aborted,
  remove,
  getVehicleByScheduleUuid,
} from '@/services/sjitms/ScheduleBill';
import { query } from '@/services/account/User';
import ScheduleCreatePage from '@/pages/SJTms/Schedule/ScheduleCreatePage';
import WeightApplyModal from './WeightApplyModal';
import { havePermission } from '@/utils/authority';

const { Text } = Typography;
const { TabPane } = Tabs;

export default class SchedulePage extends Component {
  state = {
    loading: false,
    columns: [...ScheduleColumns],
    savedRowKeys: [],
    approvedRowKeys: [],
    abortedRowKeys: [],
    activeKey: 'Saved',
    searchPagination: false,
    searchFilter: { Saved: [], Approved: [], Aborted: [] },
    scheduleData: [],
    approvedData: [],
    abortedData: [],
    editPageVisible: false,
    users: [],
    authority: this.props.authority ? this.props.authority[0] : null,
    maxAdjustWeight: '',
  };

  componentDidMount() {
    query({}).then(res => {
      if (res.success) {
        this.setState({ users: res.data.records });
      }
    });
  }
  isOrgQuery = [
    { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
    { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
  ];
  //刷新
  refreshTable = (searchKeyValues, key) => {
    this.refreshSchedulePool(searchKeyValues, undefined, undefined, key);
    this.props.refreshDetail(undefined);
  };
  refreshScheduleAndpending = () => {
    this.refreshTable();
    this.props.refreshPending();
  };

  //获取排车单
  refreshSchedulePool = (params, pages, sorter, key) => {
    let { searchFilter, searchPagination } = this.state;
    const activeKey = key ? key : this.state.activeKey;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      if (params.superQuery) {
        filter = params;
        searchFilter[activeKey] = params.superQuery.queryParams;
      } else {
        searchFilter[activeKey] = params;
      }
    }
    if (sorter && sorter.column) {
      filter.order =
        (sorter.column.sorterCode ? sorter.columnKey + 'Code' : sorter.columnKey) +
        ',' +
        sorter.order;
    }
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
    } else {
      filter.page = searchPagination.current;
      filter.pageSize = searchPagination.pageSize || 100;
    }
    filter.superQuery.queryParams = [
      ...searchFilter[activeKey],
      ...this.isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'eq', val: activeKey },
    ];
    filter.quickuuid = 'sj_itms_schedulepool';
    this.searchSchedulePool(filter, searchFilter, searchPagination, activeKey);
  };
  searchSchedulePool = async (filter, searchFilter, searchPagination, activeKey) => {
    this.setState({ loading: true });
    const response = await queryData(filter);
    if (response.success) {
      searchPagination = {
        ...pagination,
        total: response.data.paging.recordCount,
        pageSize: response.data.paging.pageSize,
        current: response.data.page,
        showTotal: total => `共 ${total} 条`,
      };
      let scheduleData = response.data.records ? response.data.records : [];
      scheduleData = scheduleData?.map(order => {
        order.uuid = `${order.UUID}`;
        order.warning = order.ISSPLIT > 0;
        return order;
      });
      this.setState({
        searchPagination,
        scheduleData,
        savedRowKeys: [],
        approvedRowKeys: [],
        abortedRowKeys: [],
      });
    }
    this.setState({ activeKey, loading: false, searchFilter });
  };

  //标签页切换
  handleTabChange = activeKey => {
    this.refreshTable(undefined, activeKey);
  };

  //新建排车单
  handleCreateSchedule = () => {
    this.createSchedulePageRef.show();
  };

  //申请调吨
  showUpdateWeigthPop = async () => {
    const { savedRowKeys } = this.state;
    if (savedRowKeys.length != 1) {
      message.error('请选择一条数据');
      return;
    }
    await getVehicleByScheduleUuid(savedRowKeys[0]).then(result => {
      if (result.success && result.data) {
        this.setState({ maxAdjustWeight: result.data.maxAdjustWeight });
      }
      this.weightApplyModalRef.show();
    });
  };

  //排车单编辑
  editTable = record => {
    return () => {
      this.createPageModalRef.show(true, record);
    };
  };

  //作废
  handleAborted = () => {
    const { savedRowKeys } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (savedRowKeys.length == 1) {
      Modal.confirm({
        title: '是否确认作废排车单？',
        onOk: async () => {
          this.abortedSchedule(savedRowKeys[0]).then(response => {
            if (response.success) {
              message.success('作废成功！');
              this.refreshSchedulePool();
              this.props.refreshPending();
            }
          });
        },
      });
    } else {
      this.batchProcessConfirmRef.show(
        '作废',
        savedRowKeys,
        this.abortedSchedule,
        this.refreshScheduleAndpending
      );
    }
  };
  abortedSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.STAT != 'Saved') {
      return null;
    }
    return await aborted(schedule.uuid);
  };

  //取消作废
  handleCancelAborted = () => {
    const { abortedRowKeys } = this.state;
    if (abortedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (abortedRowKeys.length == 1) {
      this.cancelAbortedSchedule(abortedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('取消作废成功！');
          this.refreshSchedulePool();
          this.props.refreshPending();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '取消作废',
        abortedRowKeys,
        this.cancelAbortedSchedule,
        this.refreshScheduleAndpending
      );
    }
  };
  cancelAbortedSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.STAT != 'Aborted') {
      return null;
    }
    return await cancelAborted(schedule.uuid, schedule.VERSION);
  };

  //取消批准
  handleCancelApprove = () => {
    const { approvedRowKeys } = this.state;
    if (approvedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (approvedRowKeys.length == 1) {
      this.cancelApproveSchedule(approvedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('取消批准成功！');
          this.refreshSchedulePool();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '取消批准',
        approvedRowKeys,
        this.cancelApproveSchedule,
        this.refreshTable
      );
    }
  };
  cancelApproveSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.STAT != 'Approved') {
      return null;
    }
    return await cancelApprove(schedule.uuid, schedule.VERSION);
  };

  //批准
  handleApprove = () => {
    const { savedRowKeys } = this.state;
    if (savedRowKeys.length == 0) {
      message.warning('请选择排车单！');
      return;
    }
    if (savedRowKeys.length == 1) {
      this.approveSchedule(savedRowKeys[0]).then(response => {
        if (response.success) {
          message.success('批准成功！');
          this.refreshSchedulePool();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '批准',
        savedRowKeys,
        this.approveSchedule,
        this.refreshTable
      );
    }
  };
  approveSchedule = async uuid => {
    const { scheduleData } = this.state;
    const schedule = scheduleData.find(x => x.uuid == uuid);
    if (schedule.STAT != 'Saved') {
      return null;
    }
    return await approve(schedule.uuid, schedule.VERSION);
  };

  //删除
  handleDelete = () => {
    const { savedRowKeys } = this.state;
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
            this.refreshSchedulePool();
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
        // selectSchedule.isSelect = true;
      }
      item.clicked = selected && !item.clicked;
      return item;
    });
    this.setState({ scheduleData: newScheduleData }, () => {
      this.props.refreshDetail(selectSchedule);
    });
  };

  //打印
  handlePrint = async () => {
    const { approvedRowKeys } = this.state;
    if (approvedRowKeys.length == 0) {
      message.warn('请选择需要打印的排车单！');
      return;
    }
    const hide = message.loading('加载中...', 0);
    const LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('排车单打印');
    LODOP.SET_PRINT_PAGESIZE(1, 2100, 1400, '210mm*140mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2); //打印项在纸张中水平居中
    await this.buildPrintPage();
    const printPages = document.getElementById('printSchedule').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', '96%', page.innerHTML);
    });
    LODOP.PREVIEW();
    hide();
    this.setState({ printPage: undefined });
  };
  buildPrintPage = async () => {
    const { scheduleData, approvedRowKeys } = this.state;
    const printPages = [];
    for (let index = 0; approvedRowKeys.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_print_schedule_order',
        superQuery: {
          queryParams: [
            { field: 'billuuid', type: 'VarChar', rule: 'eq', val: approvedRowKeys[index] },
          ],
        },
      });
      let scheduleDetails = response.success ? response.data.records : [];
      scheduleDetails = orderBy(scheduleDetails, x => x.DELIVERYPOINTCODE);
      const printPage = drawPrintPage(
        scheduleData.find(x => x.uuid == approvedRowKeys[index]),
        scheduleDetails
      );
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };

  buildOperations = activeKey => {
    switch (activeKey) {
      case 'Approved':
        return (
          <div>
            <Button
              style={{ marginLeft: 10 }}
              onClick={this.handlePrint}
              hidden={!havePermission(this.state.authority + '.print')}
            >
              打印
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={this.handleCancelApprove}
              hidden={!havePermission(this.state.authority + '.cancelApprove')}
            >
              取消批准
            </Button>
          </div>
        );
      case 'Aborted':
        return (
          <Button
            style={{ marginLeft: 10 }}
            onClick={this.handleCancelAborted}
            hidden={!havePermission(this.state.authority + '.cancelInvalid')}
          >
            取消作废
          </Button>
        );
      default:
        return (
          <div>
            <Button
              onClick={this.handleCreateSchedule}
              hidden={!havePermission(this.state.authority + '.create')}
            >
              新建
            </Button>
            <Button
              onClick={this.showUpdateWeigthPop}
              style={{ marginLeft: 10 }}
              hidden={!havePermission(this.state.authority + '.ton')}
            >
              申请调吨
            </Button>
            <Button
              type={'primary'}
              style={{ marginLeft: 10 }}
              onClick={this.handleApprove}
              hidden={!havePermission(this.state.authority + '.approve')}
            >
              批准
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={this.handleAborted}
              hidden={!havePermission(this.state.authority + '.invalid')}
            >
              作废
            </Button>
          </div>
        );
    }
  };

  render() {
    const {
      loading,
      columns,
      printPage,
      users,
      searchPagination,
      scheduleData,
      activeKey,
      savedRowKeys,
      approvedRowKeys,
      abortedRowKeys,
      maxAdjustWeight,
    } = this.state;

    columns[0].render = (val, record) => {
      return record.STAT == 'Saved' ? (
        <a href="#" onClick={this.editTable(record)}>
          {val}
        </a>
      ) : (
        <EllipsisCol colValue={val} />
      );
    };

    return (
      <div>
        {/* 批量操作 */}
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <DispatchMap onRef={node => (this.dispatchMapRef = node)} />
        {/* 编辑排车单 */}
        <DispatchingCreatePage
          modal={{ title: '编辑排车单' }}
          refresh={() => {
            this.refreshScheduleAndpending();
            this.props.refreshOrder();
          }}
          onRef={node => (this.createPageModalRef = node)}
        />
        {/* 新建排车单 */}
        <CreatePageModal
          modal={{ title: '新建排车单', width: 1000 }}
          page={{
            quickuuid: 'sj_itms_schedule',
            showPageNow: 'create',
          }}
          customPage={ScheduleCreatePage}
          onSaved={() => {
            this.createSchedulePageRef.hide();
            this.refreshTable();
          }}
          onRef={node => (this.createSchedulePageRef = node)}
        />
        {/*申请调吨 */}
        <WeightApplyModal
          key={savedRowKeys[0]}
          maxAdjustWeight={maxAdjustWeight}
          savedRowKeys={savedRowKeys[0]}
          onRef={node => (this.weightApplyModalRef = node)}
        />
        <Tabs
          activeKey={activeKey}
          onChange={this.handleTabChange}
          tabBarExtraContent={this.buildOperations(activeKey)}
        >
          <TabPane tab={<Text className={dispatchingStyles.cardTitle}>排车单</Text>} key="Saved">
            {/* <ScheduleSearchForm refresh={this.refreshTable} users={users} /> */}
            {/* 查询表单 */}
            <OrderPoolSearchForm
              quickuuid="sj_itms_schedulepool"
              users={users}
              refreshOrderPool={this.refreshTable}
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      this.dispatchMapRef.show(savedRowKeys);
                    }}
                  >
                    <img src={mapIcon} style={{ width: 20, height: 20 }} />
                    排车单地图
                  </Menu.Item>
                </Menu>
              }
              trigger={['contextMenu']}
            >
              <div>
                <DispatchingTable
                  comId="saveSchedule"
                  clickRow
                  pagination={searchPagination || false}
                  loading={loading}
                  onClickRow={this.onClickRow}
                  selectedRowKeys={savedRowKeys}
                  refreshDataSource={(_, pagination, sorter) => {
                    this.refreshSchedulePool(undefined, pagination, sorter);
                  }}
                  changeSelectRows={this.tableChangeRows()}
                  dataSource={scheduleData}
                  columns={columns}
                  scrollY="calc(86vh - 180px)"
                />
              </div>
            </Dropdown>
            {scheduleData.length == 0 ? (
              <></>
            ) : (
              <div className={dispatchingStyles.orderPoolFooter}>
                <div className={dispatchingStyles.orderTotalPane}>
                  <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
                  <span style={{ marginLeft: 5 }}>
                    已选择
                    <span style={{ color: '#3B77E3', margin: '0 2px' }}>{savedRowKeys.length}</span>
                    项
                  </span>
                  <a
                    href="##"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.setState({ savedRowKeys: [] });
                      this.props.refreshDetail(undefined);
                    }}
                  >
                    取消全部
                  </a>
                </div>
              </div>
            )}
          </TabPane>
          <TabPane tab={<Text className={dispatchingStyles.cardTitle}>已批准</Text>} key="Approved">
            {/* <ScheduleSearchForm refresh={this.refreshTable} users={users} /> */}
            {/* 查询表单 */}
            <OrderPoolSearchForm
              quickuuid="sj_itms_schedulepool"
              users={users}
              refreshOrderPool={this.refreshTable}
            />
            <div id="printSchedule" style={{ display: 'none' }}>
              {printPage}
            </div>
            <DispatchingTable
              comId="approvedSchedule"
              clickRow
              pagination={searchPagination || false}
              loading={loading}
              onClickRow={this.onClickRow}
              selectedRowKeys={approvedRowKeys}
              changeSelectRows={this.tableChangeRows('Approved')}
              dataSource={scheduleData}
              refreshDataSource={(_, pagination, sorter) => {
                this.refreshSchedulePool(undefined, pagination, sorter);
              }}
              columns={columns}
              scrollY="calc(86vh - 180px)"
            />
            {scheduleData.length == 0 ? (
              <></>
            ) : (
              <div className={dispatchingStyles.orderPoolFooter}>
                <div className={dispatchingStyles.orderTotalPane}>
                  <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
                  <span style={{ marginLeft: 5 }}>
                    已选择
                    <span style={{ color: '#3B77E3', margin: '0 2px' }}>
                      {approvedRowKeys.length}
                    </span>
                    项
                  </span>
                  <a
                    href="##"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.setState({ approvedRowKeys: [] });
                      this.props.refreshDetail(undefined);
                    }}
                  >
                    取消全部
                  </a>
                </div>
              </div>
            )}
          </TabPane>
          <TabPane tab={<Text className={dispatchingStyles.cardTitle}>已作废</Text>} key="Aborted">
            {/* <ScheduleSearchForm refresh={this.refreshTable} users={users} /> */}
            {/* 查询表单 */}
            <OrderPoolSearchForm
              quickuuid="sj_itms_schedulepool"
              users={users}
              refreshOrderPool={this.refreshTable}
            />
            <DispatchingTable
              comId="abortedSchedule"
              clickRow
              pagination={searchPagination || false}
              loading={loading}
              onClickRow={this.onClickRow}
              selectedRowKeys={abortedRowKeys}
              changeSelectRows={this.tableChangeRows('Aborted')}
              dataSource={scheduleData}
              refreshDataSource={(_, pagination, sorter) => {
                this.refreshSchedulePool(undefined, pagination, sorter);
              }}
              columns={columns}
              scrollY="calc(86vh - 180px)"
            />
            {scheduleData.length == 0 ? (
              <></>
            ) : (
              <div className={dispatchingStyles.orderPoolFooter}>
                <div className={dispatchingStyles.orderTotalPane}>
                  <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
                  <span style={{ marginLeft: 5 }}>
                    已选择
                    <span style={{ color: '#3B77E3', margin: '0 2px' }}>
                      {abortedRowKeys.length}
                    </span>
                    项
                  </span>
                  <a
                    href="##"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.setState({ abortedRowKeys: [] });
                      this.props.refreshDetail(undefined);
                    }}
                  >
                    取消全部
                  </a>
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

//装车单
const drawPrintPage = (schedule, scheduleDetails) => {
  return (
    <div>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: 0 }}
        border={1}
        cellPadding={0}
        cellSpacing={0}
      >
        <thead>
          <tr style={{ height: 50 }}>
            <th colspan={2} style={{ border: 0 }} />
            <th colspan={4} style={{ border: 0 }}>
              <div style={{ fontSize: 18, textAlign: 'center' }}>广东时捷物流有限公司装车单</div>
            </th>
            <th colspan={2} style={{ border: 0 }}>
              <div style={{ fontSize: 14, textAlign: 'center' }}>
                <span>第</span>
                <font tdata="PageNO" color="blue">
                  ##
                </font>
                <span>页/共</span>
                <font color="blue" style={{ textDecoration: 'underline blue' }} tdata="PageCount">
                  ##
                </font>
                <span>页</span>
              </div>
            </th>
          </tr>
          <tr>
            <th colspan={8} style={{ border: 0, height: 20 }}>
              <div style={{ textAlign: 'left', fontWeight: 'normal' }}>
                <div style={{ float: 'left', width: '25%' }}>单号： {schedule.BILLNUMBER}</div>
                <div style={{ float: 'left', width: '25%' }}>
                  车牌号： {schedule.VEHICLEPLATENUMBER}
                </div>
                <div style={{ float: 'left', width: '25%' }}>
                  打印时间： {convertDateToTime(new Date())}
                </div>
                <div style={{ float: 'left', width: '22%' }}>制单人： {loginUser().name}</div>
              </div>
            </th>
          </tr>
          <tr style={{ height: 25 }}>
            <th width={50}>序号</th>
            <th width={120}>销售单号</th>
            <th width={100}>客户编号</th>
            <th width={170}>客户名称</th>
            <th width={80}>整件</th>
            <th width={80}>散件</th>
            <th width={80}>板位</th>
            <th width={60}>备注</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDetails ? (
            scheduleDetails.map((item, index) => {
              return (
                <tr style={{ textAlign: 'center', height: 20 }}>
                  <td width={50}>{index + 1}</td>
                  <td width={120}>{item.SOURCENUM}</td>
                  <td width={100}>{item.DELIVERYPOINTCODE}</td>
                  <td width={170}>{item.DELIVERYPOINTNAME}</td>
                  <td width={80}>{item.REALCARTONCOUNT}</td>
                  <td width={80}>{item.REALSCATTEREDCOUNT}</td>
                  <td width={80}>{item.COLLECTBIN}</td>
                  <td width={60}>{item.NOTE || ''}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
        <tfoot>
          <tr style={{ height: 20 }}>
            <td colspan={4}>合计:</td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="5">
                ######
              </font>
            </td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="6">
                ######
              </font>
            </td>
            <td colspan={2} />
          </tr>
          <tr style={{ height: 20 }}>
            <td colspan={8}>
              备注：
              {schedule.NOTE}
            </td>
          </tr>
          <tr style={{ height: 25 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ float: 'left', width: '25%' }}>装车员:</div>
              <div style={{ float: 'left', width: '25%' }}>司机:</div>
              <div style={{ float: 'left', width: '25%' }}> 送货员:</div>
              <div style={{ float: 'left', width: '22%' }}>调度:</div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
