import React,{ Component } from 'react'
import { Badge, Card, Col, Empty, Icon, Input, message, Progress, Row, Select, Spin, Tooltip } from 'antd';
import { orderBy, uniq, uniqBy } from 'lodash';
import { guid, isEmptyObj } from '@/utils/utils'
import { dynamicQuery, queryAllData, queryDictByCode } from '@/services/quick/Quick';
import { loginCompany, loginOrg } from '@/utils/LoginContext'
import { getRecommend } from '@/services/sjitms/ScheduleBill';
import { getConfigDataByParams } from '@/services/sjconfigcenter/ConfigCenter';
import style from '@/pages/SJTms/SmartScheduling/SmartScheduling.less'

const { Search } = Input;

/**
 * 人和车的选择
 * @param props.onRef{Object}  对象this给父组件
 * @param props.weight{number} 订单重量
 * @param props.volume{number} 订单体积
 * @author ChenGuangLong
 * @since 2024/11/18 下午4:13
*/
export default class EmpAndVehicleModal extends Component{
  basicEmployee = [];
  basicVehicle = [];
  dict = [];
  empTypeMapper = {};
  VehicleCardConfig = [
    {
      key: 'init',
      tab: '默认匹配',
    },
    {
      key: 'recommend',
      tab: '熟练度匹配',
    },
    {
      key: 'area',
      tab: '区域匹配',
    },
  ];

  state = {
    loading: false,
    orders: [],
    vehicles: [],
    employees: [],
    empParams: [],
    vehicleParam: [],
    selectVehicle: {},
    selectEmployees: [],
    carEmpNums: 20,
    carEmpSearch: {},
    carSort: [1, 2, 3],
    carKey: 'init',
    carSearchSort: [1, 2, 3],
    carrieruuids: [],
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
    this.initConfig();
  };

  /** 获取配置 */
  initConfig = async () => {
    let res = await getConfigDataByParams('dispatch', loginOrg().uuid);
    if (res.success && res.data?.length > 0) {
      let carSort = res.data[0].carSort.split(',');
      let carSearchSort = res.data[0].carSearchSort.split(',');
      this.setState({
        carSort,
        carKey: this.VehicleCardConfig[parseInt(carSort[0], 10) - 1].key,
        carSearchSort: carSearchSort || [1, 2, 3],
      });
    }
  };

  /** 显示 */
  show = (record) => {
    const { carSort } = this.state;
    this.setState(
      {
        loading: true,
        carKey: this.VehicleCardConfig[parseInt(carSort[0],10) - 1]?.key
          ? this.VehicleCardConfig[parseInt(carSort[0], 10) - 1]?.key
          : 'init',
      },
      () => {
        this.initData(record);
      }
    );
  };

  /** 初始化数据 */
  initData = async (record) => {
    let { vehicles, employees, carrieruuids } = this.state;
    // 查询字典
    queryDictByCode(['vehicleOwner', 'employeeType', 'relation']).then(res => {
      this.dict = res.data
      this.empTypeMapper = this.dict.filter(x => x.dictCode === 'employeeType').reduce((acc, cur) => {
        acc[cur.itemValue] = cur.itemText;
        return acc;
      }, {});
    });

    // 获取车辆
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
    if (vehiclesData.success && vehiclesData.result.records !== 'false') {
      vehicles = vehiclesData.result.records;
      // 承运商集合
      carrieruuids = uniq(vehicles.filter(e => e.CARRIERUUID).map(e => e.CARRIERUUID));
    }
    // 获取人员
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
    let selectEmployees = [];
    let selectVehicle;

    // if (schedule) {
    //   // 将选中车辆放到第一位
    //   selectVehicle = vehicles.find(x => x.UUID === schedule.vehicle.uuid);
    //   if (selectVehicle) {
    //     vehicles.unshift(selectVehicle);
    //   }
    //   vehicles = uniqBy(vehicles, 'UUID');
    //   // 选中的人放到第一位
    //   const memberList = schedule.memberDetails;
    //   if (memberList) {
    //     memberList.forEach(item => {
    //       let emp = employees.find(x => x.UUID === item.member.uuid);
    //       if (emp) {
    //         selectEmployees.push({
    //           ...emp,
    //           memberType: item.memberType,
    //           memberUuid: item.uuid,
    //         });
    //       }
    //     });
    //   }
    //   employees = uniqBy([...selectEmployees, ...employees], 'CODE');
    // }
    this.basicEmployee = employees;
    this.basicVehicle = vehicles;
    this.setState(
      {
        selectVehicle: selectVehicle === undefined ? {} : selectVehicle,
        selectEmployees,
        vehicles,
        employees,
        orders: details,
        loading: false,
        carrieruuids,
      },
      () => {
        // itemConfig
        this.changeCarKey(this.state.carKey);
        // 默认光标
        this.carSearchInput?.focus();
      }
    );
  };

