import React, { Component } from 'react';
import {
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
  Badge,
  Tooltip,
} from 'antd';
import { isEmptyObj, guid } from '@/utils/utils';
import { queryAllData, dynamicQuery, queryDictByCode } from '@/services/quick/Quick';
import { getSchedule, save, modify, getRecommend } from '@/services/sjitms/ScheduleBill';
import EditContainerNumberPageF from './EditContainerNumberPageF';
import DispatchingTable from './DispatchingTable';
import { CreatePageOrderColumns } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import { sumBy, uniq, uniqBy } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Search } = Input;

export default class DispatchingCreatePage extends Component {
  basicEmployee = [];
  basicVehicle = [];
  dict = [];
  state = {
    loading: false,
    saving: false,
    visible: false,
    isEdit: false,
    orders: [],
    vehicles: [],
    employees: [],
    empParams: [],
    vehicleParam: [],
    selectVehicle: {},
    selectEmployees: [],
    schedule: {},
    editPageVisible: false,
    scheduleDetail: {},
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  getRecommendByOrders = async (record, vehicles) => {
    if (vehicles.length == 0) {
      return;
    }
    //组装推荐人员车辆接口入参;
    let params = {
      storeCodes: record.map(item => {
        return item.deliveryPoint.code;
      }),
      companyUuid: loginCompany().uuid,
      dUuid: loginOrg().uuid,
      state: 1,
    };
    //车辆熟练度
    let recommend = await getRecommend(params);
    let cCountsMap = recommend.data?.cCountsMap ? recommend.data.cCountsMap : {};
    let cCountTotal = recommend.data?.cCountTotal;
    for (const vehicle of vehicles) {
      if (vehicle.CODE in cCountsMap) {
        vehicle.pro = (cCountsMap[vehicle.CODE] / cCountTotal) * 100;
      } else {
        vehicle.pro = 0;
      }
    }
    //排序
    vehicles = vehicles.sort((a, b) => b.pro - a.pro);
    return vehicles;
  };

  //初始化数据
  initData = async (isEdit, record) => {
    let { vehicles, employees } = this.state;
    // 查询字典
    queryDictByCode(['vehicleOwner', 'employeeType', 'relation']).then(
      res => (this.dict = res.data)
    );

    //获取车辆
    let param = {
      tableName: 'v_sj_itms_vehicle_stat',
      condition: {
        params: [
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
          { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
          { field: 'state', rule: 'eq', val: [1] },
        ],
      },
    };
    const vehiclesData = await dynamicQuery(param);
    if (vehiclesData.success && vehiclesData.result.records != 'false') {
      vehicles = vehiclesData.result.records;
    }
    //获取人员
    let queryParams = [
      { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'like', val: loginOrg().uuid },
      { field: 'state', type: 'Integer', rule: 'eq', val: 1 },
    ];
    const employeesData = await queryAllData({
      quickuuid: 'sj_itms_employee',
      superQuery: { queryParams },
    });
    employees = employeesData.data.records;

    if (isEdit) {
      //编辑初始化排车单
      getSchedule(record.uuid).then(async response => {
        if (response.success) {
          let details = response.data.details
            ? response.data.details.map(item => {
                return { ...item, billNumber: item.orderNumber };
              })
            : [];
          vehicles = await this.getRecommendByOrders(details, vehicles);
          const selectVehicle = vehicles.find(x => x.UUID == response.data.vehicle.uuid);
          //将选中车辆放到第一位
          selectVehicle ? vehicles.unshift(selectVehicle) : {};
          vehicles = uniqBy(vehicles, 'UUID');
          //选中的人放到第一位
          const memberList = response.data.memberDetails;
          let selectEmployees = [];
          memberList.forEach(item => {
            let emp = employees.find(x => x.UUID == item.member.uuid);
            if (emp) {
              selectEmployees.push({ ...emp, memberType: item.memberType, memberUuid: item.uuid });
            }
          });
          employees = uniqBy([...selectEmployees, ...employees], 'CODE');

          this.basicEmployee = employees;
          this.basicVehicle = vehicles;
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
      });
    } else {
      vehicles = await this.getRecommendByOrders(record, vehicles);
      this.basicEmployee = employees;
      this.basicVehicle = vehicles;
      this.setState({ vehicles, employees, orders: record, loading: false });
    }
  };

  //显示
  show = (isEdit, record) => {
    this.setState({ visible: true, isEdit, loading: true });
    this.initData(isEdit, record);
  };
  //取消隐藏
  hide = () => {
    this.setState({ visible: false });
  };
  //临时保存
  exit = () => {
    this.setState({ visible: false, selectEmployees: [], selectVehicle: [] });
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
  //车辆筛选
  vehicleFilter = (key, value) => {
    const { vehicles, vehicleParam } = this.state;
    let serachVeh = [...this.basicVehicle];
    vehicleParam[key] = value;
    if (vehicleParam.searchKey) {
      serachVeh = serachVeh.filter(
        item =>
          item.CODE.search(vehicleParam.searchKey) != -1 ||
          item.PLATENUMBER.search(vehicleParam.searchKey) != -1
      );
    }
    if (vehicleParam.vehicleOwner) {
      serachVeh = serachVeh.filter(x => x.OWNER == vehicleParam.vehicleOwner);
    }
    this.setState({ vehicles: serachVeh });
  };
  //选人
  handleEmployee = employee => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.UUID == employee.UUID);
    employee.memberType = employee.ROLE_TYPE;
    employee.memberUuid = guid();
    index == -1
      ? employees.push(employee)
      : (employees = employees.filter(x => x.UUID != employee.UUID));
    if (employees.filter(item => item.memberType == 'Driver').length >= 2) {
      message.error('只允许一位驾驶员！');
      return;
    }
    this.setState({ selectEmployees: employees });
  };
  //人员筛选
  employeeFilter = (key, value) => {
    const { employees, empParams } = this.state;
    let searchEmp = [...this.basicEmployee];
    empParams[key] = value;
    if (empParams.searchKey) {
      searchEmp = searchEmp.filter(
        item =>
          item.CODE.search(empParams.searchKey) != -1 || item.NAME.search(empParams.searchKey) != -1
      );
    }
    if (empParams.employeeType) {
      searchEmp = searchEmp.filter(x => x.ROLE_TYPE == empParams.employeeType);
    }
    if (empParams.relation) {
      searchEmp = searchEmp.filter(x => x.HIRED_TYPE == empParams.relation);
    }
    this.setState({ employees: searchEmp, empParams });
  };

  //员工类型选择事件
  handleEmployeeTypeChange = (employee, val) => {
    const { selectEmployees } = this.state;
    employee.memberType = val;
    selectEmployees.splice(
      selectEmployees.findIndex(x => x.memberUuid == employee.memberUuid),
      1,
      employee
    );
    this.setState({ selectEmployees });
  };

  //添加工种
  addWorkType = emp => {
    const { selectEmployees } = this.state;
    let employee = { ...emp };
    employee.memberUuid = guid();
    employee.memberType = '';
    selectEmployees.push(employee);
    this.setState({ selectEmployees });
  };

  //移除明细
  removeDetail = async record => {
    const { orders } = this.state;
    orders.splice(orders.findIndex(x => x.uuid == record.uuid), 1);
    let vehicles = await this.getRecommendByOrders(orders, this.state.vehicles);
    this.setState({ orders, vehicles });
  };

  //保存
  handleSave = async () => {
    const { isEdit, orders, schedule, selectVehicle, selectEmployees } = this.state;
    const orderSummary = this.groupByOrder(orders);
    if (!this.verifySchedule(orderSummary, selectVehicle, selectEmployees)) {
      return;
    }
    const driver = selectEmployees.find(x => x.memberType == 'Driver');
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
      ...orderSummary,
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
      this.setState({ visible: false, selectEmployees: [], selectVehicle: [], loading: false });
    }
  };

  //保存数据校验
  verifySchedule = (orderSummary, selectVehicle, selectEmployees) => {
    //校验订单
    if (orderSummary.orderCount == 0) {
      message.error('请选择运输订单！');
      return false;
    }
    const driver = selectEmployees.filter(x => x.memberType == 'Driver');
    //校验车辆必选
    if (isEmptyObj(selectVehicle)) {
      message.error('请选择车辆！');
      return false;
    }
    if (driver.length > 1) {
      message.error('只允许一位驾驶员！');
      return false;
    }
    //校验司机必选
    if (driver.length == 0) {
      message.error('请选择驾驶员！');
      return false;
    }
    //校验容积
    // const exceedVolume = orderCounts.volume - selectVehicle.BEARVOLUME;
    // if (exceedVolume > 0) {
    //   message.error(
    //     '排车体积超过车辆可装载的最大体积，超出' + exceedVolume.toFixed(2) + 'm³，请检查后重试！'
    //   );
    //   return false;
    // }
    //校验载重
    const exceedWeight =
      orderSummary.weight - (selectVehicle.BEARWEIGHT ? selectVehicle.BEARWEIGHT : 0);
    if (exceedWeight > 0) {
      message.error(
        '排车重量超过车辆可运输的最大限重，超出' + exceedWeight.toFixed(2) + 'kg，请检查后重试！'
      );
      return false;
    }

    let selectEmpLength = [];
    selectEmployees.forEach(item => {
      let length = selectEmployees.filter(
        x => x.UUID == item.UUID && x.memberType == item.memberType
      ).length;
      selectEmpLength.push({ length: length });
    });
    let checkRepeat = selectEmpLength.find(x => x.length > 1);
    if (checkRepeat != undefined) {
      message.error('排车随车人员存在相同人员重复职位，请检查后重试！');
      return false;
    }

    return true;
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
        style={{ height: '36vh', fontWeight: 'bold' }}
        bodyStyle={{ padding: '15px 0 0 0', height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            <Select
              placeholder="员工归属"
              onChange={value => this.employeeFilter('relation', value)}
              allowClear={true}
              style={{ width: 100 }}
            >
              {this.dict.filter(x => x.dictCode == 'relation').map(d => (
                <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="工种"
              onChange={value => this.employeeFilter('employeeType', value)}
              allowClear={true}
              style={{ width: 100, marginLeft: 5 }}
            >
              {this.dict.filter(x => x.dictCode == 'employeeType').map(d => (
                <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
              ))}
            </Select>

            <Search
              placeholder="请输入工号/姓名"
              allowClear
              onChange={event => this.employeeFilter('searchKey', event.target.value)}
              style={{ width: 150, marginLeft: 5 }}
            />
          </div>
        }
      >
        {isEmptyObj(employees)
          ? null
          : employees.map(employee => {
              return (
                <Tooltip
                  placement="top"
                  title={
                    employee.BILLCOUNTS
                      ? `[${employee.CODE}]` +
                        employee.NAME +
                        '在' +
                        employee.BILLNUMBERS +
                        '排车单中有未完成的任务'
                      : ''
                  }
                >
                  <Badge count={employee.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                    <a
                      href="#"
                      className={
                        selectEmployees.find(x => x.UUID == employee.UUID)
                          ? dispatchingStyles.selectedCehicleCardWapper
                          : dispatchingStyles.vehicleCardWapper
                      }
                      onClick={() => this.handleEmployee(employee)}
                    >
                      <Row justify="space-between" style={{ height: '100%' }}>
                        <Col span={10} className={dispatchingStyles.employeeCardContent}>
                          <Icon type="user" style={{ fontSize: '40px' }} />
                        </Col>
                        <Col span={14} className={dispatchingStyles.employeeCardContent}>
                          <div
                            style={{
                              width: '100%',
                              lineHeight: '24px',
                              textAlign: 'end',
                              marginRight: 15,
                            }}
                          >
                            <div>{employee.CODE}</div>
                            <div>{employee.NAME}</div>
                            <div>{employee.ROLE_TYPE2}</div>
                          </div>
                        </Col>
                      </Row>
                    </a>
                  </Badge>
                </Tooltip>
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
        style={{ height: '36vh' }}
        bodyStyle={{ padding: '15px 0 0 0', height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            <Select
              placeholder="车辆归属"
              onChange={value => this.vehicleFilter('vehicleOwner', value)}
              allowClear={true}
              style={{ width: 100 }}
            >
              {this.dict.filter(x => x.dictCode == 'vehicleOwner').map(d => (
                <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
              ))}
            </Select>

            <Search
              placeholder="请输入车牌号/编号"
              onChange={event => this.vehicleFilter('searchKey', event.target.value)}
              style={{ width: 150, marginLeft: 5 }}
            />
          </div>
        }
      >
        {vehicles?.map(vehicle => {
          return (
            <Tooltip
              placement="top"
              title={
                vehicle.BILLNUMBERS
                  ? vehicle.PLATENUMBER + '在' + vehicle.BILLNUMBERS + '排车单中有未完成的任务'
                  : ''
              }
            >
              <Badge count={vehicle.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                <a
                  href="#"
                  className={
                    vehicle.UUID == selectVehicle.UUID
                      ? dispatchingStyles.selectedCehicleCardWapper
                      : dispatchingStyles.vehicleCardWapper
                  }
                  onClick={() => this.handleVehicle(vehicle)}
                >
                  <Row>
                    <Col
                      span={vehicle.pro > 0 ? 18 : 24}
                      className={dispatchingStyles.vehicleCardContent}
                    >
                      <Icon type="car" style={{ fontSize: '40px' }} />
                      <span style={{ marginLeft: 5 }}> {vehicle.PLATENUMBER}</span>
                    </Col>
                    {vehicle.pro > 0 ? (
                      <Col span={6} style={{ marginTop: 10 }}>
                        <Badge
                          style={{
                            backgroundColor:
                              vehicle.pro >= 40 ? '#52c41a' : vehicle.pro >= 20 ? 'orange' : 'red',
                          }}
                          count={vehicle.pro.toFixed(0) + '%'}
                          title={'熟练度' + vehicle.pro.toFixed(0) + '%'}
                        />
                      </Col>
                    ) : (
                      <></>
                    )}
                  </Row>
                </a>
              </Badge>
            </Tooltip>
          );
        })}
      </Card>
    );
  };

  //拆单
  editSource = record => {
    this.setState({ editPageVisible: true, scheduleDetail: record });
  };
  //更新state订单整件排车件数
  updateCartonCount = event => {
    const { orders } = this.state;
    if (event.count.cartonCount <= 0) {
      return;
    }
    for (const order of orders) {
      if (order.billNumber == event.billNumber) {
        order.volume =
          Math.round((event.count.cartonCount / order.realCartonCount) * order.volume * 1000) /
          1000;
        order.weight =
          Math.round((event.count.cartonCount / order.realCartonCount) * order.weight * 1000) /
          1000;
        order.realCartonCount = event.count.cartonCount;
        order.isSplit = 'Y';
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
    //车辆可装载信息
    let vehicleCalc;
    if (selectVehicle) {
      vehicleCalc = {
        weight: Math.round(selectVehicle.BEARWEIGHT * 100) / 100, //车辆载重
        remainWeight: Math.round((selectVehicle.BEARWEIGHT - totalData.weight) * 100) / 100, //剩余载重
        volume: Math.round(selectVehicle.BEARVOLUME * 100) / 100, //车辆容积
        usableVolume:
          Math.round(selectVehicle.BEARVOLUME * (selectVehicle.BEARVOLUMERATE / 100) * 100) / 100, //车辆容积*容积率=可装容积
        remainVolume:
          Math.round(
            (selectVehicle.BEARVOLUME * (selectVehicle.BEARVOLUMERATE / 100) - totalData.volume) *
              100
          ) / 100, //剩余可装容积
      };
    }

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
        closable={false}
        destroyOnClose
        centered
        {...this.props.modal}
        className={dispatchingStyles.dispatchingCreatePage}
        bodyStyle={{ margin: -24 }}
        footer={[
          <div>
            <Button onClick={this.exit}>取消</Button>
            <Button onClick={this.hide}>临时保存</Button>
            <Button type="primary" onClick={e => this.handleSave(e)} loading={loading}>
              生成排车单
            </Button>
          </div>,
        ]}
      >
        <EditContainerNumberPageF
          modal={{ title: '拆单' }}
          updateCartonCount={e => this.updateCartonCount(e)}
          visible={editPageVisible}
          order={scheduleDetail}
          onCancel={() => this.setState({ editPageVisible: false })}
        />
        <Spin spinning={loading}>
          <Row gutter={[8, 0]}>
            <Col span={16}>
              <Card bodyStyle={{ padding: 1, height: '42.5vh' }}>
                <DispatchingTable
                  className={dispatchingStyles.dispatchingTable}
                  columns={[...CreatePageOrderColumns, buildRowOperation]}
                  dataSource={orders}
                  refreshDataSource={orders => {
                    this.setState({ orders });
                  }}
                  pagination={false}
                  scrollY="37vh"
                />
              </Card>
              <Row gutter={[8, 0]} style={{ marginTop: 8 }}>
                <Col span={12}>{this.buildSelectVehicleCard()}</Col>
                <Col span={12}>{this.buildSelectEmployeeCard()}</Col>
              </Row>
            </Col>
            <Col span={8}>
              {/* 订单汇总 */}
              <Card
                title={<div className={dispatchingStyles.selectCary}>订单汇总</div>}
                className={dispatchingStyles.orderTotalCard}
                bodyStyle={{ padding: 5 }}
              >
                <div className={dispatchingStyles.orderTotalCardBody}>
                  <div style={{ flex: 1 }}>
                    <div>体积</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {Math.round(totalData.volume * 1000) / 1000}
                      m³
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>重量</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {Math.round(totalData.weight * 1000) / 1000}
                      kg
                    </div>
                  </div>
                </div>
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
                    <div> 整件</div>
                    <div>
                      <span className={dispatchingStyles.orderTotalNumber}>
                        {totalData.realCartonCount}
                      </span>
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>周转箱</div>
                    <div>
                      <span className={dispatchingStyles.orderTotalNumber}>
                        {totalData.realContainerCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              {/* 已选车辆 */}
              <Card
                className={dispatchingStyles.orderTotalCard}
                bodyStyle={{ padding: 5 }}
                title={
                  <div>
                    <span
                      className={
                        selectVehicle.PLATENUMBER
                          ? dispatchingStyles.selectCary
                          : dispatchingStyles.selectCarn
                      }
                    >
                      已选车辆
                    </span>
                    <span style={{ marginLeft: 5 }}>{selectVehicle.PLATENUMBER}</span>
                  </div>
                }
                style={{ height: '24.2vh', marginTop: 8, overflow: 'auto' }}
              >
                {selectVehicle.PLATENUMBER ? (
                  selectVehicle.VEHICLETYPE != '[]' ? (
                    <Row>
                      <Col>
                        <div className={dispatchingStyles.orderTotalCardBody}>
                          <div style={{ flex: 1 }}>
                            <div>剩余可装容积</div>
                            <div className={dispatchingStyles.orderTotalNumber}>
                              <span
                                style={
                                  vehicleCalc.remainVolume > 0
                                    ? { color: 'green' }
                                    : { color: 'red' }
                                }
                              >
                                {vehicleCalc.remainVolume}
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
                                  vehicleCalc.remainWeight > 0
                                    ? { color: 'green' }
                                    : { color: 'red' }
                                }
                              >
                                {vehicleCalc.remainWeight}
                                kg
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={dispatchingStyles.orderTotalCardBody2}>
                          <div style={{ flex: 1 }}>
                            <div>车型</div>
                            <div
                              className={dispatchingStyles.orderTotalNumber}
                              style={{ fontSize: '18px' }}
                            >
                              {selectVehicle.VEHICLETYPE}
                            </div>
                          </div>
                          <Divider type="vertical" style={{ height: '3.5em' }} />
                          <div style={{ flex: 1 }}>
                            <div>容积</div>
                            <div className={dispatchingStyles.orderTotalNumber}>
                              {vehicleCalc.volume}
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
                                {vehicleCalc.weight}
                                kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <div>请设置车辆车型！</div>
                  )
                ) : (
                  <></>
                )}
              </Card>
              {/* 已选人员 */}
              <Card
                title={
                  <div
                    className={
                      selectEmployees.length > 0
                        ? dispatchingStyles.selectCary
                        : dispatchingStyles.selectCarn
                    }
                  >
                    已选人员
                  </div>
                }
                style={{ height: '36vh', marginTop: 8 }}
                bodyStyle={{ height: '29vh', overflowY: 'scroll' }}
              >
                {selectEmployees.map(employee => {
                  return (
                    <Row gutter={[8, 8]} style={{ fontWeight: 'bold', lineHeight: '30px' }}>
                      <Col
                        span={8}
                        style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip placement="topLeft" title={`[${employee.CODE}]` + employee.NAME}>
                          <span>{`[${employee.CODE}]` + employee.NAME}</span>
                        </Tooltip>
                      </Col>
                      <Col span={8}>
                        <Select
                          placeholder="请选择员工类型"
                          onChange={val => this.handleEmployeeTypeChange(employee, val)}
                          style={{ width: '100%' }}
                          value={employee.memberType}
                        >
                          {this.dict.filter(x => x.dictCode == 'employeeType').map(d => (
                            <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={6} offset={1}>
                        <a
                          href="#"
                          onClick={() => {
                            this.handleEmployee(employee);
                          }}
                        >
                          移除
                        </a>
                        <a
                          href="#"
                          onClick={() => {
                            this.addWorkType(employee);
                          }}
                          style={{ marginLeft: 10 }}
                        >
                          添加
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
