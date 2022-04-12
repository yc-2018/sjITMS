import React, { Component } from 'react';
import { Modal, Card, Row, Col, Divider, Input } from 'antd';
import { queryAllData } from '@/services/quick/Quick';
import CardTable from './CardTable';
import { CreatePageOrderColumns } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import DataType from '@/pages/BillManage/DataType/DataType';
import { sumBy } from 'lodash';

const { Search } = Input;
/**
 * 弹窗式表单页面
 * modal    模态窗口的props
 * page     CreatePage的props
 * onRef    获取本类，可以调用 show 方法弹出窗口
 */
export default class DispatchingCreatePage extends Component {
  state = {
    saving: false,
    visible: false,
    orders: [],
    vehicles: [],
    employees: [],
    selectVehicle: {},
    selectEmployees: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
    this.getVehicle();
    this.getEmployee();
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
    queryAllData({ quickuuid: 'sj_itms_vehicle' }).then(response => {
      if (response.success) {
        this.setState({ vehicles: response.data.records });
      }
    });
  };

  //获取人员
  getEmployee = () => {
    queryAllData({ quickuuid: 'sj_itms_employee' }).then(response => {
      if (response.success) {
        this.setState({ employees: response.data.records });
      }
    });
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
    index == -1 ? employees.push(employee) : employees.splice(index, 1);
    this.setState({ selectEmployees: employees });
  };
  employeeFilter = event => {
    console.log(event.target.value);
  };

  //保存
  handleSave = () => {};

  render() {
    const { modal, data } = this.props;
    const { orders, vehicles, employees, selectVehicle, selectEmployees } = this.state;
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
              <CardTable
                scrollY={'32vh'}
                dataSource={data}
                quickuuid="sj_itms_dispatching_orderpool"
                columns={CreatePageOrderColumns}
              />
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
              <div>{selectVehicle.PLATENUMBER}</div>
            </Card>
            <Card title="人员明细" style={{ height: '40vh', marginTop: 8 }}>
              {selectEmployees.map(employee => {
                return (
                  <div>
                    <span>{`[${employee.CODE}]` + employee.NAME}</span>
                  </div>
                );
              })}
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}
