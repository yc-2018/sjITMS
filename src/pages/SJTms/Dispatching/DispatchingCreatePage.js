import React, { Component } from 'react';
import { Modal, Card, Row, Col, Divider, Input, Select, message } from 'antd';
import { queryAllData, dynamicQuery } from '@/services/quick/Quick';
import { save } from '@/services/sjitms/ScheduleBill';
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
    this.getVehicle();
    this.getEmployee();
    this.getEmployeeType();
  };

  //显示
  show = () => {
    this.setState({ visible: true });
  };
  //隐藏
  hide = () => {
    this.setState({ visible: false });
  };

  //TODO 编辑排车单初始化数据

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
    const { data } = this.props;
    const { selectVehicle, selectEmployees } = this.state;
    const driver = selectEmployees.find(x => x.memberType == 'DRIVER');
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
      orderUuids: data.map(x => x.UUID),
      memberDetails: selectEmployees.map((x, index) => {
        return {
          line: index + 1,
          member: { uuid: x.UUID, code: x.CODE, name: x.NAME },
          memberType: x.memberType,
        };
      }),
      cartonCount: sumBy(data.map(x => x.CARTONCOUNT)),
      scatteredCount: sumBy(data.map(x => x.SCATTEREDCOUNT)),
      containerCount: sumBy(data.map(x => x.CONTAINERCOUNT)),
      realCartonCount: sumBy(data.map(x => x.REALCARTONCOUNT)),
      realScatteredCount: sumBy(data.map(x => x.REALSCATTEREDCOUNT)),
      realContainerCount: sumBy(data.map(x => x.REALCONTAINERCOUNT)),
      weight: sumBy(data.map(x => Number(x.REALWEIGHT))),
      volume: sumBy(data.map(x => Number(x.REALVOLUME))),
      totalAmount: 0,
      deliveryPointCount: uniq(data.map(x => x.DELIVERYPOINTCODE)).length,
      pickupPointCount: uniq(data.map(x => x.PICKUPPOINTNAME)).length,
      ownerCount: uniq(data.map(x => x.OWNER)).length,
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
    };
    save(paramBody).then(response => {
      if (response.success) {
        message.success('保存成功！');
        this.hide();
      }
    });
  };

  render() {
    const { modal, data } = this.props;
    const {
      orders,
      vehicles,
      employees,
      employeeType,
      selectVehicle,
      selectEmployees,
    } = this.state;
    return (
      <Modal
        visible={this.state.visible}
        onOk={e => this.handleSave(e)}
        onCancel={() => this.hide()}
        destroyOnClose
        centered
        {...modal}
        className={dispatchingStyles.dispatchingCreatePage}
        bodyStyle={{ margin: -17 }}
      >
        <Row gutter={[8, 0]}>
          <Col span={16}>
            <Card title="订单" bodyStyle={{ padding: 1, height: '36.8vh' }}>
              <CardTable scrollY={'32vh'} dataSource={data} columns={CreatePageOrderColumns} />
            </Card>
            <Row gutter={[8, 0]} style={{ marginTop: 8 }}>
              <Col span={12}>
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
              </Col>
              <Col span={12}>
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
              </Col>
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
                  <div className={dispatchingStyles.orderTotalNumber}>{data.length}</div>
                </div>
                <Divider type="vertical" style={{ height: '3.5em' }} />
                <div style={{ flex: 1 }}>
                  <div>订单数</div>
                  <div className={dispatchingStyles.orderTotalNumber}>{data.length}</div>
                </div>
                <Divider type="vertical" style={{ height: '3.5em' }} />
                <div style={{ flex: 1 }}>
                  <div> 总体积</div>
                  <div>
                    <span className={dispatchingStyles.orderTotalNumber}>
                      {sumBy(data.map(x => x.REALVOLUME)).toFixed(4)}
                    </span>
                    <span>m³</span>
                  </div>
                </div>
                <Divider type="vertical" style={{ height: '3.5em' }} />
                <div style={{ flex: 1 }}>
                  <div>总重量</div>
                  <div>
                    <span className={dispatchingStyles.orderTotalNumber}>
                      {sumBy(data.map(x => x.REALWEIGHT)).toFixed(4)}
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
