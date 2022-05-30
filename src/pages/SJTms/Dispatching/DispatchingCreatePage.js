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
  Badge,
  Tooltip,
} from 'antd';
import { isEmptyObj, guid } from '@/utils/utils';
import { queryAllData, dynamicQuery } from '@/services/quick/Quick';
import { getSchedule, save, modify, getRecommend } from '@/services/sjitms/ScheduleBill';
import EditContainerNumberPageF from './EditContainerNumberPageF';
import { CreatePageOrderColumns, employeeType } from './DispatchingColumns';
import dispatchingStyles from './Dispatching.less';
import { sumBy, uniq, uniqBy } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';

const { Search } = Input;

export default class DispatchingCreatePage extends Component {
  basicEmp = [];
  basicVeh = [];
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
    employeesParam: [],
    vehicleParam: [],
    relationParam: [],
    employeeValue: undefined,
    vehicleValue: undefined,
    relationValue: undefined,
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
    let queryParams = [
      { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'like', val: loginOrg().uuid },
      { field: 'state', type: 'Integer', rule: 'eq', val: 1 },
    ];
    //获取车辆
    // if (vehicles.length == 0 || vehicles[0].DISPATCHCENTERUUID != loginOrg().uuid) {
    //   let param = {
    //     tableName: 'v_sj_itms_vehicle_stat',
    //     condition: {
    //       params: [
    //         { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
    //         { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
    //       ],
    //     },
    //   };
    //   const vehiclesData = await dynamicQuery(param);
    //   if (vehiclesData.result.records != 'false') {
    //     vehicles = vehiclesData.result.records;
    //   }
    // }
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
    if (vehiclesData.result.records != 'false') {
      vehicles = vehiclesData.result.records;
    }

    //获取人员
    // if (employees.length == 0 || employees[0].DISPATCHCENTERUUID != loginOrg().uuid) {
    //   const employeesData = await queryAllData({
    //     quickuuid: 'sj_itms_employee',
    //     superQuery: { queryParams },
    //   });
    //   employees = employeesData.data.records;
    // }
    const employeesData = await queryAllData({
      quickuuid: 'sj_itms_employee',
      superQuery: { queryParams },
    });
    employees = employeesData.data.records;

    if (!isEdit) {
      let map = new Map();
      let uniqRecord = [];
      record.forEach(item => {
        if (!map.has(item.owner.uuid)) {
          // has()用于判断map是否包为item的属性值
          map.set(item.owner.uuid, true); // 使用set()将item设置到map中，并设置其属性值为true
          uniqRecord.push(item);
        }
      });
      let noIn = uniqRecord.filter(item => item.is_private == '0');
      let ownerNames = noIn
        .map(obj => {
          return "'" + obj.owner.name + "'";
        })
        .join(',')
        .split(',');
      if (record.length > 1 && uniqRecord.length > 1) {
        message.error('货主' + ownerNames + '不可共配！');
        this.exit();
      }
      vehicles = await this.getRecommendByOrders(record, vehicles);
    }

