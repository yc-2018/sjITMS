/*
 * @Author: guankongjin
 * @Date: 2022-03-30 16:34:02
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-03-14 15:47:01
 * @Description: 订单池面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolPage.js
 */
import React, { Component } from 'react';
import { Button, Row, Col, Tabs, message, Icon, Dropdown, Menu, Modal, InputNumber } from 'antd';
import DispatchingTable from './DispatchingTable';
import DispatchingChildTable from './DispatchingChildTable';
import {
  OrderColumns,
  OrderCollectColumns,
  OrderDetailColumns,
  VehicleColumns,
  pagination,
} from './DispatchingColumns';
import SearchForm from './SearchForm';
import BatchProcessConfirm from './BatchProcessConfirm';
import DispatchingCreatePage from './DispatchingCreatePage';
import DispatchMap from '@/pages/SJTms/MapDispatching/dispatching/DispatchingMap';
import dispatchingStyles from './Dispatching.less';
import {
  queryAuditedOrder,
  queryCollectAuditedOrder,
  savePending,
  getContainerByBillUuid,
} from '@/services/sjitms/OrderBill';
import {
  save,
  batchSave,
  addOrders,
  checkArea,
  checkAreaSchedule,
} from '@/services/sjitms/ScheduleBill';
import { queryData } from '@/services/quick/Quick';
import { groupBy, sumBy, uniqBy } from 'lodash';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import mapIcon from '@/assets/common/map.svg';

