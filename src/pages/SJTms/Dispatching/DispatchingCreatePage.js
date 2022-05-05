import React, { Component } from 'react';
import { Modal, Card, Row, Col, Divider, Input, Select, message } from 'antd';
import { queryAllData, dynamicQuery } from '@/services/quick/Quick';
import { getSchedule, save } from '@/services/sjitms/ScheduleBill';
import CardTable from './CardTable';
import { CreatePageOrderColumns } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import DataType from '@/pages/BillManage/DataType/DataType';
import { sumBy, uniq } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { key } from 'localforage';

const { Search } = Input;
const queryParams = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
];

export default class DispatchingCreatePage extends Component {
  state = {
    saving: false,
    visible: false,
    orders: [],
    vehicles: [],
    employees: [],
    employeeType: [],
    selectVehicle: {},
    selectEmployees: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };
  //编辑排车单初始化数据
  initData = scheduleUuid => {
    getSchedule(scheduleUuid).then(response => {
      let details = response.data.details.map(item => {
        return { ...item, billNumber: item.orderNumber };
      });
      if (response.success) this.setState({ orders: details });
    });
  };

  //显示
  show = (isEdit, record) => {
    this.setState({ visible: true });
    this.getVehicle();
    this.getEmployee();
    this.getEmployeeType();
    isEdit ? this.initData(record.uuid) : this.setState({ orders: record });
  };
  //隐藏
  hide = () => {
    this.setState({ visible: false });
  };

  //获取车辆
  getVehicle = () => {
    queryAllData({ quickuuid: 'sj_itms_vehicle', superQuery: { queryParams } }).then(response => {
      if (response.success) {
        this.setState({ vehicles: response.data.records });
      }
    });
  };
  //获取人员
  getEmployee = () => {
    queryAllData({ quickuuid: 'sj_itms_employee', superQuery: { queryParams } }).then(response => {
      if (response.success) {
        this.setState({ employees: response.data.records });
      }
    });
  };
  //获取员工类型
  getEmployeeType = () => {
    dynamicQuery({
      tableName: 'V_SYS_DICT_ITEM',
      condition: {
        params: [{ field: 'DICT_CODE', rule: 'eq', val: ['employeeType'] }],
      },
    }).then(response => {
      if (response.success) {
        this.setState({ employeeType: response.result.records });
      }
    });
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
  handleVehicle = vehicle => {
    this.setState({ selectVehicle: vehicle });
  };
  vehicleFilter = event => {
    console.log(event.target.value);
  };

  //选人
  handleEmployee = employee => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.UUID == employee.UUID);
    employee.memberType = undefined;
    index == -1 ? employees.push(employee) : employees.splice(index, 1);
    this.setState({ selectEmployees: employees });
  };
  employeeFilter = event => {
    console.log(event.target.value);
  };

  //保存
  handleSave = () => {
    const { orders, selectVehicle, selectEmployees } = this.state;
    const driver = selectEmployees.find(x => x.memberType == 'DRIVER');
    const orderCounts = this.groupByOrder(orders);
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
        return { ...item, orderUuid: item.uuid, orderNumber: item.billNumber };
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
    save(paramBody).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.props.refresh();
        this.hide();
      }
    });
  };
  //汇总
  groupByOrder = data => {
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
      deliveryPointCount: data ? uniq(data.map(x => x.deliveryPoint.code)).length : 0,
      pickupPointCount: data ? uniq(data.map(x => x.pickUpPoint.code)).length : 0,
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
                vehicle == selectVehicle
                  ? dispatchingStyles.selectedVehicleCardWapper
                  : dispatchingStyles.vehicleCardWapper
              }
              onClick={() => this.handleVehicle(vehicle)}
            >
              <span>{vehicle.PLATENUMBER}</span>
            </a>
          );
        })}
      </Card>
    );
  };

  render() {
    const { orders, employeeType, selectEmployees, selectVehicle } = this.state;
    const totalData = this.groupByOrder(orders);
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
      >
        <Row gutter={[8, 0]}>
          <Col span={16}>
            <Card title="订单" bodyStyle={{ padding: 1, height: '36.8vh' }}>
              <CardTable scrollY={'32vh'} dataSource={orders} columns={CreatePageOrderColumns} />
            </Card>
            <Row gutter={[8, 0]} style={{ marginTop: 8 }}>
              <Col span={12}>{this.buildSelectEmployeeCard()}</Col>
              <Col span={12}>{this.buildSelectVehicleCard()}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Card
              title="汇总"
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
                  <div> 总体积</div>
                  <div>
                    <span className={dispatchingStyles.orderTotalNumber}>
                      {totalData.volume.toFixed(4)}
                    </span>
                    <span>m³</span>
                  </div>
                </div>
                <Divider type="vertical" style={{ height: '3.5em' }} />
                <div style={{ flex: 1 }}>
                  <div>总重量</div>
                  <div>
                    <span className={dispatchingStyles.orderTotalNumber}>
                      {totalData.weight.toFixed(4)}
                    </span>
                    <span>kg</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="车辆" style={{ height: '15vh', marginTop: 8 }}>
              {selectVehicle.PLATENUMBER ? (
                <Row>
                  <Col span={6}>
                    <div>{selectVehicle.PLATENUMBER}</div>
                    <div>
                      车型：
                      {selectVehicle.VEHICLETYPE}
                    </div>
                  </Col>
                  <Col span={14} offset={2}>
                    <div>
                      <span>
                        容积：
                        {selectVehicle.BEARVOLUME}
                        m³
                      </span>
                      <span>
                        容积率：
                        {selectVehicle.BEARVOLUMERATE}%
                      </span>
                    </div>
                    <div>
                      载重：
                      {selectVehicle.BEARWEIGHT}
                      kg
                    </div>
                  </Col>
                </Row>
              ) : (
                <></>
              )}
            </Card>
            <Card title="人员明细" style={{ height: '40vh', marginTop: 8 }}>
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
                          <Select.Option key={d.VALUE}>{d.NAME}</Select.Option>
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
      </Modal>
    );
  }
}