    isEdit
      ? getSchedule(record.uuid).then(async response => {
          if (response.success) {
            let details = response.data.details
              ? response.data.details.map(item => {
                  return { ...item, billNumber: item.orderNumber };
                })
              : [];
            vehicles = await this.getRecommendByOrders(details, vehicles);
            const selectVehicle = vehicles.find(x => x.UUID == response.data.vehicle.uuid);
            // //将选中车辆放到第一位
            selectVehicle ? vehicles.unshift(selectVehicle) : {};
            vehicles = uniqBy(vehicles, 'CODE');

            const memberList = response.data.memberDetails.map(x => x.member);
            const selectEmployees = employees
              .filter(
                x => response.data.memberDetails.findIndex(m => m.member.uuid == x.UUID) != -1
              )
              .map(item => {
                item.memberType = item.ROLE_TYPE;
                item.memberUuid = guid();
                return item;
              });
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
    this.basicEmp = employees;
    this.basicVeh = vehicles;
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
  vehicleFilter = () => {
    const { vehicles, vehicleParam } = this.state;
    const { changeVehicle, changeVehicleType } = vehicleParam;
    let serachVeh = [];
    if (typeof changeVehicle != 'undefined' && changeVehicle != '') {
      this.basicVeh.forEach(item => {
        if (item.PLATENUMBER.search(changeVehicle) != -1 || item.CODE.search(changeVehicle) != -1) {
          serachVeh.push(item);
        }
      });
    }
    if (typeof changeVehicleType != 'undefined' && changeVehicleType != '') {
      if (serachVeh != '') {
        let searchVehicleType = [];
        serachVeh.forEach(item => {
          if (item.OWNER != null && item.OWNER.search(changeVehicleType) != -1) {
            searchVehicleType.push(item);
          }
        });
        serachVeh = searchVehicleType;
      } else {
        this.basicVeh.forEach(item => {
          if (item.OWNER != null && item.OWNER.search(changeVehicleType) != -1) {
            serachVeh.push(item);
          }
        });
      }
    }
    this.setState({ vehicles: serachVeh });
  };

  changeVehicle = event => {
    const { vehicleParam } = this.state;
    vehicleParam.changeVehicle = event.target.value;
    this.setState({
      vehicleParam,
    });
    this.vehicleFilter();
  };

  changeVehicleType = value => {
    const { vehicleParam } = this.state;
    vehicleParam.changeVehicleType = typeof value == 'undefined' ? '' : value.record.VALUE;
    this.setState({
      vehicleParam,
      vehicleValue: value.record.VALUE,
    });
    this.vehicleFilter();
  };

  //选人
  handleEmployee = employee => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.memberUuid == employee.memberUuid);
    employee.memberType = employee.ROLE_TYPE;
    employee.memberUuid = guid();
    index == -1 ? employees.push(employee) : employees.splice(index, 1);
    if (employees.filter(item => item.memberType == 'Driver').length >= 2) {
      message.error('只允许一位驾驶员！');
      return;
    }
    this.setState({ selectEmployees: employees });
  };

  employeeFilter = () => {
    const { employees, employeesParam } = this.state;
    const { changeParam, changeWorkType, changeRelationType } = employeesParam;
    let serachEmp = [];
    if (typeof changeParam != 'undefined' && changeParam != '') {
      this.basicEmp.forEach(item => {
        if (item.CODE.search(changeParam) != -1 || item.NAME.search(changeParam) != -1) {
          serachEmp.push(item);
        }
      });
    }
    if (typeof changeWorkType != 'undefined' && changeWorkType != '') {
      if (serachEmp != '') {
        let searchWorkType = [];
        serachEmp.forEach(item => {
          if (item.ROLE_TYPE != undefined && item.ROLE_TYPE.search(changeWorkType) != -1) {
            searchWorkType.push(item);
          }
        });
        serachEmp = searchWorkType;
      } else {
        this.basicEmp.forEach(item => {
          if (item.ROLE_TYPE != undefined && item.ROLE_TYPE.search(changeWorkType) != -1) {
            serachEmp.push(item);
          }
        });
      }
    }

    if (typeof changeRelationType != 'undefined' && changeRelationType != '') {
      console.log('this.basicEmp', this.basicEmp);
      if (serachEmp != '') {
        let searchWorkType = [];
        serachEmp.forEach(item => {
          if (item.HIRED_TYPE != undefined && item.HIRED_TYPE.search(changeRelationType) != -1) {
            searchWorkType.push(item);
          }
        });
        serachEmp = searchWorkType;
      } else {
        this.basicEmp.forEach(item => {
          if (item.HIRED_TYPE != undefined && item.HIRED_TYPE.search(changeRelationType) != -1) {
            serachEmp.push(item);
          }
        });
      }
    }

    this.setState({ employees: serachEmp });
  };

  changeEmployee = event => {
    const { employeesParam } = this.state;
    employeesParam.changeParam = event.target.value;
    this.setState({
      employeesParam,
    });
    this.employeeFilter();
  };

  changeWorkType = value => {
    const { employeesParam } = this.state;
    employeesParam.changeWorkType = typeof value == 'undefined' ? '' : value.record.VALUE;
    this.setState({
      employeesParam,
      employeeValue: value.record.VALUE,
    });
    this.employeeFilter();
  };

  changeRelationType = value => {
    const { employeesParam } = this.state;
    employeesParam.changeRelationType = typeof value == 'undefined' ? '' : value.record.VALUE;
    this.setState({
      employeesParam,
      relationValue: value.record.VALUE,
    });
    this.employeeFilter();
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
    const driver = selectEmployees.find(x => x.memberType == 'Driver');
    const orderCounts = this.groupByOrder(orders);
    if (!this.verifySchedule(orderCounts, selectVehicle, driver, selectEmployees)) {
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
      this.setState({ visible: false, selectEmployees: [], selectVehicle: [], loading: false });
    }
  };

  //保存数据校验
  verifySchedule = (orderCounts, selectVehicle, driver, selectEmployees) => {
    //校验车辆必选
    if (isEmptyObj(selectVehicle)) {
      message.error('请选择车辆！');
      return false;
    }
    //校验司机必选
    if (driver == undefined) {
      message.error('请选择司机！');
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
    const exceedWeight = orderCounts.weight - selectVehicle.BEARWEIGHT;
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
    const { employees, selectEmployees, employeeValue, relationValue } = this.state;
    return (
      <Card
        title="员工"
        style={{ height: '36vh', fontWeight: 'bold' }}
        bodyStyle={{ padding: '15px 0 0 0', height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            <SimpleAutoComplete
              placeholder="请选择归属类型"
              dictCode="relation"
              onChange={this.changeRelationType.bind()}
              allowClear={true}
              value={relationValue}
              style={{ width: 120 }}
            />

            <SimpleAutoComplete
              placeholder="请选择工种"
              dictCode="employeeType"
              onChange={this.changeWorkType.bind()}
              allowClear={true}
              value={employeeValue}
              style={{ width: 120, marginLeft: 10 }}
            />

            <Search
              placeholder="请输入工号或姓名"
              onChange={this.changeEmployee.bind()}
              style={{ width: 150, marginLeft: 10 }}
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
    const { vehicles, selectVehicle, vehicleValue } = this.state;
    return (
      <Card
        title="车辆"
        style={{ height: '36vh' }}
        bodyStyle={{ padding: '15px 0 0 0', height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            <SimpleAutoComplete
              placeholder="请选择车辆归属"
              dictCode="vehicleOwner"
              onChange={this.changeVehicleType.bind()}
              value={vehicleValue}
              allowClear={true}
              style={{ width: 120 }}
            />

            <Search
              placeholder="请输入车辆编号或车牌号"
              onChange={this.changeVehicle.bind()}
              style={{ width: 150, marginLeft: 10 }}
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
  updateCount = event => {
    const { orders } = this.state;
    if (event.count.cartonCount > 0) {
      for (const order of orders) {
        if (order.billNumber == event.billNumber) {
          order.volume =
            ((order.realCartonCount - event.count.cartonCount) / order.realCartonCount) *
            order.volume;
          order.weight =
            ((order.realCartonCount - event.count.cartonCount) / order.realCartonCount) *
            order.weight;
          order.realCartonCount -= event.count.cartonCount;
          order.isSplit = 'Y';
          break;
        }
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
        weight:
          selectVehicle.BEARWEIGHT % 1 == 0
            ? selectVehicle.BEARWEIGHT
            : Math.ceil(selectVehicle.BEARWEIGHT) - 1, //重量
        volume:
          (selectVehicle.BEARVOLUME * (selectVehicle.BEARVOLUMERATE * 0.01)) % 1 == 0
            ? selectVehicle.BEARVOLUME * (selectVehicle.BEARVOLUMERATE * 0.01)
            : Math.ceil((selectVehicle.BEARVOLUME - 1) * (selectVehicle.BEARVOLUMERATE * 0.01)), //容积*容积率
        initVolume:
          selectVehicle.BEARVOLUME % 1 == 0
            ? selectVehicle.BEARVOLUME
            : Math.ceil(selectVehicle.BEARVOLUME - 1), //原始体积
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
          modal={{ title: '编辑' }}
          updateCount={e => this.updateCount(e)}
          visible={editPageVisible}
          scheduleDetail={scheduleDetail}
          onCancel={() => this.setState({ editPageVisible: false })}
        />
        <Spin spinning={loading}>
          <Row gutter={[8, 0]}>
            <Col span={16}>
              <Card title="订单" bodyStyle={{ padding: 1, height: '42.5vh' }}>
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
                      {Math.ceil(totalData.volume.toFixed(4))}
                      m³
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>重量</div>
                    <div className={dispatchingStyles.orderTotalNumber}>
                      {Math.ceil(totalData.weight.toFixed(4))}
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
                  <Row>
                    <Col>
                      <div className={dispatchingStyles.orderTotalCardBody}>
                        <div style={{ flex: 1 }}>
                          <div>剩余可装容积</div>
                          <div className={dispatchingStyles.orderTotalNumber}>
                            <span
                              style={
                                vehicleCalc.volume - Math.ceil(totalData.volume.toFixed(4)) > 0
                                  ? { color: 'green' }
                                  : { color: 'red' }
                              }
                            >
                              {vehicleCalc.volume - Math.ceil(totalData.volume.toFixed(4))}
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
                                vehicleCalc.weight - Math.ceil(totalData.weight.toFixed(4)) > 0
                                  ? { color: 'green' }
                                  : { color: 'red' }
                              }
                            >
                              {vehicleCalc.weight - Math.ceil(totalData.weight.toFixed(4))}
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
                            {vehicleCalc.initVolume}
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
                  console.log('employee', employee);
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
                          {employeeType.map(d => (
                            <Select.Option key={d.name}>{d.caption}</Select.Option>
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