const { TabPane } = Tabs;
export default class OrderPoolPage extends Component {
  state = {
    loading: false,
    btnLoading: false,
    auditedData: [],
    searchPagination: false,
    pageFilter: [],
    vehiclePagination: false,
    vehicleFilter: [],
    auditedCollectData: [],
    vehicleData: [],
    auditedParentRowKeys: [],
    auditedRowKeys: [],
    vehicleRowKeys: [],
    activeKey: 'Audited',
    waveOrder: {},
    modalVisible: false,
    searchParams: [],
    queryKey: 1,
    countUnit: 0,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOrderCollect != this.props.isOrderCollect) {
      this.setState({
        auditedParentRowKeys: [],
        auditedRowKeys: [],
      });
    }
  }
  isOrgQuery = [
    { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
    { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
  ];

  //刷新
  refreshTable = () => {
    const { activeKey } = this.state;
    switch (activeKey) {
      case 'Vehicle':
        this.refreshVehiclePool();
        break;
      default:
        this.refreshOrderPool();
        break;
    }
  };

  refreshOrderPool = (params, pages, sorter) => {
    this.setState({ loading: true });
    let body = document.querySelector('.ant-table-body');
    if (body) {
      body.scrollTop = 0;
    }
    let { pageFilter, searchPagination } = this.state;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      if (params.superQuery) {
        filter = params;
        pageFilter = params.superQuery.queryParams;
      } else {
        pageFilter = params;
      }
    }
    if (sorter && sorter.column)
      filter.order =
        (sorter.column.sorterCode ? sorter.columnKey + 'Code' : sorter.columnKey) +
        ',' +
        sorter.order;
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
      //设置页码缓存
      localStorage.setItem('OrderPoolPageSize', filter.pageSize);
    } else {
      //增加查询页数从缓存中读取
      let pageSize = localStorage.getItem('OrderPoolPageSize')
        ? parseInt(localStorage.getItem('OrderPoolPageSize'))
        : 100;
      filter.page = searchPagination.current;
      filter.pageSize = searchPagination.pageSize || pageSize;
    }
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...this.isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrder(filter).then(async response => {
      if (response.success) {
        searchPagination = {
          ...pagination,
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        };
        const data = response.data.records ? response.data.records : [];
        const collectResponse = this.props.dispatchConfig?.isShowSum
          ? await queryCollectAuditedOrder(filter)
          : {};
        this.setState({
          searchPagination,
          auditedData: data,
          auditedCollectData: this.groupData(data),
          auditedParentRowKeys: [],
          auditedRowKeys: [],
          vehicleRowKeys: [],
          waveOrder: collectResponse.success ? collectResponse.data : {},
        });
      }
      this.props.refreshSelectRowOrder([], ['Audited', 'PartScheduled']);
      this.setState({ activeKey: 'Audited', loading: false, pageFilter });
    });
    this.props.refreshPending();
  };

  refreshVehiclePool = (params, pages, sorter) => {
    this.setState({ loading: true });
    let { vehicleFilter, vehiclePagination } = this.state;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      if (params.superQuery) {
        filter = params;
        vehicleFilter = params.superQuery.queryParams;
      } else {
        vehicleFilter = params;
      }
    }
    if (sorter && sorter.column)
      filter.order =
        (sorter.column.sorterCode ? sorter.columnKey + 'Code' : sorter.columnKey) +
        ',' +
        sorter.order;
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
      //设置页码缓存
      localStorage.setItem('VehiclePoolPageSize', filter.pageSize);
    } else {
      //增加查询页数从缓存中读取
      let pageSize = localStorage.getItem('VehiclePoolPageSize')
        ? parseInt(localStorage.getItem('VehiclePoolPageSize'))
        : 100;
      filter.page = vehiclePagination.current;
      filter.pageSize = vehiclePagination.pageSize || pageSize;
    }
    filter.superQuery.queryParams = [...vehicleFilter, ...this.isOrgQuery];
    filter.quickuuid = 'v_sj_itms_vehicle_stat';
    queryData(filter).then(response => {
      if (response.success) {
        vehiclePagination = {
          ...pagination,
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        };
        let vehicleData = response.data.records ? response.data.records : [];
        vehicleData = vehicleData.map(vehicle => {
          return { ...vehicle, uuid: vehicle.UUID };
        });
        this.setState({
          vehiclePagination,
          vehicleData,
          auditedRowKeys: [],
          vehicleRowKeys: [],
        });
      }
      this.setState({ activeKey: 'Vehicle', loading: false, vehicleFilter });
    });
  };

  //按送货点汇总运输订单
  groupData = data => {
    let output = groupBy(data, x => x.deliveryPoint.code);
    let deliveryPointGroupArr = Object.keys(output).map(pointCode => {
      const orders = output[pointCode];
      return {
        pointCode,
        uuid: orders[0].uuid,
        deliveryPoint: orders[0].deliveryPoint,
        archLine: orders[0].archLine,
        owner: orders[0].owner,
        address: orders[0].deliveryPoint.address,
        stillCartonCount: Math.round(sumBy(orders, 'stillCartonCount') * 1000) / 1000,
        stillScatteredCount: Math.round(sumBy(orders, 'stillScatteredCount') * 1000) / 1000,
        stillContainerCount: Math.round(sumBy(orders, 'stillContainerCount') * 1000) / 1000,
        cartonCount: Math.round(sumBy(orders, 'cartonCount') * 1000) / 1000,
        realCartonCount: Math.round(sumBy(orders, 'realCartonCount') * 1000) / 1000,
        scatteredCount: Math.round(sumBy(orders, 'scatteredCount') * 1000) / 1000,
        realScatteredCount: Math.round(sumBy(orders, 'realScatteredCount') * 1000) / 1000,
        containerCount: Math.round(sumBy(orders, 'containerCount') * 1000) / 1000,
        realContainerCount: Math.round(sumBy(orders, 'realContainerCount') * 1000) / 1000,
        volume: Math.round(sumBy(orders, 'volume') * 1000) / 1000,
        weight: Math.round(sumBy(orders, 'weight') * 1000) / 1000,
      };
    });
    deliveryPointGroupArr.forEach(data => {
      data.details = output[data.pointCode];
    });
    return deliveryPointGroupArr;
  };

  //标签页切换事件
  handleTabChange = activeKey => {
    switch (activeKey) {
      case 'Vehicle':
        this.refreshVehiclePool();
        break;
      default:
        this.setState({ activeKey });
        break;
    }
  };

  //表格行选择
  tableChangeRows = (tableType, selectedRowKeys) => {
    switch (tableType) {
      case 'Vehicle':
        this.setState({ vehicleRowKeys: selectedRowKeys });
        break;
      default:
        const { auditedData } = this.state;
        this.props.refreshSelectRowOrder(
          auditedData.filter(x => selectedRowKeys.indexOf(x.uuid) != -1),
          ['Audited', 'PartScheduled']
        );
        this.setState({ auditedRowKeys: selectedRowKeys });
        break;
    }
  };

  childTableChangeRows = result => {
    const { auditedData } = this.state;
    const totalAuditedData = auditedData.filter(
      x => result.childSelectedRowKeys.indexOf(x.uuid) != -1
    );
    this.props.refreshSelectRowOrder(totalAuditedData, ['Audited', 'PartScheduled']);
    this.setState({
      auditedParentRowKeys: result.selectedRowKeys,
      auditedRowKeys: result.childSelectedRowKeys,
    });
  };

  //排车
  dispatching = async () => {
    const { auditedRowKeys, auditedData } = this.state;
    const selectPending = this.props.selectPending();
    if (auditedRowKeys.length + selectPending.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    let orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    orders = [...orders, ...selectPending];
    //校验区域组合
    const result = await checkArea(orders);
    if (result && result.data) {
      Modal.confirm({
        title: '所选门店配送区域不一样，确定排车吗？',
        onOk: () => {
          this.dispatchingCom(orders);
        },
      });
      return;
    } else {
      this.dispatchingCom(orders);
    }
  };

  dispatchingCom(orders) {
    //订单类型校验
    const orderType = uniqBy(orders.map(x => x.orderType));
    if (orderType.includes('Returnable') && orderType.some(x => x != 'Returnable')) {
      message.error('门店退货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    if (orderType.includes('TakeDelivery') && orderType.some(x => x != 'TakeDelivery')) {
      message.error('提货类型运输订单不能与其它类型订单混排，请检查！');
      return;
    }
    //不可共配校验
    let owners = orders.map(x => {
      return { ...x.owner, noJointlyOwnerCodes: x.noJointlyOwnerCode };
    });
    owners = uniqBy(owners, 'uuid');
    const checkOwners = owners.filter(x => x.noJointlyOwnerCodes);
    let noJointlyOwner = undefined;
    checkOwners.forEach(owner => {
      //不可共配货主
      const noJointlyOwnerCodes = owner.noJointlyOwnerCodes.split(',');
      const noJointlyOwners = owners.filter(
        x => noJointlyOwnerCodes.indexOf(x.code) != -1 && x.code != owner.code
      );
      if (noJointlyOwners.length > 0) {
        noJointlyOwner = {
          ownerName: owner.name,
          owners: noJointlyOwners.map(x => x.name).join(','),
        };
      }
    });
    if (noJointlyOwner != undefined) {
      message.error(
        '货主：' +
          noJointlyOwner.ownerName +
          '与[' +
          noJointlyOwner.owners +
          ']不可共配，请检查货主配置!'
      );
      return;
    }
    this.createPageModalRef.show(false, orders);
  }

  veriftOrder = orders => {
    const orderType = uniqBy(orders.map(x => x.orderType));
    if (orderType.includes('Returnable') && orderType.some(x => x != 'Returnable')) {
      message.error('门店退货类型运输订单不能与其它类型订单混排，请检查！');
      return false;
    }
    if (orderType.includes('TakeDelivery') && orderType.some(x => x != 'TakeDelivery')) {
      message.error('提货类型运输订单不能与其它类型订单混排，请检查！');
      return false;
    }
    //不可共配校验
    let owners = [...orders].map(x => {
      return { ...x.owner, noJointlyOwnerCodes: x.noJointlyOwnerCode };
    });
    owners = uniqBy(owners, 'uuid');
    const checkOwners = owners.filter(x => x.noJointlyOwnerCodes);
    let noJointlyOwner = undefined;
    checkOwners.forEach(owner => {
      //不可共配货主
      const noJointlyOwnerCodes = owner.noJointlyOwnerCodes.split(',');
      const noJointlyOwners = owners.filter(
        x => noJointlyOwnerCodes.indexOf(x.code) != -1 && x.code != owner.code
      );
      if (noJointlyOwners.length > 0) {
        noJointlyOwner = {
          ownerName: owner.name,
          owners: noJointlyOwners.map(x => x.name).join(','),
        };
      }
    });
    if (noJointlyOwner != undefined) {
      message.error(
        '货主：' +
          noJointlyOwner.ownerName +
          '与[' +
          noJointlyOwner.owners +
          ']不可共配，请检查货主配置!'
      );
      return false;
    }
    return true;
  };
  //地图排车
  dispatchingByMap = orders => {
    // if (orders.length <= 0) {
    //   message.warning('请选择门店！');
    //   return;
    // }
    //订单类型校验
    if (!this.veriftOrder(orders)) {
      return;
    }
    // this.setState({ mapModal: false });
    this.createPageModalRef.show(false, orders);
  };

  handleCreateSchedule = () => {
    const { vehicleRowKeys } = this.state;
    if (vehicleRowKeys.length == 0) {
      message.warning('请选择车辆！');
      return;
    }
    if (vehicleRowKeys.length == 1) {
      this.createSchedule(vehicleRowKeys[0]).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.props.refreshSchedule();
          this.setState({ vehicleRowKeys: [] });
        }
      });
    } else {
      this.batchProcessConfirmRef.show('创建排车单', vehicleRowKeys, this.createSchedule, () => {
        this.props.refreshSchedule();
        this.setState({ vehicleRowKeys: [] });
      });
    }
  };
  //创建排车单
  createSchedule = async uuid => {
    const { vehicleData } = this.state;
    const vehicle = vehicleData.find(x => x.uuid == uuid);
    const carrier = vehicle.DRIVERUUID
      ? {
          uuid: vehicle.DRIVERUUID,
          code: vehicle.DRIVERCODE,
          name: vehicle.DRIVERNAME,
        }
      : {};
    let memberDetails = [{ member: carrier, memberType: 'Driver' }];
    if (vehicle.DELIVERYUUID) {
      memberDetails.push({
        member: {
          uuid: vehicle.DELIVERYUUID,
          code: vehicle.DELIVERYCODE,
          name: vehicle.DELIVERYNAME,
        },
        memberType: 'DeliveryMan',
      });
    }
    const paramBody = {
      type: 'Job',
      vehicle: {
        uuid: vehicle.UUID,
        code: vehicle.CODE,
        name: vehicle.PLATENUMBER,
      },
      vehicleType: {
        uuid: vehicle.VEHICLETYPEUUID,
        code: vehicle.VEHICLETYPECODE,
        name: vehicle.VEHICLETYPENAME,
      },
      carrier: { ...carrier },
      details: [],
      memberDetails,
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
    };
    return await save(paramBody);
  };

  //添加到待定池
  handleAddPending = async () => {
    const { auditedRowKeys } = this.state;
    this.setState({ btnLoading: true });
    if (auditedRowKeys.length == 0) {
      message.warning('请选择运输订单！');
      return;
    }
    const response = await savePending(auditedRowKeys);
    if (response.success) {
      message.success('保存成功！');
      this.refreshTable();
      this.props.refreshPending();
    }
    this.setState({ btnLoading: false });
  };

  //添加到排车单
  handleAddOrder = async (checkWeight, checkArea) => {
    const { auditedRowKeys, auditedData } = this.state;
    this.setState({ btnLoading: true });
    const scheduleRowKeys = this.props.scheduleRowKeys();
    if (scheduleRowKeys == undefined || scheduleRowKeys.length != 1) {
      message.warning('请选择一张排车单！');
      return;
    }
    if (auditedRowKeys == undefined || auditedRowKeys.length == 0) {
      message.warning('请选择待定运输订单！');
      return;
    }
    const orders = auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1);
    const schedule = this.props.getSchedule(scheduleRowKeys[0]);
    const exceedWeight =
      sumBy(orders, x => x.weight) + schedule.WEIGHT * 1000 - schedule.BEARWEIGHT * 1000;
    if (exceedWeight > 0 && checkWeight == undefined) {
      Modal.confirm({
        title: '提示',
        content: '排车重量超' + (exceedWeight / 1000).toFixed(3) + 't,确定继续吗?',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.handleAddOrder(true, checkArea);
        },
        onCancel: () => {
          this.setState({ btnLoading: false });
        },
      });
      return;
    }
    if (this.props.dispatchConfig.checkArea == 1 && checkArea == undefined) {
      const response = await checkAreaSchedule(auditedRowKeys, scheduleRowKeys[0]);
      if (response && response.data) {
        Modal.confirm({
          title: '所选门店配送区域不一样，确定排车吗？',
          onOk: () => {
            this.handleAddOrder(checkWeight, true);
          },
          onCancel: () => {
            this.setState({ btnLoading: false });
          },
        });
        return;
      }
    }
    const response = await addOrders({ billUuid: scheduleRowKeys[0], orderUuids: auditedRowKeys });
    if (response.success) {
      message.success('保存成功！');
      this.refreshTable();
      this.props.refreshSchedule();
    }
    this.setState({ btnLoading: false });
  };
  //添加
  add = () => {
    const { searchParams, queryKey } = this.state;
    const nextSearchParams = searchParams.concat({
      key: queryKey,
      number: undefined,
    });
    this.setState({ searchParams: nextSearchParams, queryKey: queryKey + 1 });
  };
  //删除拆单条件
  remove = key => {
    const { searchParams } = this.state;
    const newSearchParams = searchParams.filter(x => x.key !== key).map((e, index) => {
      return {
        key: index + 1,
        number: e.number,
      };
    });
    let countUnit = 0;
    newSearchParams.forEach(item => {
      if (item.number) {
        countUnit += Number(item.number);
      }
    });
    this.setState({ searchParams: newSearchParams, countUnit });
  };
  onChangeNum = (key, e) => {
    const { searchParams } = this.state;
    let countUnit = 0;
    searchParams.forEach(item => {
      if (item.key == key) {
        item.number = e;
      }
      if (item.number) {
        countUnit += Number(item.number);
      }
    });
    this.setState({ countUnit, searchParams });
  };
  //汇总
  groupByOrder = data => {
    data = data.filter(x => x.orderType !== 'OnlyBill');
    const deliveryPointCount = data ? uniqBy(data.map(x => x.deliveryPoint.code)).length : 0;
    const pickupPointCount = data ? uniqBy(data.map(x => x.pickUpPoint.code)).length : 0;
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
      ownerCount: data ? uniqBy(data.map(x => x.owner.code)).length : 0,
    };
  };
  handAddSchedule = async () => {
    const { auditedData, searchParams, auditedRowKeys, countUnit } = this.state;
    let orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    if (countUnit > orders[0].stillCartonCount) {
      message.error('存在数量多拆,请检查');
      return;
    }
    if (searchParams.filter(e => e.number == undefined).length > 0) {
      message.error('存在未填写的拆单数');
      return;
    }
    if (searchParams.length == 1) {
      message.error('请拆多份');
      return;
    }
    if (countUnit < orders[0].stillCartonCount) {
      Modal.confirm({
        title: '提示',
        onOk: () => this.onBatchSave(orders, searchParams),
        content: '还剩' + (orders[0].stillCartonCount - countUnit) + '件没有拆完,确定提交吗？',
      });
    } else {
      this.onBatchSave(orders, searchParams);
    }
  };
  onBatchSave = async (orders, searchParams) => {
    this.setState({ loading: true });
    const orderType = uniqBy(orders.map(x => x.orderType)).shift();
    const type = orderType == 'TakeDelivery' ? 'Task' : 'Job';
    //const driver = selectEmployees.find(x => x.memberType == 'Driver');
    const response = await getContainerByBillUuid(orders[0].uuid);
    let cartonVolume = undefined;
    let cartonWeight = undefined;
    let containerVolume = 0;
    let containerWeight = 0;
    let scatteredVolume = 0;
    let scatteredWeight = 0;
    if (response.success) {
      const cartonNumber = response.data?.find(x => x.vehicleType == 'Carton');
      const containerNumber = response.data?.find(x => x.vehicleType == 'Container');
      const scatteredNumber = response.data?.find(x => x.vehicleType == 'Scattered');
      if (cartonNumber) {
        cartonVolume = cartonNumber.realVolume || cartonNumber.forecastVolume;
        cartonWeight = cartonNumber.realWeight || cartonNumber.forecastWeight;
      }
      if (containerNumber) {
        containerVolume = containerNumber.realVolume || containerNumber.forecastVolume;
        containerWeight = containerNumber.realWeight || containerNumber.forecastWeight;
      }
      if (scatteredNumber) {
        scatteredVolume = scatteredNumber.realVolume || scatteredNumber.forecastVolume;
        scatteredWeight = scatteredNumber.realWeight || scatteredNumber.forecastWeight;
      }
    }
    const schedules = searchParams.map(e => {
      let item = {};
      item.isSplit = 1;
      let delVolume = (Number(e.number) / orders[0].stillCartonCount) * cartonVolume;
      let delWeight = (Number(e.number) / orders[0].stillCartonCount) * cartonWeight;
      if (e.key == 1) {
        item.cartonCount = e.number;
        item.scatteredCount = orders[0].stillScatteredCount;
        item.containerCount = orders[0].stillContainerCount;
        if (item.scatteredCount != 0) {
          delWeight = delWeight + Number(scatteredWeight);
          delVolume = delVolume + Number(scatteredVolume);
        }
        if (item.containerCount != 0) {
          delWeight = delWeight + Number(containerWeight);
          delVolume = delVolume + Number(containerVolume);
        }
      } else {
        item.cartonCount = e.number;
        item.scatteredCount = 0;
        item.containerCount = 0;
      }
      item.weight = delWeight;
      item.volume = delVolume;
      item.realScatteredCount = 0;
      item.realContainerCount = 0;
      item.realCartonCount = 0;
      const details = [
        {
          ...orders[0],
          ...item,
          orderUuid: item.orderUuid || orders[0].uuid,
          orderNumber: item.orderNumber || orders[0].billNumber,
        },
      ];
      const orderSummary = this.groupByOrder(details);
      return {
        type,
        deliveryPointCount: details.length,
        details,
        vehicle: {},
        vehicleType: {},
        carrier: {},
        memberDetails: [],
        ...orderSummary,
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        note: '',
      };
    });
    await batchSave(schedules).then(result => {
      if (result && result.success) {
        message.success('生成成功');
        this.setState({ modalVisible: false });
        this.refreshTable();
        this.props.refreshSchedule();
      }
    });
    this.setState({ loading: true });
  };
  //汇总数据
  drawCollect = (footer, orders) => {
    const { dispatchConfig } = this.props;
    if (!dispatchConfig?.isShowSum && footer) {
      return;
    }
    const totalTextStyle = footer
      ? {}
      : { fontSize: 16, fontWeight: 700, marginLeft: 2, color: '#333' };
    const columnStyle = {
      fontSize: 14,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
    const count =
      Number(orders.realCartonCount) +
      Number(orders.realScatteredCount) +
      Number(orders.realContainerCount) * 2;
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ ...columnStyle, flex: 1.3 }}>
          总件数:
          <span style={totalTextStyle}>{count}</span>
        </div>
        {footer && dispatchConfig.calvehicle && dispatchConfig.calvehicle > 0 ? (
          <div style={{ ...columnStyle, flex: 0.8 }}>
            预排:
            <span style={totalTextStyle}>{Math.ceil(count / dispatchConfig.calvehicle)}</span>
          </div>
        ) : null}
        <div style={{ ...columnStyle, flex: 1 }}>
          整件:
          <span style={totalTextStyle}>{orders.realCartonCount}</span>
        </div>
        <div style={{ ...columnStyle, flex: 1 }}>
          散件:
          <span style={totalTextStyle}>{orders.realScatteredCount}</span>
        </div>
        <div style={{ ...columnStyle, flex: 1.2 }}>
          周转筐:
          <span style={totalTextStyle}>{orders.realContainerCount}</span>
        </div>
        <div style={{ ...columnStyle, flex: 1.2 }}>
          体积:
          <span style={totalTextStyle}>{orders.volume}</span>
        </div>
        <div style={{ ...columnStyle, flex: 1.2 }}>
          重量:
          <span style={totalTextStyle}>{orders.weight}</span>
        </div>
        {footer ? null : (
          <div style={{ ...columnStyle, flex: 1 }}>
            门店:
            <span style={totalTextStyle}>{orders.totalStores}</span>
          </div>
        )}
      </div>
    );
  };
  //计算汇总
  collectByOrder = data => {
    data = data.filter(x => x.orderType !== 'OnlyBill');
    if (data.length == 0) {
      return {
        realCartonCount: 0,
        realScatteredCount: 0,
        realContainerCount: 0,
        volume: 0,
        weight: 0,
        totalStores: 0,
      };
    }
    let totalStores = [];
    data = data.map(x => {
      if (x.orderNumber) {
        x.stillCartonCount = x.cartonCount;
        x.stillScatteredCount = x.scatteredCount;
        x.stillContainerCount = x.containerCount;
      }
      if (totalStores.indexOf(x.deliveryPoint.code) == -1) {
        totalStores.push(x.deliveryPoint.code);
      }
      return x;
    });
    return {
      realCartonCount: Math.round(sumBy(data.map(x => x.stillCartonCount)) * 100) / 100,
      realScatteredCount: Math.round(sumBy(data.map(x => x.stillScatteredCount)) * 100) / 100,
      realContainerCount: Math.round(sumBy(data.map(x => x.stillContainerCount)) * 100) / 100,
      weight: Math.round(sumBy(data.map(x => Number(x.weight)))) / 1000,
      volume: Math.round(sumBy(data.map(x => Number(x.volume))) * 100) / 100,
      totalStores: totalStores.length,
    };
  };
  //运力池汇总
  drawVehicleCollect = (vehicles, rowKeys) => {
    const totalTextStyle = { fontSize: 16, fontWeight: 700, marginLeft: 2, color: '#333' };
    vehicles = vehicles.filter(x => rowKeys.indexOf(x.uuid) != -1);
    return (
      <Row type="flex" justify="space-around" style={{ fontSize: 14 }}>
        <Col span={5}>
          车辆数: <span style={totalTextStyle}>{vehicles.length}</span>
        </Col>
        <Col span={5}>
          总限重:
          <span style={totalTextStyle}>
            {Math.round(sumBy(vehicles.map(x => x.BEARWEIGHT)) * 100) / 100}
          </span>
        </Col>
        <Col span={5}>
          总容积:
          <span style={totalTextStyle}>
            {Math.round(sumBy(vehicles.map(x => (x.BEARVOLUME * x.BEARVOLUMERATE) / 100)) * 100) /
              100}
          </span>
        </Col>
      </Row>
    );
  };

  buildOperations = activeKey => {
    const { btnLoading } = this.state;
    switch (activeKey) {
      case 'Vehicle':
        return (
          <Button type={'primary'} onClick={this.handleCreateSchedule}>
            生成排车单
          </Button>
        );
      default:
        return (
          <>
            <Button type={'primary'} onClick={this.dispatching}>
              排车
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={() => this.handleAddOrder()}
              loading={btnLoading}
            >
              添加到排车单
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={this.handleAddPending} loading={btnLoading}>
              添加到待定池
            </Button>
          </>
        );
    }
  };

  // onDoubleClick = record => {
  //   let orders = [record];
  //   if (!this.veriftOrder(orders)) {
  //     return;
  //   }
  //   this.createPageModalRef.show(false, orders);
  // };

  render() {
    const {
      loading,
      auditedParentRowKeys,
      auditedRowKeys,
      auditedData,
      searchPagination,
      vehiclePagination,
      auditedCollectData,
      vehicleRowKeys,
      vehicleData,
      activeKey,
      searchParams,
      waveOrder,
      countUnit,
    } = this.state;
    const { isOrderCollect, totalOrder, dispatchConfig } = this.props;
    const collectOrder = this.collectByOrder(totalOrder);
    let orders = auditedData ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1) : [];
    const formItems = searchParams.map(searchParam => (
      <Row gutter={16} key={searchParam.key}>
        <Col span={9}>
          <span>{'第' + searchParam.key + '份排车单'}</span>
        </Col>
        <Col span={4}>
          <InputNumber
            min={1}
            onChange={this.onChangeNum.bind(this, searchParam.key)}
            value={searchParam.number}
          />
        </Col>
        <Col span={1} offset={7}>
          {searchParams.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => this.remove(searchParam.key)}
            />
          ) : null}
        </Col>
      </Row>
    ));
    const orderPoolHeight = dispatchConfig?.isShowSum ? 235 : 210;
    return (
      <div>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Tabs
          activeKey={activeKey}
          onChange={this.handleTabChange}
          tabBarExtraContent={this.buildOperations(activeKey)}
        >
          <TabPane tab={<span className={dispatchingStyles.cardTitle}>订单池</span>} key="Audited">
            {/* 查询表单 */}
            <SearchForm
              refresh={this.refreshTable}
              quickuuid="sj_itms_dispatching_orderpool"
              dispatchcenterSearch={true}
              refreshOrderPool={this.refreshOrderPool}
            />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      const { auditedRowKeys, auditedData } = this.state;
                      const selectPending = this.props.selectPending();
                      if (auditedRowKeys.length + selectPending.length != 1) {
                        message.warning('请选择一条运输订单！');
                        return;
                      }
                      this.setState({ modalVisible: true });
                    }}
                  >
                    拆单
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      const { auditedRowKeys, auditedData } = this.state;
                      const selectPending = this.props.selectPending();
                      if (auditedRowKeys.length + selectPending.length == 0) {
                        message.warning('请选择运输订单！');
                        return;
                      }
                      let orders = auditedData
                        ? auditedData.filter(x => auditedRowKeys.indexOf(x.uuid) != -1)
                        : [];
                      orders = [...orders, ...selectPending];
                      this.dispatchMapRef.show(orders);
                    }}
                  >
                    <img src={mapIcon} style={{ width: 20, height: 20 }} />
                    地图排车
                  </Menu.Item>
                </Menu>
              }
              trigger={['contextMenu']}
            >
              <div>
                {/* 待排订单列表 */}
                {isOrderCollect ? (
                  <DispatchingChildTable
                    comId="orderPool"
                    clickRow
                    childSettingCol
                    pagination={searchPagination || false}
                    loading={loading}
                    dataSource={auditedCollectData}
                    refreshDataSource={(_, pagination, sorter) => {
                      this.refreshOrderPool(undefined, pagination, sorter);
                    }}
                    changeSelectRows={this.childTableChangeRows}
                    selectedRowKeys={auditedParentRowKeys}
                    childSelectedRowKeys={auditedRowKeys}
                    columns={OrderCollectColumns}
                    nestColumns={OrderDetailColumns}
                    scrollY={`calc(86vh - ${orderPoolHeight}px)`}
                    title={() => this.drawCollect(false, collectOrder)}
                    footer={() => this.drawCollect(true, waveOrder)}
                    // onDoubleClick={this.onDoubleClick}
                  />
                ) : (
                  <DispatchingTable
                    comId="orderPool"
                    clickRow
                    pagination={searchPagination || false}
                    loading={loading}
                    dataSource={auditedData}
                    refreshDataSource={(_, pagination, sorter) => {
                      this.refreshOrderPool(undefined, pagination, sorter);
                    }}
                    changeSelectRows={selectedRowKeys =>
                      this.tableChangeRows('Audited', selectedRowKeys)
                    }
                    selectedRowKeys={auditedRowKeys}
                    columns={OrderColumns}
                    scrollY={`calc(86vh - ${orderPoolHeight}px)`}
                    title={() => this.drawCollect(false, collectOrder)}
                    footer={() => this.drawCollect(true, waveOrder)}
                  />
                )}
              </div>
            </Dropdown>

            {auditedData.length == 0 ? (
              <></>
            ) : (
              <div className={dispatchingStyles.orderPoolFooter}>
                <div className={dispatchingStyles.orderTotalPane}>
                  <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
                  <span style={{ marginLeft: 5 }}>
                    已选择
                    <span style={{ color: '#3B77E3', margin: '0 2px' }}>
                      {auditedRowKeys.length}
                    </span>
                    项
                  </span>
                  <a
                    href="##"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.tableChangeRows(_, []);
                      if (isOrderCollect) {
                        this.setState({ auditedParentRowKeys: [] });
                      }
                    }}
                  >
                    取消全部
                  </a>
                </div>
              </div>
            )}
            <div style={{ position: 'absolute', top: 12, left: 160 }}>
              <a href="#" onClick={() => this.dispatchMapRef.show()}>
                <img src={mapIcon} style={{ width: 20, height: 20 }} />
                地图
              </a>
              {/* <Switch
                style={{ marginLeft: 15 }}
                checked={this.props.isOrderCollect}
                checkedChildren="门店汇总"
                unCheckedChildren="门店汇总"
                onClick={isOrderCollect => {
                  this.props.refreshOrderCollect(isOrderCollect);
                }}
              /> */}
            </div>
            {/* 排车modal */}
            <DispatchingCreatePage
              modal={{ title: '排车' }}
              refresh={() => {
                this.refreshTable();
                this.props.refreshPending();
                this.props.refreshSchedule();
              }}
              dispatchConfig={this.props.dispatchConfig}
              onRef={node => (this.createPageModalRef = node)}
            />
            <DispatchMap
              dispatchingByMap={this.dispatchingByMap}
              onRef={node => (this.dispatchMapRef = node)}
            />
          </TabPane>
          <TabPane tab={<span className={dispatchingStyles.cardTitle}>运力池</span>} key="Vehicle">
            <SearchForm
              refresh={this.refreshTable}
              quickuuid="v_sj_itms_vehicle_stat"
              refreshOrderPool={this.refreshVehiclePool}
            />
            {/* 运力池 */}
            <DispatchingTable
              comId="vehicles"
              clickRow
              pagination={vehiclePagination || false}
              loading={loading}
              dataSource={vehicleData}
              refreshDataSource={(_, pagination, sorter) => {
                this.refreshVehiclePool(undefined, pagination, sorter);
              }}
              changeSelectRows={rowKeys => this.tableChangeRows('Vehicle', rowKeys)}
              selectedRowKeys={vehicleRowKeys}
              columns={VehicleColumns}
              scrollY="calc(86vh - 215px)"
              title={() => this.drawVehicleCollect(vehicleData, vehicleRowKeys)}
            />
            {/* {vehicleData.length == 0 ? (
              <></>
            ) : (
              <div className={dispatchingStyles.orderPoolFooter}>
                <div className={dispatchingStyles.orderTotalPane}>
                  <Icon type="info-circle" theme="filled" style={{ color: '#3B77E3' }} />
                  <span style={{ marginLeft: 5 }}>
                    已选择
                    <span style={{ color: '#3B77E3', margin: '0 2px' }}>
                      {vehicleRowKeys.length}
                    </span>
                    项
                  </span>
                  <a
                    href="##"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      this.tableChangeRows('Vehicle', []);
                    }}
                  >
                    取消全部
                  </a>
                </div>
              </div>
            )} */}
          </TabPane>
        </Tabs>
        <Modal
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          afterClose={() => {
            this.setState({ queryKey: 1, countUnit: 0, searchParams: [] });
          }}
          onOk={() => this.handAddSchedule()}
          confirmLoading={loading}
        >
          <Row>
            <Col span={9}>
              <span>{'整件数:' + orders[0]?.stillCartonCount}</span>
            </Col>
            <Col span={3}>
              <span>
                剩余数:
                {orders && orders[0] != undefined ? orders[0].stillCartonCount - countUnit : 0}
              </span>
            </Col>
            <Col span={1} offset={7}>
              <Button type="dashed" onClick={this.add}>
                <Icon type="plus" /> 添加
              </Button>
            </Col>
          </Row>
          {formItems}
        </Modal>
      </div>
    );
  }
}
