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
  Icon,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
} from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { isEmptyObj, guid } from '@/utils/utils';
import { queryAllData, dynamicQuery, queryDictByCode } from '@/services/quick/Quick';
import { getSchedule, save, modify, getRecommend } from '@/services/sjitms/ScheduleBill';
import EditContainerNumberPageF from './EditContainerNumberPageF';
import DispatchingTable from './DispatchingTable';
import { CreatePageOrderColumns } from './DispatchingColumns';
import disStyle from './Dispatching.less';
import { sumBy, uniq, uniqBy, orderBy } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Search } = Input;
const { confirm } = Modal;

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
    rowKeys: [],
    vehicles: [],
    employees: [],
    empParams: [],
    vehicleParam: [],
    selectVehicle: {},
    selectEmployees: [],
    note: '',
    schedule: {},
    editPageVisible: false,
    currentOrder: {},
    carLoading: false,
    carEmpNums: 20,
    carEmpSearch: {
      // vehicleOwner: '',
      // vehicleCode: '',
      // empOwner: '',
      // empType: '',
      // empInfo: '',
    },
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

    let details = orderBy(record, x => x.archLine);
    let schedule = undefined;
    let selectEmployees = [];
    let selectVehicle = undefined;
    //编辑初始化排车单
    if (isEdit) {
      const response = await getSchedule(record.uuid);
      if (response.success) {
        schedule = response.data;
        details = schedule.details
          ? schedule.details.map(item => {
              return {
                ...item,
                uuid: item.orderUuid,
                billNumber: item.orderNumber,
                stillCartonCount: item.realCartonCount || item.cartonCount,
                stillScatteredCount: item.realScatteredCount || item.scatteredCount,
                stillContainerCount: item.realContainerCount || item.containerCount,
              };
            })
          : [];
      }
    }
    // vehicles = await this.getRecommendByOrders(details, vehicles);
    if (schedule) {
      //将选中车辆放到第一位
      selectVehicle = vehicles.find(x => x.UUID == schedule.vehicle.uuid);
      if (selectVehicle) {
        vehicles.unshift(selectVehicle);
      }
      vehicles = uniqBy(vehicles, 'UUID');
      //选中的人放到第一位
      const memberList = schedule.memberDetails;
      if (memberList) {
        memberList.forEach(item => {
          let emp = employees.find(x => x.UUID == item.member.uuid);
          if (emp) {
            selectEmployees.push({
              ...emp,
              memberType: item.memberType,
              memberUuid: item.uuid,
            });
          }
        });
      }
      employees = uniqBy([...selectEmployees, ...employees], 'CODE');
    }
    this.basicEmployee = employees;
    this.basicVehicle = vehicles;
    this.setState({
      schedule,
      note: schedule ? schedule.note : '',
      selectVehicle: selectVehicle == undefined ? {} : selectVehicle,
      selectEmployees,
      vehicles,
      employees,
      orders: details,
      loading: false,
    });
  };

  //显示
  show = (isEdit, record) => {
    this.setState({ visible: true, isEdit, loading: true, rowKeys: [] }, () => {
      this.initData(isEdit, record);
    });
  };
  //取消隐藏
  hide = () => {
    this.setState({ visible: false });
  };
  //临时保存
  exit = () => {
    this.setState({
      visible: false,
      note: '',
      selectEmployees: [],
      selectVehicle: [],
      carEmpNums: 20,
      carEmpSearch: {},
    });
  };

  //选车
  handleVehicle = async vehicle => {
    this.setState({
      selectVehicle: vehicle,
    });
    let param = {
      tableName: 'v_sj_itms_vehicle_employee_z',
      condition: {
        params: [{ field: 'VEHICLEUUID', rule: 'eq', val: [vehicle.UUID] }],
      },
    };
    const response = await dynamicQuery(param);
    let vehicleEmployees = [];
    if (response.success && response.result.records != 'false') {
      vehicleEmployees = uniqBy(response.result.records, 'CODE').map(item => {
        return {
          ...item,
          memberType: item.ROLE_TYPE,
        };
      });
    }
    this.setState({
      selectEmployees: [...vehicleEmployees],
    });
  };
  //车辆筛选
  vehicleFilter = (key, value) => {
    const { vehicleParam } = this.state;
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
    if (key == 'vehicleOwner') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, vehicleOwner: value } });
    } else {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, vehicleCode: value } });
    }
    this.setState({ vehicles: serachVeh });
  };
  //选人
  handleEmployee = emp => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.UUID == emp.UUID);
    emp.memberType = emp.ROLE_TYPE;
    emp.memberUuid = guid();
    index == -1
      ? employees.push(emp)
      : (employees = employees.filter(x => x.memberUuid != emp.memberUuid));
    // if (employees.filter(item => item.memberType == 'Driver').length >= 2) {
    //   message.error('只允许一位驾驶员！');
    //   return;
    // }
    this.setState({ selectEmployees: employees });
  };
  //人员筛选
  employeeFilter = (key, value) => {
    const { empParams } = this.state;
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
    if (key == 'relation') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empOwner: value } });
    } else if (key == 'employeeType') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empType: value } });
    } else {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empInfo: value } });
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
  removeDetails = async records => {
    let { orders } = this.state;
    const uuids = records.map(x => x.uuid);
    orders = orders.filter(x => uuids.indexOf(x.uuid) == -1);
    let vehicles = await this.getRecommendByOrders(orders, this.state.vehicles);
    this.setState({ orders, vehicles });
  };

  onConfirm = content => {
    Modal.confirm({
      title: '提示',
      content: content,
      okText: '确认',
      cancelText: '取消',
      onOk: () => this.onSave(),
    });
  };
  //保存
  onSave = async () => {
    const { isEdit, orders, schedule, selectVehicle, selectEmployees, note } = this.state;
    const orderType = uniqBy(orders.map(x => x.orderType)).shift();
    const type = orderType == 'TakeDelivery' || orderType == 'AdjustWarehouse' ? 'Task' : 'Job';
    const driver = selectEmployees.find(x => x.memberType == 'Driver');
    const details = orders.map(item => {
      if (!item.isSplit) {
        item.isSplit = item.cartonCount == item.stillCartonCount ? 0 : 1;
      }
      item.cartonCount = item.stillCartonCount;
      item.scatteredCount = item.stillScatteredCount;
      item.containerCount = item.stillContainerCount;
      if (item.reviewed) {
        item.realCartonCount = item.stillCartonCount;
        item.realScatteredCount = item.stillScatteredCount;
        item.realContainerCount = item.stillContainerCount;
      }
      return {
        ...item,
        orderUuid: item.orderUuid || item.uuid,
        orderNumber: item.orderNumber || item.billNumber,
      };
    });
    const orderSummary = this.groupByOrder(details);
    const carrier = driver
      ? {
          uuid: driver.UUID,
          code: driver.CODE,
          name: driver.NAME,
        }
      : {};
    const paramBody = {
      type,
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
      carrier: { ...carrier },
      details,
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
      note: note,
    };
    const response = isEdit
      ? await modify(Object.assign(schedule, paramBody))
      : await save(paramBody);
    if (response.success) {
      message.success('保存成功！');
      this.props.refresh();
      //保存后清空选中的车与人
      this.setState({
        visible: false,
        selectEmployees: [],
        selectVehicle: [],
        loading: false,
        carEmpNums: 20,
        carEmpSearch: {},
      });
    }
  };
  //保存数据校验
  handleSave = async () => {
    const { orders, selectVehicle, selectEmployees } = this.state;
    const orderSummary = this.groupByOrder(orders);
    //校验订单
    if (orderSummary.orderCount == 0) {
      message.error('请选择运输订单！');
      return;
    }
    // const driver = selectEmployees.filter(x => x.memberType == 'Driver');
    // //校验车辆必选
    // if (isEmptyObj(selectVehicle)) {
    //   message.error('请选择车辆！');
    //   return;
    // }
    // if (driver.length > 1) {
    //   message.error('只允许一位驾驶员！');
    //   return;
    // }
    // //校验司机必选
    // if (driver.length == 0) {
    //   message.error('请选择驾驶员！');
    //   return;
    // }
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
      return;
    }
    const exceedWeight = orderSummary.weight - selectVehicle.BEARWEIGHT;
    const exceedVolume =
      orderSummary.volume - selectVehicle.BEARVOLUME * (selectVehicle.BEARVOLUMERATE / 100);
    // const response = await getByDispatchcenterUuid(loginOrg().uuid);
    // if (response.success && response.data) {
    //   //校验载重
    //   if (exceedWeight > 0 && response.data.weight == 1) {
    //     message.error('排车重量超' + (exceedWeight / 1000).toFixed(2) + 't,请检查后重试！');
    //     return;
    //   }
    //   //校验容积
    //   if (exceedVolume > 0 && response.data.volume == 1) {
    //     message.error('排车体积超' + exceedVolume.toFixed(2) + 'm³,请检查后重试！');
    //     return;
    //   }
    // }
    //校验载重
    if (exceedWeight > 0) {
      this.onConfirm('排车重量超' + (exceedWeight / 1000).toFixed(3) + 't,确定继续吗?');
      return;
    }
    //校验容积
    if (exceedVolume > 0) {
      this.onConfirm('排车体积超' + exceedVolume.toFixed(2) + 'm³,确定继续吗?');
      return;
    }
    this.onSave();
  };

  //汇总
  groupByOrder = data => {
    const deliveryPointCount = data ? uniq(data.map(x => x.deliveryPoint.code)).length : 0;
    const pickupPointCount = data ? uniq(data.map(x => x.pickUpPoint.code)).length : 0;
    data = data.filter(x => x.orderType !== 'OnlyBill');
    return {
      orderCount: data ? data.length : 0,
      cartonCount: data ? sumBy(data.map(x => x.stillCartonCount)) : 0,
      scatteredCount: data ? sumBy(data.map(x => x.stillScatteredCount)) : 0,
      containerCount: data ? sumBy(data.map(x => x.stillContainerCount)) : 0,
      realCartonCount: data ? sumBy(data.map(x => x.realCartonCount)) : 0,
      realScatteredCount: data ? sumBy(data.map(x => x.realScatteredCount)) : 0,
      realContainerCount: data ? sumBy(data.map(x => x.realContainerCount)) : 0,
      stillCartonCount: data ? sumBy(data.map(x => x.stillCartonCount)) : 0,
      stillScatteredCount: data ? sumBy(data.map(x => x.stillScatteredCount)) : 0,
      stillContainerCount: data ? sumBy(data.map(x => x.stillContainerCount)) : 0,
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
    let sliceEmployees =
      this.state.carEmpNums == 'all' ? employees : employees.slice(0, this.state.carEmpNums);
    return (
      <Card
        title="员工"
        bodyStyle={{ padding: 0, paddingTop: 8, height: '28vh', overflowY: 'auto' }}
        extra={
          <div>
            {/* <Select
              onChange={e => this.setState({ carEmpNums: e })}
              value={this.state.carEmpNums}
              style={{ width: 55, marginRight: '8px' }}
            >
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={'all'}>全部</Select.Option>
            </Select> */}
            <Select
              placeholder="员工归属"
              onChange={value => this.employeeFilter('relation', value)}
              allowClear={true}
              style={{ width: 100 }}
              value={this.state.carEmpSearch.empOwner}
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
              value={this.state.carEmpSearch.empType}
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
              value={this.state.carEmpSearch.empInfo}
            />
          </div>
        }
      >
        {isEmptyObj(sliceEmployees)
          ? null
          : sliceEmployees.map(employee => {
              return (
                <Tooltip
                  placement="top"
                  title={
                    employee.BILLCOUNTS
                      ? `[${employee.CODE}]` +
                        employee.NAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '') +
                        '在' +
                        employee.BILLNUMBERS +
                        '排车单中有未完成的任务'
                      : ''
                  }
                >
                  <Badge count={employee.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                    <a
                      href="#"
                      className={`${disStyle.panel} ${
                        selectEmployees.find(x => x.UUID == employee.UUID)
                          ? disStyle.panelSelect
                          : ''
                      }`}
                      onClick={() => this.handleEmployee(employee)}
                    >
                      <Row justify="space-between" style={{ height: '100%' }}>
                        <Col span={8} className={disStyle.employeeCardContent}>
                          <Icon type="user" style={{ fontSize: 28 }} />
                        </Col>
                        <Col span={16} className={disStyle.employeeCardContent}>
                          <div className={disStyle.employeeName}>
                            <div>
                              {`[${employee.CODE}]` +
                                employee.NAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                            </div>
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
    let sliceVehicles =
      this.state.carEmpNums == 'all' ? vehicles : vehicles.slice(0, this.state.carEmpNums);
    return (
      <Card
        // loading={this.state.carLoading}
        title="车辆"
        bodyStyle={{ padding: 0, paddingTop: 8, height: '28vh', overflowY: 'auto' }}
        extra={
          <div>
            <Select
              onChange={e => this.setState({ carEmpNums: e })}
              value={this.state.carEmpNums}
              style={{ width: 55, marginRight: '8px' }}
            >
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
              <Select.Option value={'all'}>全部</Select.Option>
            </Select>
            <Select
              placeholder="车辆归属"
              onChange={value => this.vehicleFilter('vehicleOwner', value)}
              allowClear={true}
              style={{ width: 100 }}
              value={this.state.carEmpSearch.vehicleOwner}
            >
              {this.dict.filter(x => x.dictCode == 'vehicleOwner').map(d => (
                <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
              ))}
            </Select>

            <Search
              placeholder="请输入车牌号/编号"
              onChange={event => this.vehicleFilter('searchKey', event.target.value)}
              style={{ width: 150, marginLeft: 5 }}
              value={this.state.carEmpSearch.vehicleCode}
            />
          </div>
        }
      >
        {sliceVehicles?.map(vehicle => {
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
                  className={`${disStyle.panel} ${
                    vehicle.UUID == selectVehicle.UUID ? disStyle.panelSelect : ''
                  }`}
                  onClick={() => this.handleVehicle(vehicle)}
                >
                  <Row justify="space-between" style={{ height: '100%' }}>
                    <Col span={8} className={disStyle.employeeCardContent}>
                      <Icon type="car" style={{ fontSize: 28 }} />
                    </Col>
                    <Col span={16} className={disStyle.employeeCardContent}>
                      <div className={disStyle.employeeName}>
                        <div>{vehicle.PLATENUMBER}</div>
                        {vehicle.DRIVERNAME ? (
                          <div>{vehicle.DRIVERNAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}</div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </Col>
                    {/* {vehicle.pro > 0 ? (
                      <Badge
                        style={{
                          backgroundColor:
                            vehicle.pro >= 40 ? '#52c41a' : vehicle.pro >= 20 ? 'orange' : 'red',
                        }}
                        count={vehicle.pro.toFixed(0) + '%'}
                        title={'熟练度' + vehicle.pro.toFixed(0) + '%'}
                      />
                    ) : (
                      <></>
                    )} */}
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
    this.setState({ editPageVisible: true, currentOrder: record });
  };
  //更新state订单整件排车件数
  updateCartonCount = result => {
    const { orders } = this.state;
    const that = this;
    confirm({
      title: '提示',
      content: `拆单后排车单体积为：${result.volume}m³，重量为：${result.weight}t ，是否确定拆单？`,
      onOk() {
        const index = orders.findIndex(x => x.billNumber == result.billNumber);
        let record = { ...orders[index] };
        record.volume = Number(result.remVolume);
        record.weight = Number(result.remWeight);
        record.unDispatchCarton = record.stillCartonCount - result.cartonCount;
        record.stillCartonCount = result.cartonCount;
        record.isSplit = 1;
        orders.splice(index, 1, record);
        that.setState({ orders, editPageVisible: false });
      },
      onCancel() {
        that.setState({ editPageVisible: false });
      },
    });
  };

  render() {
    const {
      loading,
      orders,
      selectEmployees,
      selectVehicle,
      rowKeys,
      currentOrder,
      editPageVisible,
      note,
    } = this.state;
    const { dispatchConfig } = this.props;
    const totalData = this.groupByOrder(orders);
    //车辆可装载信息
    let vehicleCalc;
    if (selectVehicle) {
      const bearWeight = selectVehicle.BEARWEIGHT || 0;
      const bearVolume = selectVehicle.BEARVOLUME || 0;
      const bearVolumeRate = selectVehicle.BEARVOLUMERATE || 0;
      vehicleCalc = {
        weight: Math.round(bearWeight * 100) / 100, //车辆载重
        remainWeight: Math.round((bearWeight - totalData.weight) * 100) / 100, //剩余载重
        volume: Math.round(bearVolume * 100) / 100, //车辆容积
        usableVolume: Math.round(bearVolume * (bearVolumeRate / 100) * 100) / 100, //车辆容积*容积率=可装容积
        remainVolume:
          Math.round((bearVolume * (bearVolumeRate / 100) - totalData.volume) * 100) / 100, //剩余可装容积
      };
    }

    return (
      <Modal
        visible={this.state.visible}
        onOk={() => this.handleSave()}
        onCancel={() => this.hide()}
        closable={false}
        // destroyOnClose={true}
        {...this.props.modal}
        className={disStyle.dispatchingCreatePage}
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        bodyStyle={{ margin: -24, height: 'calc(100vh - 48px)' }}
        footer={
          <div>
            <Button onClick={this.exit}>取消</Button>
            <Button onClick={this.hide}>临时保存</Button>
            <Button type="primary" onClick={() => this.handleSave()} loading={loading}>
              生成排车单
            </Button>
          </div>
        }
      >
        <EditContainerNumberPageF
          modal={{ title: '拆单' }}
          updateCartonCount={e => this.updateCartonCount(e)}
          visible={editPageVisible}
          order={currentOrder}
          totalData={totalData}
          onCancel={() => this.setState({ editPageVisible: false, currentOrder: {} })}
        />
        <Spin
          indicator={LoadingIcon('default')}
          spinning={loading}
          wrapperClassName={disStyle.createPageLoading}
        >
          <Row gutter={[5, 0]} style={{ height: '100%' }}>
            <Col span={16}>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() => {
                        const records = orders.filter(x => rowKeys.indexOf(x.uuid) != -1);
                        if (records.length != 1) {
                          message.error('请选择一张运输订单！');
                          return;
                        }
                        this.editSource({ ...records[0] });
                      }}
                    >
                      <Icon type="edit" />
                      拆单
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        const records = orders.filter(x => rowKeys.indexOf(x.uuid) != -1);
                        if (records.length == 0) {
                          message.error('请选择需要移除的运输订单！');
                          return;
                        }
                        const that = this;
                        confirm({
                          title: '提示',
                          content: '是否移除选中运输订单？',
                          onOk() {
                            that.removeDetails(records);
                          },
                          onCancel() {
                            that.setState({ rowKeys: [] });
                          },
                        });
                      }}
                    >
                      <Icon type="delete" />
                      移除
                    </Menu.Item>
                  </Menu>
                }
                trigger={['contextMenu']}
              >
                <div>
                  <DispatchingTable
                    loading={loading}
                    clickRow
                    className={disStyle.dispatchingTable}
                    columns={CreatePageOrderColumns}
                    dataSource={orders}
                    refreshDataSource={orders => {
                      this.setState({ orders });
                    }}
                    changeSelectRows={selectedRowKeys =>
                      this.setState({ rowKeys: selectedRowKeys })
                    }
                    selectedRowKeys={rowKeys}
                    pagination={{
                      defaultPageSize: 50,
                      pageSizeOptions: ['50', '100', '500'],
                      showSizeChanger: true,
                      hideOnSinglePage: true,
                    }}
                    scrollY="50vh"
                  />
                </div>
              </Dropdown>
              <Row gutter={[0, 0]}>
                <Col span={12}>{this.buildSelectVehicleCard()}</Col>
                <Col span={12}>{this.buildSelectEmployeeCard()}</Col>
              </Row>
            </Col>
            <Col span={8}>
              {/* 订单汇总 */}
              <Card
                title={<div className={disStyle.selectCary}>订单汇总</div>}
                style={{ height: '22vh', overflow: 'auto' }}
                bodyStyle={{ padding: 0, fontSize: 14 }}
              >
                <div className={disStyle.orderTotalCardBody}>
                  <div style={{ flex: 1 }}>
                    <div>体积</div>
                    <div className={disStyle.orderTotalNumber}>
                      {Math.round(totalData.volume * 100) / 100}
                      m³
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>重量</div>
                    <div className={disStyle.orderTotalNumber}>
                      {Math.round(totalData.weight) / 1000}t
                    </div>
                  </div>
                </div>
                <div className={disStyle.orderTotalCardBody}>
                  <div style={{ flex: 1 }}>
                    <div>送货点数</div>
                    <div className={disStyle.orderTotalNumber}>{totalData.deliveryPointCount}</div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>订单数</div>
                    <div className={disStyle.orderTotalNumber}>{totalData.orderCount}</div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div> 总件数</div>
                    <div>
                      <span className={disStyle.orderTotalNumber}>
                        {Math.round(
                          (Number(totalData.stillCartonCount) +
                            Number(totalData.stillScatteredCount) +
                            Number(totalData.stillContainerCount) * 2) *
                            100
                        ) / 100}
                      </span>
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div> 整件</div>
                    <div>
                      <span className={disStyle.orderTotalNumber}>
                        {Math.round(totalData.stillCartonCount * 100) / 100}
                      </span>
                    </div>
                  </div>
                  <Divider type="vertical" style={{ height: '3.5em' }} />
                  <div style={{ flex: 1 }}>
                    <div>周转箱</div>
                    <div>
                      <span className={disStyle.orderTotalNumber}>
                        {totalData.stillContainerCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              {/* 已选车辆 */}
              <Card
                style={{ height: '25vh', marginTop: 5, overflow: 'auto' }}
                bodyStyle={{ padding: 0, paddingTop: 5, fontSize: 14 }}
                title={
                  <div>
                    <span
                      className={
                        selectVehicle.PLATENUMBER ? disStyle.selectCary : disStyle.selectCarn
                      }
                    >
                      已选车辆
                    </span>
                    <span style={{ marginLeft: 5 }}>{selectVehicle.PLATENUMBER}</span>
                  </div>
                }
              >
                {selectVehicle.PLATENUMBER ? (
                  isEmptyObj(selectVehicle.VEHICLETYPE) ? (
                    <div>请设置车辆车型！</div>
                  ) : (
                    <Row>
                      <Col>
                        <div className={disStyle.orderTotalCardBody}>
                          <div style={{ flex: 1 }}>
                            <div>剩余可装容积</div>
                            <div className={disStyle.orderTotalNumber}>
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
                            <div className={disStyle.orderTotalNumber}>
                              <span
                                style={
                                  vehicleCalc.remainWeight > 0
                                    ? { color: 'green' }
                                    : { color: 'red' }
                                }
                              >
                                {(vehicleCalc.remainWeight / 1000).toFixed(2)}t
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={disStyle.orderTotalCardBody}>
                          <div style={{ flex: 1 }}>
                            <div>车型</div>
                            <div className={disStyle.orderTotalNumber} style={{ fontSize: '18px' }}>
                              {selectVehicle.VEHICLETYPE}
                            </div>
                          </div>
                          <Divider type="vertical" style={{ height: '3.5em' }} />
                          <div style={{ flex: 1 }}>
                            <div>容积</div>
                            <div className={disStyle.orderTotalNumber}>
                              {vehicleCalc.volume}
                              m³
                            </div>
                          </div>
                          <Divider type="vertical" style={{ height: '3.5em' }} />
                          <div style={{ flex: 1 }}>
                            <div>容积率</div>
                            <div>
                              <span className={disStyle.orderTotalNumber}>
                                {selectVehicle.BEARVOLUMERATE || 0}%
                              </span>
                            </div>
                          </div>
                          <Divider type="vertical" style={{ height: '3.5em' }} />
                          <div style={{ flex: 1 }}>
                            <div>载重</div>
                            <div>
                              <span className={disStyle.orderTotalNumber}>
                                {(vehicleCalc.weight / 1000).toFixed(2)}t
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
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
                      selectEmployees.length > 0 ? disStyle.selectCary : disStyle.selectCarn
                    }
                  >
                    已选人员
                  </div>
                }
                style={{ marginTop: 5 }}
                bodyStyle={{ height: '30vh', padding: 10, overflowY: 'auto' }}
              >
                {selectEmployees.map(employee => {
                  return (
                    <Row gutter={[5, 5]} style={{ fontWeight: 'bold', lineHeight: '30px' }}>
                      <Col
                        span={9}
                        style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip
                          placement="topLeft"
                          title={
                            `[${employee.CODE}]` +
                            employee.NAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')
                          }
                        >
                          <span>
                            {`[${employee.CODE}]` +
                              employee.NAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                          </span>
                        </Tooltip>
                      </Col>
                      <Col span={8}>
                        <Select
                          placeholder="请选择员工类型"
                          onChange={val => this.handleEmployeeTypeChange(employee, val)}
                          style={{ width: '100%' }}
                          disabled={
                            dispatchConfig?.isStuckEmpType == 0 && employee.HIRED_TYPE == '承运商'
                          }
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
                        {dispatchConfig?.isStuckEmpType == 0 && employee.HIRED_TYPE == '承运商' ? (
                          <></>
                        ) : (
                          <a
                            href="#"
                            onClick={() => {
                              this.addWorkType(employee);
                            }}
                            style={{ marginLeft: 10 }}
                          >
                            复制
                          </a>
                        )}
                      </Col>
                    </Row>
                  );
                })}
              </Card>
              {/* 备注 */}
              <Row style={{ marginTop: 2 }}>
                <Col span={4} style={{ fontWeight: 'bold', lineHeight: '24px', fontSize: 14 }}>
                  备注：
                </Col>
                <Col span={20}>
                  <Input
                    placeholder="请输入备注"
                    defaultValue={note}
                    onChange={event => this.setState({ note: event.target.value })}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