  /** 构建车辆选择卡片 */
  buildSelectVehicleCard = () => {
    const { vehicles, selectVehicle, carKey, carSort, carSearchSort, carrieruuids } = this.state;
    let sliceVehicles = this.state.carEmpNums === 'all' ? vehicles : vehicles.slice(0, this.state.carEmpNums);

    let carTabList;
    try {
      carTabList = carSort.map(e => this.VehicleCardConfig[e - 1])
    } catch (error) {
      carTabList = this.VehicleCardConfig;
    }
    if (carTabList.indexOf(undefined) !== -1) {
      carTabList = this.VehicleCardConfig;
    }

    let carCard;
    switch (carKey) {
      case 'recommend':
        carCard =
          sliceVehicles.length > 0 ? (
            sliceVehicles?.map(vehicle => {
              return (
                <Tooltip
                  placement="top"
                  title={
                    vehicle.BILLNUMBERS
                      ? `${vehicle.PLATENUMBER}在${vehicle.BILLNUMBERS}排车单中有未完成的任务`
                      : ''
                  }
                >
                  <Badge count={vehicle.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                    <a
                      href="#"
                      className={`${style.panel} ${
                        vehicle.UUID === selectVehicle.UUID ? style.panelSelect : ''
                      }`}
                      onClick={() => this.handleVehicle(vehicle)}
                    >
                      <Row justify="space-between" style={{ height: '100%' }}>
                        <Col span={8} className={style.employeeCardContent}>
                          <Icon type="car" style={{ fontSize: 28 }} />
                        </Col>
                        <Col span={16} className={style.employeeCardContent}>
                          <div className={style.employeeName}>
                            <div>{vehicle.PLATENUMBER}</div>
                            {vehicle.DRIVERNAME ? (
                              <div>
                                {vehicle.DRIVERNAME.replace(/\([^)]*\)|（[^)]*）/g, '')}
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </Col>
                        {vehicle.pro > 0 ? (
                          <Badge
                            style={{
                              backgroundColor:
                                vehicle.pro >= 40
                                  ? '#52c41a'
                                  : vehicle.pro >= 20
                                    ? 'orange'
                                    : 'red',
                              marginTop: '-40px',
                            }}
                            count={`${vehicle.pro.toFixed(0)}%`}
                            title={`熟练度${vehicle.pro.toFixed(0)}%`}
                          />
                        ) : (
                          <></>
                        )}
                      </Row>
                    </a>
                  </Badge>
                </Tooltip>
              );
            })
          ) : (
            <Empty description="无熟练度推荐" />
          );
        break;
      default:
        carCard = (
          <div>
            {sliceVehicles?.map(vehicle => {
              return (
                <Tooltip
                  placement="top"
                  title={vehicle.BILLNUMBERS ? `${vehicle.PLATENUMBER}在${vehicle.BILLNUMBERS}排车单中有未完成的任务` : ''}
                >
                  <Badge count={vehicle.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                    <a
                      href="#"
                      className={`${style.panel} ${vehicle.UUID === selectVehicle.UUID ? style.panelSelect : ''}`}
                      onClick={() => this.handleVehicle(vehicle)}
                    >
                      <Row justify="space-between" style={{ height: '100%' }}>
                        <Col span={8} className={style.employeeCardContent}>
                          <Icon type="car" style={{ fontSize: 28 }}/>
                        </Col>
                        <Col span={16} className={style.employeeCardContent}>
                          <div className={style.employeeName} style={{ textAlign: 'center', lineHeight: '20px' }}>
                            <div>{vehicle.PLATENUMBER}</div>
                            {vehicle.DRIVERNAME && <div>{vehicle.DRIVERNAME.replace(/\([^)]*\)|（[^)]*）/g, '')}</div>}
                            <div style={{ color: '#999' }}>
                              {vehicle.BEARWEIGHT}/{Math.round(vehicle?.BEARVOLUME * vehicle?.BEARVOLUMERATE) / 100}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </a>
                  </Badge>
                </Tooltip>
              );
            })}
          </div>
        );
    }
    // sort
    let carSearchSortConfig = {
      1: (
        <Select
          onChange={e => this.setState({ carEmpNums: e })}
          value={this.state.carEmpNums}
          style={{ width: 55, marginRight: 2.5, marginLeft: 2.5 }}
        >
          <Select.Option value={20}>20</Select.Option>
          <Select.Option value={50}>50</Select.Option>
          <Select.Option value={100}>100</Select.Option>
          <Select.Option value="all">全部</Select.Option>
        </Select>
      ),
      2: (
        <Select
          placeholder="车辆归属"
          onChange={value => this.vehicleFilter('vehicleOwner', value)}
          allowClear
          style={{ width: 100, marginRight: 2.5, marginLeft: 2.5 }}
          value={this.state.carEmpSearch.vehicleOwner}
        >
          {this.dict.filter(x => x.dictCode === 'vehicleOwner').map(d => (
            <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
          ))}
        </Select>
      ),
      3: (
        <Search
          placeholder="请输入车牌号/编号"
          onChange={event => this.vehicleFilter('searchKey', event.target.value)}
          style={{ width: 150, marginLeft: 2.5, marginRight: 2.5 }}
          value={this.state.carEmpSearch.vehicleCode}
          ref={e => (this.carSearchInput = e)}
        />
      ),
      4: (
        <Select
          placeholder="承运商"
          onChange={value => this.vehicleFilter('carrier', value)}
          allowClear
          style={{ width: 150, marginRight: 2.5, marginLeft: 2.5 }}
          value={this.state.carEmpSearch.carrier}
        >
          {carrieruuids.map(e => {
            return (
              <Select.Option key={e} title={e}>
                {e}
              </Select.Option>
            );
          })}
        </Select>
      ),
    };

    return (
      <Card
        title="车辆"
        tabList={carTabList}
        onTabChange={key => {
          this.changeCarKey(key);
        }}
        activeTabKey={carKey}
        bodyStyle={{ padding: 0, paddingTop: 8, height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            {carSearchSort.map(e => {
              return carSearchSortConfig[e];
            })}
          </div>
        }
      >
        {carCard}
      </Card>
    );
  };

  /** 构建人员选择卡片 */
  buildSelectEmployeeCard = () => {
    const { employees, selectEmployees } = this.state;
    let sliceEmployees = employees ?
      this.state.carEmpNums === 'all' ? employees : employees?.slice(0, this.state.carEmpNums)
      :
      {};

    // 样式一致
    const empTabList = [
      {
        key: 'init',
        tab: '默认匹配',
      },
    ];
    return (
      <Card
        title="员工"
        tabList={empTabList}
        bodyStyle={{ padding: 0, paddingTop: 8, height: '29vh', overflowY: 'auto' }}
        extra={
          <div>
            <Select
              placeholder="员工归属"
              onChange={value => this.employeeFilter('relation', value)}
              allowClear
              style={{ width: 100 }}
              value={this.state.carEmpSearch.empOwner}
            >
              {this.dict.filter(x => x.dictCode === 'relation').map(d => (
                <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="工种"
              onChange={value => this.employeeFilter('employeeType', value)}
              allowClear
              style={{ width: 100, marginLeft: 5 }}
              value={this.state.carEmpSearch.empType}
            >
              {this.dict.filter(x => x.dictCode === 'employeeType').map(d => (
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
                title={employee.BILLCOUNTS ? `[${employee.CODE}]${employee.NAME.replace(/\([^)]*\)|（[^)]*）/g, '')}在${employee.BILLNUMBERS}排车单中有未完成的任务` : ''}
              >
                <Badge count={employee.BILLCOUNTS} style={{ backgroundColor: 'orange' }}>
                  <a
                    href="#"
                    className={`${style.panel} ${selectEmployees.find(x => x.UUID === employee.UUID) ? style.panelSelect : ''}`}
                    onClick={() => this.handleEmployee(employee)}
                  >
                    <Row justify="space-between" style={{ height: '100%' }}>
                      <Col span={8} className={style.employeeCardContent}>
                        <Icon type="user" style={{ fontSize: 28 }} />
                      </Col>
                      <Col span={16} className={style.employeeCardContent}>
                        <div className={style.employeeName}>
                          <div>
                            {`[${employee.CODE}]${employee.NAME.replace(/\([^)]*\)|（[^)]*）/g, '')}`}
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

  /** 改变选车卡片（改变按熟练度匹配、按默认匹配、按区域匹配） */
  changeCarKey = async key => {
    const { orders } = this.state;
    if (key === 'recommend') {
      // 熟练度
      let vehiclesByRecom = await this.getRecommendByOrders(orders, this.basicVehicle);
      if (vehiclesByRecom) {
        vehiclesByRecom = vehiclesByRecom.filter(item => item.pro && item.pro !== 0);
        this.setState({ vehicles: vehiclesByRecom });
        if (vehiclesByRecom.length > 0) this.handleVehicle(vehiclesByRecom[0]);
      } else this.setState({ vehicles: [] });
    } else if (key === 'init') {
      this.setState({ vehicles: this.basicVehicle });
    } else {
      // 区域匹配
      let orderShipAre = uniqBy(orders.map(x => x.shipAreaName));
      let vehicleAre = this.basicVehicle.filter(e => {
        let x = e.SHIPAREANAME?.split(',');
        return (
          e.SHIPAREANAME !== undefined &&
          orderShipAre.filter(item => x?.indexOf(item) !== -1).length > 0
        );
      });
      this.setState({ vehicles: vehicleAre });
    }
    this.setState({ carKey: key });
  };

  /** 选车 */
  handleVehicle = async vehicle => {
    if (vehicle.JOBSTATE !== 'Used') return message.error(`${vehicle.PLATENUMBER  }不是正常状态，不能选择！`);

    this.setState({ selectVehicle: vehicle })
    let param = {
      tableName: 'v_sj_itms_vehicle_employee_z',
      condition: {
        params: [{ field: 'VEHICLEUUID', rule: 'eq', val: [vehicle.UUID] }],
      },
    };
    const response = await dynamicQuery(param);
    let vehicleEmployees = [];
    if (response.success && response.result.records !== 'false') {
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

  /** 车辆筛选 */
  vehicleFilter = (key, value) => {
    const { vehicleParam } = this.state;
    let serachVeh = [...this.basicVehicle];
    vehicleParam[key] = value;
    if (vehicleParam.searchKey) {
      serachVeh = serachVeh.filter(item => {
        if (!item.DRIVERNAME) item.DRIVERNAME = '';
        if (!item.DRIVERCODE) item.DRIVERCODE = '';
        if (
          item.CODE.search(vehicleParam.searchKey) !== -1 ||
          item.PLATENUMBER.search(vehicleParam.searchKey) !== -1 ||
          item.DRIVERNAME.search(vehicleParam.searchKey) !== -1 ||
          item.DRIVERCODE.search(vehicleParam.searchKey) !== -1
        ) return Boolean(item);
        return false;
      });
    }
    if (vehicleParam.vehicleOwner) serachVeh = serachVeh.filter(x => x.OWNER === vehicleParam.vehicleOwner);
    if (vehicleParam.carrier) serachVeh = serachVeh.filter(x => x.CARRIERUUID === vehicleParam.carrier);
    if (key === 'vehicleOwner') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, vehicleOwner: value } });
    } else if (key === 'carrier') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, carrier: value } });
    } else {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, vehicleCode: value } });
    }
    this.setState({ vehicles: serachVeh, carKey: 'init' });
    if (serachVeh && serachVeh.length > 0) this.handleVehicle(serachVeh[0]);
  };

  /** 人员筛选 */
  employeeFilter = (key, value) => {
    const { empParams } = this.state;
    let searchEmp = [...this.basicEmployee];
    empParams[key] = value;
    if (empParams.searchKey) {
      searchEmp = searchEmp.filter(
        item => item.CODE.search(empParams.searchKey) !== -1 || item.NAME.search(empParams.searchKey) !== -1
      );
    }
    if (empParams.employeeType) searchEmp = searchEmp.filter(x => x.ROLE_TYPE === empParams.employeeType);
    if (empParams.relation) searchEmp = searchEmp.filter(x => x.HIRED_TYPE === empParams.relation);
    if (key === 'relation') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empOwner: value } });
    } else if (key === 'employeeType') {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empType: value } });
    } else {
      this.setState({ carEmpSearch: { ...this.state.carEmpSearch, empInfo: value } });
    }
    this.setState({ employees: searchEmp, empParams });
  };

  /** 按熟练度匹配车辆 */
  getRecommendByOrders = async (record, vehicles) => {
    if (vehicles.length === 0) return;
    if (record.length === 0) return message.error('没有点位');

    // 组装推荐人员车辆接口入参;
    let params = {
      storeCodes: record.map(item => {
        return item.deliveryPoint.code;
      }),
      companyUuid: loginCompany().uuid,
      dUuid: loginOrg().uuid,
      state: 1,
    };
    // 车辆熟练度
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
    // 排序
    vehicles = vehicles.sort((a, b) => b.pro - a.pro);
    return vehicles;
  };

  /** 选人 */
  handleEmployee = emp => {
    const { selectEmployees } = this.state;
    let employees = [...selectEmployees];
    const index = selectEmployees.findIndex(x => x.UUID === emp.UUID);
    emp.memberType = emp.ROLE_TYPE;
    emp.memberUuid = guid();
    index === -1 ? employees.push(emp) : (employees = employees.filter(x => x.memberUuid !== emp.memberUuid))
    this.setState({ selectEmployees: employees });
    console.log("███████employees>>>>🔴", employees,"🔴<<<<██████")
  };

  render () {
    const { loading, selectVehicle, selectEmployees } = this.state;
    const { weight = 0, volume = 0 } = this.props;
    // 重量比例
    const weightPercent = (weight / Number(selectVehicle.BEARWEIGHT || 0)) * 100;
    // 体积比例
    const volumePercent = volume / (Math.round(selectVehicle?.BEARVOLUME * selectVehicle?.BEARVOLUMERATE) / 100) * 100;
    return (
      <Spin tip="加载中..." spinning={loading}>
        <div className={style.empAndVehicleModal}>
          <Row gutter={[0, 0]}>
            <Col span={12}>{this.buildSelectVehicleCard()}</Col>
            <Col span={12}>{this.buildSelectEmployeeCard()}</Col>
          </Row>

          {/* ——————————————底部显示选择的数据—————————————— */}
          <Row gutter={[0, 0]} style={{ marginTop: 6 }}>
            <Col span={12}>
              {selectVehicle.BEARWEIGHT ? (
                <Row>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <div>车辆载重t/商品总重：&nbsp;{selectVehicle.BEARWEIGHT}/{weight}</div>
                    <Progress
                      type="circle"
                      percent={weightPercent}
                      status={weightPercent > 100 ? 'exception' : 'normal'}
                      format={() => weightPercent === Infinity ? 'X' : `${weightPercent.toFixed(2)} %`}
                    />
                  </Col>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <div>
                      车辆体积m³/商品体积：&nbsp;
                      {Math.round(selectVehicle?.BEARVOLUME * selectVehicle?.BEARVOLUMERATE) / 100}/{volume}
                    </div>
                    <Progress
                      type="circle"
                      percent={volumePercent}
                      status={volumePercent > 100 ? 'exception' : 'normal'}
                      format={() => volumePercent === Infinity ? 'X' : `${volumePercent.toFixed(2)} %`}
                    />
                  </Col>
                </Row>
              ) : (
                <>
                  商品总重t/商品体积m³：&nbsp;{weight}/{volume}
                </>
              )}
            </Col>
            <Col span={12}>
              已选人：&nbsp;
              {selectEmployees?.map(item => (
                <span key={item.UUID} style={{ border: '1px solid #ccc', padding: '0 5px', marginRight: 5 }}>
                  {this.empTypeMapper[item.memberType]}[{item.CODE}]{item.NAME}
                </span>
              ))}
            </Col>
          </Row>


        </div>
      </Spin>
    );
  }
}