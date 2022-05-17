import React, { Component } from 'react';
import {
  Table,
  Modal,
  Card,
  Row,
  Col,
  Divider,
  Input,
  Select,
  Spin,
  message,
  Button,
  Popconfirm,
  Icon,
} from 'antd';
import { queryAllData, dynamicQuery } from '@/services/quick/Quick';
import { getSchedule, save, modify } from '@/services/sjitms/ScheduleBill';
import EditContainerNumberPageF from './EditContainerNumberPageF';
import { CreatePageOrderColumns, employeeType } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import { sumBy, uniq, uniqBy } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Search } = Input;
const queryParams = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
];

export default class DispatchingCreatePage extends Component {
  state = {
    loading: false,
    saving: false,
    visible: false,
    isEdit: false,
    orders: [],
    vehicles: [],
    employees: [],
    selectVehicle: {},
    selectEmployees: [],
    schedule: {},
    editPageVisible: false,
    scheduleDetail: {},
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  //初始化数据
  initData = async (isEdit, record) => {
    console.log('record', record);
    //组装推荐人员车辆接口入参
    // let params = {
    //   storeCodes: record.map(item => {
    //     return item.deliveryPoint.code;
    //   }),
    //   companyUuid: loginCompany().uuid,
    //   dUuid: loginOrg().uuid,
    // };
    // console.log('params', params);
    let { vehicles, employees } = this.state;
    //获取车辆
    if (vehicles.length == 0) {
      const vehiclesData = await queryAllData({
        quickuuid: 'sj_itms_vehicle',
        superQuery: { queryParams },
      });
      vehicles = vehiclesData.data.records;
    }
    //获取人员
    if (employees.length == 0) {
      const employeesData = await queryAllData({
        quickuuid: 'sj_itms_employee',
        superQuery: { queryParams },
      });
      employees = employeesData.data.records;
    }
    isEdit
      ? getSchedule(record.uuid).then(response => {
          if (response.success) {
            let details = response.data.details
              ? response.data.details.map(item => {
                  return { ...item, billNumber: item.orderNumber };
                })
              : [];
            const selectVehicle = vehicles.find(x => x.UUID == response.data.vehicle.uuid);
            //将选中车辆放到第一位
            let obj = {};
            vehicles.forEach((item, index) => {
              if (item.CODE == selectVehicle.CODE) {
                obj = item;
                vehicles.splice(index, 1);
                return;
              }
            });
            vehicles.unshift(obj);
            const memberList = response.data.memberDetails.map(x => x.member);
            const selectEmployees =
              employees.length != 0
                ? response.data.memberDetails.map(record => {
                    let employee = employees.find(x => x.UUID == record.member.uuid);
                    employee.memberType = record.memberType;
                    return employee;
                  })
                : [];

            //选中的人放到第一位
            employees = uniqBy([...selectEmployees, ...employees], 'CODE');

            this.setState({
              vehicles,
              employees,
              orders: details,
              schedule: response.data,
              selectVehicle: selectVehicle == undefined ? {} : selectVehicle,
              selectEmployees,
              loading: false,
            });
          }
        })
      : this.setState({ vehicles, employees, orders: record, loading: false });
  };

  //显示
  show = (isEdit, record) => {
    this.setState({ visible: true, isEdit, loading: true });
    this.initData(isEdit, record);
  };
  //隐藏
  hide = () => {
    this.setState({ visible: false });
  };

  exit = () => {
    this.setState({ visible: false, selectEmployees: [], selectVehicle: [] });
  };

  //员工类型选择事件
  handleEmployeeTypeChange = employee => {
    const { selectEmployees } = this.state;
    return val => {
      employee.memberType = val;
      selectEmployees.splice(selectEmployees.indexOf(employee), 1, employee);
      this.setState({ selectEmployees });
    };
  };

  //选车
  handleVehicle = async vehicle => {
    let param = {
      tableName: 'v_sj_itms_vehicle_employee_z',
      condition: {
        params: [{ field: 'VEHICLEUUID', rule: 'eq', val: [vehicle.UUID] }],
      },
    };
    const response = await dynamicQuery(param);
    const { selectEmployees } = this.state;
    let vehicleEmployees = [];
    if (response.success && response.result.records != 'false') {
      vehicleEmployees = uniqBy(response.result.records, 'CODE').map(item => {
        return {
          ...item,
          memberType: item.ROLE_TYPE,
        };
      });
    }
    this.setState({ selectVehicle: vehicle, selectEmployees: [...vehicleEmployees] });
  };
  vehicleFilter = event => {
    console.log(event.target.value);
  };

  //选人
  handleEmployee = employee => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.UUID == employee.UUID);
    employee.memberType = employee.ROLE_TYPE;
    index == -1 ? employees.push(employee) : employees.splice(index, 1);
    this.setState({ selectEmployees: employees });
  };
  employeeFilter = event => {
    console.log(event.target.value);
  };

  //移除明细
  removeDetail = record => {
    const { orders } = this.state;
    orders.splice(orders.findIndex(x => x.uuid == record.uuid), 1);
    this.setState({ orders });
  };

  //保存
  handleSave = async () => {
    const { isEdit, orders, schedule, selectVehicle, selectEmployees } = this.state;
    const driver = selectEmployees.find(x => x.memberType == 'Driver');
    const orderCounts = this.groupByOrder(orders);
    //校验容积
    const exceedVolume = orderCounts.volume - selectVehicle.BEARVOLUME;
    if (exceedVolume > 0) {
      message.warning(
        '排车体积超过车辆可装载的最大体积，超出' + exceedVolume.toFixed(2) + 'm³，请检查后重试！'
      );
      return;
    }
    //校验载重
    const exceedWeight = orderCounts.weight - selectVehicle.BEARWEIGHT;
    if (exceedWeight > 0) {
      message.warning(
        '排车重量超过车辆可运输的最大限重，超出' + exceedWeight.toFixed(2) + 'kg，请检查后重试！'
      );
      return;
    }
    const paramBody = {
      type: 'Job',
      vehicle: {
        uuid: selectVehicle.UUID,
        code: selectVehicle.CODE,
        name: selectVehicle.PLATENUMBER,
      },
      vehicleType: {
        uuid: selectVehicle.VEHICLETYPEUUID,
        code: selectVehicle.VEHICLETYPECODE,
        name: selectVehicle.VEHICLETYPENAME,
      },
      carrier: {
        uuid: driver.UUID,
        code: driver.CODE,
        name: driver.NAME,
      },
      details: orders.map(item => {
        return {
          ...item,
          orderUuid: item.orderUuid || item.uuid,
          orderNumber: item.orderNumber || item.billNumber,
        };
      }),
      memberDetails: selectEmployees.map((x, index) => {
        return {
          line: index + 1,
          member: { uuid: x.UUID, code: x.CODE, name: x.NAME },
          memberType: x.memberType,
        };
      }),
      ...orderCounts,
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
    };
    const response = isEdit
      ? await modify(Object.assign(schedule, paramBody))
      : await save(paramBody);
    if (response.success) {
      message.success('保存成功！');
      this.props.refresh();
      //保存后清空选中的车与人
      this.setState({ selectEmployees: [], selectVehicle: [], loading: false });
      this.hide();
    }
  };
  //汇总
  groupByOrder = data => {
    const deliveryPointCount = data ? uniq(data.map(x => x.deliveryPoint.code)).length : 0;
    const pickupPointCount = data ? uniq(data.map(x => x.pickUpPoint.code)).length : 0;
    data = data.filter(x => x.orderType !== 'OnlyBill');
    return {
      orderCount: data ? data.length : 0,
      cartonCount: data ? sumBy(data.map(x => x.cartonCount)) : 0,
      scatteredCount: data ? sumBy(data.map(x => x.scatteredCount)) : 0,
      containerCount: data ? sumBy(data.map(x => x.containerCount)) : 0,
      realCartonCount: data ? sumBy(data.map(x => x.realCartonCount)) : 0,
      realScatteredCount: data ? sumBy(data.map(x => x.realScatteredCount)) : 0,
      realContainerCount: data ? sumBy(data.map(x => x.realContainerCount)) : 0,
      weight: data ? sumBy(data.map(x => Number(x.weight))) : 0,
      volume: data ? sumBy(data.map(x => Number(x.volume))) : 0,
      totalAmount: data ? sumBy(data.map(x => Number(x.amount))) : 0,
      deliveryPointCount,
      pickupPointCount,
      ownerCount: data ? uniq(data.map(x => x.owner.code)).length : 0,
    };
  };

  buildSelectEmployeeCard = () => {
    const { employees, selectEmployees } = this.state;
    return (
      <Card
        title="员工"
        style={{ height: '40vh' }}
        bodyStyle={{ padding: 5, height: '35vh', overflowY: 'auto' }}
        extra={
          <Search
            placeholder="请输入工号或姓名"
            onChange={this.employeeFilter}
            style={{ width: 200 }}
          />
        }
      >
        {employees.map(employee => {
          return (
            <a
              href="#"
              className={
                selectEmployees.find(x => x.UUID == employee.UUID)
                  ? dispatchingStyles.selectedVehicleCardWapper
                  : dispatchingStyles.vehicleCardWapper
              }
              onClick={() => this.handleEmployee(employee)}
            >
              <span>{`[${employee.CODE}]` + employee.NAME}</span>
              <br />
              <span>{employee.ROLE_TYPE2}</span>
            </a>
          );
        })}
      </Card>
    );
  };
  buildSelectVehicleCard = () => {
    const { vehicles, selectVehicle } = this.state;
    return (
      <Card
        title="车辆"
        style={{ height: '40vh' }}
        bodyStyle={{ padding: 5, height: '35vh', overflowY: 'auto' }}
        extra={
          <Search
            placeholder="请输入车辆编号或车牌号"
            onChange={this.vehicleFilter}
            style={{ width: 200 }}
          />
        }
      >
        {vehicles.map(vehicle => {
          return (
            <a
              href="#"
              className={
                vehicle.UUID == selectVehicle.UUID
                  ? dispatchingStyles.selectedVehicleCardWapper
                  : dispatchingStyles.vehicleCardWapper
              }
              onClick={() => this.handleVehicle(vehicle)}
            >
              <span>
                <Icon type="car" />
                &nbsp;
                {vehicle.PLATENUMBER}
              </span>
            </a>
          );
        })}
      </Card>
    );
  };

  //拆单
  editSource = record => {
    this.setState({ editPageVisible: true, scheduleDetail: record });
  };

  updateCount = e => {
    const { orders } = this.state;
    for (const order of orders) {
      if (order.billNumber == e.billNumber) {
        order.realCartonCount -= e.count.cartonCount;
        break;
      }
    }
    this.setState({ orders, editPageVisible: false });
  };

  render() {
    const {
      loading,
      orders,
      selectEmployees,
      selectVehicle,
      scheduleDetail,
      editPageVisible,
    } = this.state;
    const totalData = this.groupByOrder(orders);
    const buildRowOperation = {
      title: '操作',
      width: 100,
      className: 'tools-center',
      render: record => (
        <div>
          <div>
            <Popconfirm
              title="确定移除吗?"
              onConfirm={() => this.removeDetail(record)}
              okText="确定"
              cancelText="取消"
            >
              <a href="#">移除</a>
            </Popconfirm>

            <Divider type="vertical" style={{ height: '1em' }} />
            <a
              href="#"
              onClick={() => {
                this.editSource(record);
              }}
            >
              拆单
            </a>
          </div>
        </div>
      ),
    };
    return (
      <Modal
        visible={this.state.visible}
        onOk={e => this.handleSave(e)}
        onCancel={() => this.hide()}
        destroyOnClose
        centered
        {...this.props.modal}
        className={dispatchingStyles.dispatchingCreatePage}
        bodyStyle={{ margin: -17 }}
        footer={[
          <span>
            <Button onClick={this.exit}>取消</Button>
            <Button onClick={this.hide}>临时保存</Button>
            <Button type="primary" onClick={e => this.handleSave(e)} loading={loading}>
              生成排车单
            </Button>
          </span>,
        ]}
      >
        <EditContainerNumberPageF
          modal={{ title: '编辑' }}
          updateCount={e => this.updateCount(e)}
          visible={editPageVisible}
          scheduleDetail={scheduleDetail}
          onCancel={() => this.setState({ editPageVisible: false })}
        />
        <Spin spinning={loading}>
          <Row gutter={[8, 0]}>
            <Col span={16}>
              <Card title="订单" bodyStyle={{ padding: 1, height: '38.5vh' }}>
                <Table
                  size="small"
                  className={dispatchingStyles.dispatchingTable}
                  columns={[...CreatePageOrderColumns, buildRowOperation]}
                  dataSource={orders}
                  pagination={false}
                  scroll={{ y: '32vh', x: '100%' }}
                />
              </Card>
              <Row gutter={[8, 0]} style={{ marginTop: 8 }}>
                <Col span={12}>{this.buildSelectVehicleCard()}</Col>
                <Col span={12}>{this.buildSelectEmployeeCard()}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Card
                title="订单汇总"
                className={dispatchingStyles.orderTotalCard}
                bodyStyle={{ padding: 5 }}
              >
                <div className={dispatchingStyles.orderTotalCardBody}>
                  <div style={{ flex: 1 }}>
                    <div>送货点数</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {totalData.deliveryPointCount}
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>订单数</div>
                    <div className={dispatchingStyles.orderTotalNumber}>{totalData.orderCount}</div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div> 体积</div>
                    <div>
                      <span className={dispatchingStyles.orderTotalNumber}>
                        {totalData.volume.toFixed(4)}
                      </span>
                      <span>m³</span>
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>重量</div>
                    <div>
                      <span className={dispatchingStyles.orderTotalNumber}>
                        {totalData.weight.toFixed(4)}
                      </span>
                      <span>kg</span>
                    </div>
                  </div>
                </div>
                <div className={dispatchingStyles.orderTotalCardBody}>
                  <div style={{ flex: 1 }}>
                    <div>整件</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {totalData.realCartonCount}
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>周转箱</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {totalData.realContainerCount}
                    </div>
                  </div>
                </div>
              </Card>
              <Card
                title={
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectVehicle.PLATENUMBER
                        ? '已选车辆: ' +
                          selectVehicle.PLATENUMBER +
                          ' &nbsp;&nbsp;' +
                          selectVehicle.VEHICLETYPE
                        : '车辆',
                    }}
                  />
                }
                style={{ height: '20.2vh', marginTop: 8, overflow: 'auto' }}
              >
                {selectVehicle.PLATENUMBER ? (
                  <Row>
                    <Col>
                      <div className={dispatchingStyles.orderTotalCardBody2}>
                        <div style={{ flex: 1 }}>
                          <div>容积</div>
                          <div className={dispatchingStyles.orderTotalNumber}>
                            {selectVehicle.BEARVOLUME}
                            m³
                          </div>
                        </div>
                        <Divider type="vertical" style={{ height: '3.5em' }} />
                        <div style={{ flex: 1 }}>
                          <div>容积率</div>
                          <div>
                            <span className={dispatchingStyles.orderTotalNumber}>
                              {selectVehicle.BEARVOLUMERATE}%
                            </span>
                          </div>
                        </div>
                        <Divider type="vertical" style={{ height: '3.5em' }} />
                        <div style={{ flex: 1 }}>
                          <div>载重</div>
                          <div>
                            <span className={dispatchingStyles.orderTotalNumber}>
                              {selectVehicle.BEARWEIGHT}
                              kg
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={dispatchingStyles.orderTotalCardBody}>
                        <div style={{ flex: 1 }}>
                          <div>剩余可装容积</div>
                          <div className={dispatchingStyles.orderTotalNumber}>
                            <span
                              style={
                                selectVehicle.BEARVOLUME - totalData.volume.toFixed(4) > 0
                                  ? { color: 'green' }
                                  : { color: 'red' }
                              }
                            >
                              {selectVehicle.BEARVOLUME - totalData.volume.toFixed(4)}
                              m³
                            </span>
                          </div>
                        </div>
                        <Divider type="vertical" style={{ height: '3.5em' }} />
                        <div style={{ flex: 1 }}>
                          <div>剩余可装重量</div>
                          <div className={dispatchingStyles.orderTotalNumber}>
                            <span
                              style={
                                selectVehicle.BEARWEIGHT - totalData.weight.toFixed(4) > 0
                                  ? { color: 'green' }
                                  : { color: 'red' }
                              }
                            >
                              {selectVehicle.BEARWEIGHT - totalData.weight.toFixed(4)}
                              kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <></>
                )}
              </Card>
              <Card
                title="人员明细"
                style={{ height: '40vh', marginTop: 8 }}
                bodyStyle={{ height: '35vh', overflowY: 'scroll' }}
              >
                {selectEmployees.map(employee => {
                  return (
                    <Row gutter={[8, 8]}>
                      <Col span={8}>
                        <div style={{ lineHeight: '30px' }}>
                          {`[${employee.CODE}]` + employee.NAME}
                        </div>
                      </Col>
                      <Col span={10}>
                        <Select
                          placeholder="请选择员工类型"
                          onChange={this.handleEmployeeTypeChange(employee)}
                          style={{ width: '100%' }}
                          value={employee.memberType}
                        >
                          {employeeType.map(d => (
                            <Select.Option key={d.name}>{d.caption}</Select.Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={4} offset={2}>
                        <a
                          href="#"
                          style={{ lineHeight: '30px' }}
                          onClick={() => {
                            this.handleEmployee(employee);
                          }}
                        >
                          移除
                        </a>
                      </Col>
                    </Row>
                  );
                })}
              </Card>
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
