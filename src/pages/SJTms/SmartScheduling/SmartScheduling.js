// ///////////////////////////智能调度页面//////////////
// todo 后续高德api放后端请求
// 配送调度提供window.selectOrders   如果是配送调度跳转过来的订单池原数据列表(如果是刚打开就读取到就直接使用) 使用完马上清空
// 配送调度提供window.refreshDispatchAll：配送调度打开后存在在的方法，调用可以刷新配送调度的全部数据
// 配送调度提供window.openCreateSchedule：打开排车单创建界面
// 说明window.localStorage》mapStyleName：当前地图样式名称
// 说明window.localStorage》lastVehicles+loginOrg().uuid：上次车辆池数据列表
// 智能调度提供window.smartSchedulingHandleOrders 打开了这个界面，又从配送调度界面选单时 给配送调度界面使用的（还要考虑是否现在正在智能调度中）
// 智能调度提供window.createScheduleOrders 监测到没打开配送调度时，把一条线路数据赋值给它，并打开配送调度，剩下的交给配送调度

import React, { Component, createRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import {
  Badge,
  Button,
  Col,
  Divider,
  Drawer,
  Empty,
  Icon,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Popover,
  Progress,
  Row,
  Select,
  Switch,
  Table,
  Tooltip
} from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import _, { uniqBy } from 'lodash';
import ReactDOM from 'react-dom';
import { AMapDefaultConfigObj, AMapDefaultLoaderObj } from '@/utils/mapUtil';
import styles from './SmartScheduling.less';
import VehiclePoolPage from '@/pages/SJTms/Dispatching/VehiclePoolPage';
import OrderPoolModal from '@/pages/SJTms/SmartScheduling/OrderPoolModal';
import { mergeOrdersColumns, mergeVehicleColumns, vehicleColumns } from '@/pages/SJTms/SmartScheduling/columns';
import { dynamicQuery, queryDict, queryDictByCode } from '@/services/quick/Quick';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getSmartScheduling } from '@/services/sjitms/smartSchedulingApi';
import VehicleInputModal from '@/pages/SJTms/SmartScheduling/VehicleInputModal';
import FullScreenLoading from '@/components/FullScreenLoading';
import { myColors } from '@/pages/SJTms/SmartScheduling/colors';
import { convertCodeName } from '@/utils/utils';
import { GetConfig } from '@/services/sjitms/OrderBill';
import {
  checkRange,
  formatSeconds,
  getArrivalType,
  getLineName,
  getMarkerText,
  getRecommendByOrders,
  getVehiclesParam,
  groupByOrder,
  LinkBtn,
  mapStyleMap,
  Tips
} from '@/pages/SJTms/SmartScheduling/common';
import { save } from '@/services/sjitms/ScheduleBill';
import EmpAndVehicleModal from '@/pages/SJTms/SmartScheduling/EmpAndVehicleModal';
import DragDtlCard from '@/pages/SJTms/SmartScheduling/DragDtlCard';
import VanLoader from '@/components/VanLoad';

const { Option } = Select;
const NOT_LINE = -9;        // 未分配线路
const ALL_LINE = -1;        // 所有线路
const RE_LINE = 1;          // 刷新线路点位
const RE_NOT_LINE = 2;     // 刷新未分配线路点位

let colors = [...myColors];

export default class SmartScheduling extends Component {
  RIGHT_DRAWER_WIDTH = 410;            // 右侧侧边栏宽度（智能调度结果抽屉宽度）
  AMap = null;                            // 高德地图对象
  map = null;                             // 高德地图实例
  text = null;                            // 高德地图文本对象
  rectangleTool = null;                   // 高德地图矩形工具(框选选择)
  warehouseMarker = null;                 // 当前仓库高德点
  warehousePoint = '';                  // 当前仓库经纬度
  groupMarkers = [];                     // 分组的高德点位
  unassignedMarkers = [];                // 未分配线路的高德点位
  routingPlans = [];                     // 路线规划数据列表（按index对应groupMarkers）
  mapStyleName = '月光银';                // 地图样式
  orderList = [];                        // 点击智能调度时订单池原数据列表（用来生成排车单时用）
  empTypeMapper = {};                       // 人员类型映射
  dispatchingUri = '/tmscode/dispatch';  // 初始化配送调度uri（会被字典routeJump（路由跳转）的配送调度值覆盖)
  vehiclesAllData = null;                  // 整个车辆池数据列表(一键推荐用)
  resultFunc;                                    // 智能调度结果回调函数（因为假进度条，所以要给个全局的用)
  resultOk;                                      // 智能调度请求OK了没 1:ok了 -1:错误了 其他:还没ok（因为假进度条，所以要给个全局的用)

  vehiclePoolModalRef = createRef();     // 车辆池弹窗ref
  orderPoolModalRef = createRef();       // 订单池弹窗ref
  empAndVehicleModalRef = createRef();   // 选司机和车弹窗ref
  orderDtlRef = createRef();             // 拖动排序明细ref
  configDivRef = createRef();            // 配置信息ref (拿高度)

  state = {
    sx: 0,                                // 有时刷新页面用
    selectOrderList: [],                  // 选中订单池订单
    selectVehicles: [],                   // 选中运力池数据
    showInputVehicleModal: false,         // 显示手动输入车辆弹窗
    showSmartSchedulingModal: true,       // 显示智能调度弹窗
    showMenuModal: false,                 // 显示选订单弹窗
    showVehicleModal: false,              // 显示选车辆弹窗
    showPointModal: null,                 // 显示配送点弹窗(有就是显示[对象,线路几])
    showResultDrawer: false,              // 显示调度结果右侧侧边栏
    showButtonDrawer: true,               // 显示左边按钮侧边栏
    showProgress: -1,                     // 显示生成排车进度条（>=0就是显示)
    fakeProgressBar: 0,                   // 智能调度假进度条（>0就是显示)
    childrenIndex: -1,                    // 显示调度排车子抽屉 这个是它的索引>=0就是显示   -9就是显示未分配线路的索引
    showEmpAndVehicleModal: -1,           // 显示选司机和车弹窗 这个是它的索引>=0就是显示
    showRemoveModal: -1,                  // 显示移除线路弹窗   这个是它的索引>=0就是显示
    scheduleResults: [],                  // 智能调度排车处理后的结果（二重数组内的订单）
    /** @type {ScheduleData[]} */
    scheduleDataList: [],                 // 排车选择数据：如 司机、备注、车辆 用index索引对应scheduleResults  属性包括：vehicleModel、selectVehicle、selectEmployees、note
    unassignedNodes: [],                  // 智能调度未分配节点
    btnLoading: false,                    // 智能调度按钮加载状态
    fullScreenLoading: false,             // 全屏加载中
    isMultiVehicle: false,                // 是否是多载具仓库
    arrivalType: null,                    // 控制订单池是否显示送货类型 str： 单日达、次日达
    fullLoadRate: 100,                    // 设置车辆最大满载率
    routingConfig: {      // 智能调度接口参数配置
      sortRule: 0,        // 排线排序⽅式
      routeOption: 0,     // 算路选项
      isBack: 0,          // 是否算返回仓库 0是  1否
      infiniteVehicle: 1, // 是否无限车辆 0：无限车辆 1：限
    },
    selectMarkers: {      // 批量选择地图上的点,
      tag: NOT_LINE,      // 点在显示状态才允许被选择,-1:全部线路;-9:未分配点;>=0:这条索引的线路
      open: false,
      selectList: [],
    }
  };

  componentDidMount = async () => {
    this.mapStyleName = window.localStorage.getItem('mapStyleName') ?? this.mapStyleName;
    const mapStyle = `amap://styles/${mapStyleMap[this.mapStyleName]}`;
    try { // 加载高德地图
      this.AMap = await AMapLoader.load(AMapDefaultLoaderObj);
      this.map = new this.AMap.Map('smartSchedulingAMap', { ...AMapDefaultConfigObj, mapStyle });
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`);
    }
    this.initConfig();
    this.initAction();
    window.smartSchedulingHandleOrders = this.handleOrders;
  };

  /** 卸载组件前清空产生的window */
  componentWillUnmount () {
    window.smartSchedulingHandleOrders = null;
  }

  /**
   * 初始化配置
   * @author ChenGuangLong
   * @since 2024/11/12 下午3:41
   */
  initConfig = () => {
    // ————————智能调度配置——————
    GetConfig('smartScheduling', loginOrg().uuid).then(res => {
      if (res.data?.[0]) {
        const config = res.data?.[0];
        if (config.arrivalType && config.arrivalType !== '0') {  // ——————是否显示到货类型
          let arrivalType = '显示';
          if (config.arrivalType === '当日达') arrivalType = '次日达';
          if (config.arrivalType === '次日达') arrivalType = '当日达';
          this.state.arrivalType = arrivalType;
        }
        if (checkRange(config.fullLoadRate, 10, 100, '最大满载率')) {  // ——————最大满载率
          this.state.fullLoadRate = Number(config.fullLoadRate);
        }
        if (checkRange(config.sortRule, 0, 1, '排线排序⽅式')) {  // ——————排线排序⽅式
          this.state.routingConfig.sortRule = Number(config.sortRule);
        }
        if (checkRange(config.routeOption, 0, 2, '算路选项')) {  // ——————算路选项
          this.state.routingConfig.routeOption = Number(config.routeOption);
        }
        if (checkRange(config.isBack, 0, 1, '回仓')) {  // ——————回仓
          this.state.routingConfig.isBack = Number(config.isBack);
        }
        if (checkRange(config.infiniteVehicle, 0, 1, '无限车辆')) {  // ——————无限车辆
          this.state.routingConfig.infiniteVehicle = Number(config.infiniteVehicle);
        }
        if (config.colors && config.colors !== '0') {  // ——————配置颜色
          try {
            colors = [...config.colors.split(',').map(x => x.trim()), ...myColors];
          } catch (e) {
            colors = [...myColors];
            message.error('配置颜色配置有问题，请联系管理员检查(不影响正常使用)');
          }
        } else colors = [...myColors];
      }
      this.setState({ showMenuModal: !window.selectOrders });   // 显示选订单弹窗
    }).catch(() => message.error('获取多载具配置失败！'));

    // ————————仓库坐标————————
    queryDict('warehouse').then(res => {    // 获取当前仓库经纬度
      const description = res.data.find(x => x.itemValue === loginOrg().uuid)?.description;
      if (description) {
        this.warehousePoint = description.split(',').reverse().join(',');  // 字典经纬度位置调换位置
        if (this.map) this.map.setCenter(this.warehousePoint.split(','), true);  // 立即过渡到仓库位置视野
      } else message.error('获取当前仓库经纬度失败');
    });
    // ————————多载具————————
    GetConfig('dispatch', loginOrg().uuid).then(res => {
      if (res?.data?.[0]?.multiVehicle) this.setState({ isMultiVehicle: res?.data?.[0]?.multiVehicle === '1' });
      else message.error('获取多载具配置失败');
    }).catch(() => message.error('获取多载具配置失败！'));
    // ————————人员类型映射表————————
    queryDictByCode(['employeeType']).then(res => {
      this.empTypeMapper = res.data.reduce((acc, cur) => {
        acc[cur.itemValue] = cur.itemText;
        return acc;
      }, {});
    }).catch(() => message.error('获取人员类型映射表失败！'));
    // ——————拿到配送调度路由————————
    // 查询字典拿到智能调度路由uri
    queryDictByCode(['routeJump']).then(
      res => res.data?.forEach(item => {item.itemText === '配送调度' && (this.dispatchingUri = item.itemValue);})
    );
  };

  /**
   * 初始化动作
   * @author ChenGuangLong
   * @since 2024/11/28 上午8:43
   */
  initAction = () => {
    // ———————判断是否是从配送调度按钮跳转打开的————————
    if (window.selectOrders) this.handleOrders(window.selectOrders);

    // ————————去白边：没套收藏组件顶部会有白边————————
    window.setTimeout(() => {
      const element = document.querySelector('#smartSchedulingPage');
      if (element) element.parentElement.style.marginTop = '0px';
    }, 100);
  };

  /** 非状态变量改变后可刷新页面 */
  sxYm = () => {
    this.setState({ sx: this.state.sx + 1 });
  };

  /**
   * 处理选择订单池订单
   * @param selectOrders 选择订单池订单
   * @param extState    设置state
   * @author ChenGuangLong
   * @since 2024/11/13 上午9:48
   */
  handleOrders = (selectOrders = this.orderPoolModalRef?.state?.selectOrders, extState = {}) => {
    if (this.state.scheduleResults.length > 0) return message.error('已智能调度，请先清空当前数据后再操作');
    if (!selectOrders?.length) return message.error('请先选择订单');
    this.orderList = [...selectOrders]; // 订单池原数据列表
    // 有些仓是一个运输订单是多个订单，所以需要合并
    let mergeOrders = Object.values(
      selectOrders.reduce((acc, order) => {
        if (!acc[order.deliveryPoint.uuid]) {
          acc[order.deliveryPoint.uuid] = JSON.parse(JSON.stringify(order));
        } else {
          acc[order.deliveryPoint.uuid].weight += order.weight;                       // 重量
          acc[order.deliveryPoint.uuid].volume += order.volume;                       // 体积
          acc[order.deliveryPoint.uuid].cartonCount += order.cartonCount ?? 0;        // 整件数
          acc[order.deliveryPoint.uuid].scatteredCount += order.scatteredCount ?? 0;  // 散件数
          acc[order.deliveryPoint.uuid].containerCount += order.containerCount ?? 0;  // 周转箱
          // 下面多载具
          acc[order.deliveryPoint.uuid].coldContainerCount += order.coldContainerCount ?? 0;       // 冷藏周转筐
          acc[order.deliveryPoint.uuid].freezeContainerCount += order.freezeContainerCount ?? 0;  // 冷冻周转筐
          acc[order.deliveryPoint.uuid].insulatedBagCount += order.insulatedBagCount ?? 0;       // 保温袋
          acc[order.deliveryPoint.uuid].freshContainerCount += order.freshContainerCount ?? 0;  // 鲜食筐
        }
        return acc;
      }, {})
    );
    // 没有经纬度的排除
    if (mergeOrders.some(item => !item.longitude || !item.latitude)) {
      message.warning('已排除没有经纬度的点');
      mergeOrders = mergeOrders.filter(item => item.longitude && item.latitude);
    }
    if (mergeOrders.length < 2) return message.error('请选择至少两个要排车的门店！');
    if (mergeOrders.length > 200) return message.error('最多只能选择200个门店！');

    this.setState({ showMenuModal: false, selectOrderList: mergeOrders, ...extState });
    if (window.selectOrders) window.setTimeout(() => {
      window.selectOrders = undefined;  // 用完即等等清 因为还有个初始化请求没这么快
    }, 3000);
  };

  /**
   * 智能调度 排单排线
   * @author ChenGuangLong
   * @since 2024/11/7 下午5:10
   */
  intelligentScheduling = async () => {
    const { selectOrderList, selectVehicles, routingConfig, fullLoadRate } = this.state;
    // —————————————————————————————————校验数据—————————————————————————————
    if (!this.warehousePoint) return message.error('获取当前仓库经纬度失败，请刷新页面再试试');
    if (selectOrderList.length === 0) return message.error('请选择订单');
    if (selectVehicles.length === 0) return message.error('请选择车辆');
    if (routingConfig.infiniteVehicle === 1) {  // 有限车辆时，订单总体积或重量超出现有车辆的最大限度，无法进行排车!
      const orderTotalWeight = selectOrderList.reduce((a, b) => a + b.weight, 0) / 1000;
      const orderTotalVolume = selectOrderList.reduce((a, b) => a + b.volume, 0);
      const vehicleTotalWeight = selectVehicles.reduce((a, b) => a + b.weight * b.vehicleCount, 0);
      const vehicleTotalVolume = selectVehicles.reduce((a, b) => a + b.volume * b.vehicleCount, 0);
      if (orderTotalWeight > vehicleTotalWeight) return message.error('订单总重量超出现有车辆重量！');
      if (orderTotalVolume > vehicleTotalVolume) return message.error('订单总体积超出现有车辆体积！');
    }
    // 记录车辆列表到本地
    localStorage.setItem(`lastVehicles${loginOrg().uuid}`, JSON.stringify(selectVehicles));
    // ————————————————————————————————组装请求体——————————————————————————————
    // 定义仓库信息
    const depots = [{
      location: this.warehousePoint,
      vehicleGroups: selectVehicles.map(x => ({
        deliveryType: 0,                            // 配送方式，默认值为0（驾车配送）
        // vehicleGroupId: x.vehicleGroup,          // 车辆组ID，非必填
        vehicleModelId: `${x.weight}-${x.volume}`,  // 车辆型号ID，非必填
        vehicleCount: x.vehicleCount,               // 该（型号）车数量，默认值为1
        capacity: {
          weight: x.weight * (fullLoadRate / 100),  // 装载容量，
          volume: x.volume * (fullLoadRate / 100),  // 装载体积，
        }
      })),
    }];
    // 定义配送点信息
    const servicePoints = selectOrderList.map(x => ({
      location: `${x.longitude},${x.latitude}`,                // 配送点坐标
      name: `${x.deliveryPoint.uuid}`,                         // 配送点poi名称
      demand: {
        weight: x.weight / 1000,  // 需求容量
        volume: x.volume,         // 需求体积
      }
    }));
    // 开始组装
    const requestBody = {
      ...routingConfig,
      depots,
      servicePoints,
      deliveryCapacity: 0,  // 0：机动⻋  1：⾮机动⻋
    };

    this.showFakeProgressBar();  // 显示假的进度条
    this.setState({ btnLoading: true/* , fullScreenLoading: true */ });
    const result = await getSmartScheduling(requestBody);
    this.setState({ btnLoading: false/* , fullScreenLoading: false */ });

    if (result.errmsg !== 'OK' || !result.data) {
      this.resultOk = -1;
      return message.error(`${result.errmsg}:${result.errdetail}`);
    }

    this.resultFunc = () => {   // 智能调度结果处理，为了假进度条，不然就直接写不用方法了
      const { routes, unassignedNodes } = result.data[0];
      // 订单分组提取，ps：参数是回仓的话 最后一点会有仓库endName: "仓1"  这里直接找不到是undefined 过滤掉
      const groupOrders = routes.map(route => route.queue.map(r => selectOrderList.find(order => order.deliveryPoint.uuid === r.endName)).filter(x => x));
      // 没分配的订单提取（列表只返回了经纬度字符串，所以只能按经纬度提取）{不一定会返回，没返回就默认给个[]
      const notGroupOrders = unassignedNodes?.map(nodeStr => selectOrderList.find(order => `${order.longitude},${order.latitude}` === nodeStr)) ?? [];

      this.setState({
        showSmartSchedulingModal: false,
        showButtonDrawer: false,
        showResultDrawer: true,
        scheduleResults: groupOrders,
        scheduleDataList: routes.map(x => ({ vehicleModel: x.vehicleModelId })),
        unassignedNodes: notGroupOrders,
        fakeProgressBar: 0, // 假进度条隐藏
      });
      this.routingPlans = routes.map(() => null);
      this.loadingPoint(groupOrders, notGroupOrders);
    };
    this.resultOk = 1;
  };

  /**
   * 智能调度显示假的进度条
   * @author ChenGuangLong
   * @since 2024/12/10 下午3:48
   */
  showFakeProgressBar = () => {
    const { selectOrderList } = this.state;
    const countMS = selectOrderList.length * 3 * 10;   // 订单数量 * 3 * 10 == 模拟进度条毫秒数
    let i = 0;
    const timer = setInterval(() => {
      let millisecond = 200;
      if (i > countMS * 0.8 && this.resultOk !== 1) millisecond = 100;  // 模拟进度条到了80% 就慢慢来
      if (this.resultOk === 1) millisecond *= 3;                        // 实际请求成功了就加速
      if (this.resultOk === -1) {                                       // 失败了就停止
        this.setState({ fakeProgressBar: 0 });
        this.resultOk = undefined;
        clearInterval(timer);
      } else {              // 继续增加进度条
        i += millisecond;
        if (i >= countMS) {
          if (this.resultOk === 1) {
            this.resultOk = undefined;
            clearInterval(timer);
            this.setState({ fakeProgressBar: 666 });
            if (this.resultFunc) {
              this.resultFunc();
              this.resultFunc = undefined;
            }
          } else this.setState({ fakeProgressBar: 99 });
        } else this.setState({ fakeProgressBar: Math.floor(((i / countMS) * 100)) });
      }
    }, 200);
  };

  /**
   * 加载地图点位
   * @param groupOrders 分组订单
   * @param unassigneds 未分组订单
   * @param [refresh]{1|2} 刷新:没参数全部，1：分组刷新，2：未分组刷新
   * @author ChenGuangLong
   * @since 2024/11/8 上午10:59
   */
  loadingPoint = (groupOrders = this.state.scheduleResults, unassigneds = this.state.unassignedNodes ?? [], refresh) => {
    const { map, AMap, warehouseMarker, warehousePoint } = this;
    const { isMultiVehicle, scheduleDataList } = this.state;
    // ————————————仓库点————————————
    if (!warehouseMarker) {
      this.warehouseMarker = new AMap.Marker({
        position: warehousePoint.split(','),      // 设置Marker的位置
        anchor: 'center',              // 设置Marker的锚点
        content: `<div class="${styles.point}" style="border: white solid 2px;">仓</div>`
      });
      map.add(this.warehouseMarker);
    }

    // ——————文本框就创建一次 循环利用——————
    this.text = this.text ?? new AMap.Text({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -11),             // 设置文本标注偏移量 因为坐标偏移一半 所以是大小的一半+1
    });

    // ——————————————清空上次数据————————————
    if (refresh) {
      if (refresh === 1) {
        map.remove(this.groupMarkers.flat());
        this.groupMarkers = [];
      }
      if (refresh === 2) {
        map.remove(this.unassignedMarkers);
        this.unassignedMarkers = [];
      }
    } else {
      map.remove([...this.groupMarkers.flat(), ...this.unassignedMarkers]);
      this.groupMarkers = [];
      this.unassignedMarkers = [];
    }

    // ————————————分组点位————————————
    ((refresh ?? 1) === 1) && groupOrders.forEach((orders, index) => {  // 每个组循环
      const markers = orders.map((order, i) => {            // 组内循环
        const { longitude, latitude } = order;
        const marker = new AMap.Marker({
          position: [longitude, latitude],      // 设置Marker的位置
          anchor: 'center',                     // 设置Marker的锚点
          content: `<div style="background: ${colors[index]}" class="${styles.point}">${i + 1}</div>`,
          visible: !scheduleDataList[index].unseen,
        });
        marker.on('mouseover', () => {                                        // 鼠标移入
          // 创建一个 DOM 容器，将 React 组件渲染到该容器中
          this.text.setPosition(marker.getPosition());                               // 改变经纬度
          this.text.setText(getMarkerText(order, isMultiVehicle));  // 设置文本标注内容
          map.add(this.text);
        });
        marker.on('mouseout', () => {                                         // 鼠标移出
          this.text && map.remove(this.text);
        });
        marker.on('click', () => {
          this.setState({ showPointModal: [order, index] });
        });
        return marker;
      });
      map.add(markers);
      this.groupMarkers[index] = markers;
    });
    // ————————————没分组点位————————————
    if (unassigneds.length === 0 || (refresh ?? 2) !== 2) return;
    this.unassignedMarkers = unassigneds.map(order => {
      const { longitude, latitude } = order;
      // 创建一个 DOM 容器，将 React 组件渲染到该容器中
      const contentDiv = document.createElement('div');
      ReactDOM.render(
        <Icon type="warning" theme="twoTone" style={{ fontSize: 25 }} twoToneColor="#eb2f96"/>,
        contentDiv
      );
      const marker = new AMap.Marker({
        position: [longitude, latitude],      // 设置Marker的位置
        anchor: 'center',                     // 设置Marker的锚点
        content: contentDiv
      });
      marker.on('mouseover', () => {                                        // 鼠标移入
        // 创建一个 DOM 容器，将 React 组件渲染到该容器中
        this.text.setPosition(marker.getPosition());                               // 改变经纬度
        this.text.setText(getMarkerText(order, isMultiVehicle));  // 设置文本标注内容
        map.add(this.text);
      });
      marker.on('mouseout', () => {                                         // 鼠标移出
        this.text && map.remove(this.text);
      });
      marker.on('click', () => {
        this.setState({ showPointModal: [order, -1] });
      });
      return marker;
    });
    map.add(this.unassignedMarkers);

  };

  /**
   * 路线规划
   * @param index {number}      线路索引
   * @param [isRefresh]:boolean 是否刷新
   * @author ChenGuangLong
   * @since 2024/11/9 下午2:57
   */
  routePlanning = (index, isRefresh) => {
    let { scheduleDataList, routingConfig } = this.state;
    // 无论有无，都空空如也
    scheduleDataList[index].routeDistance = [];
    scheduleDataList[index].routeTime = [];
    scheduleDataList[index].routeTolls = [];

    // 如果有要刷新的线路
    if (isRefresh) {
      this.map.remove(this.routingPlans[index]);
      this.routingPlans[index] = undefined;
    }

    // 如果有线路的了，就是删除
    if (this.routingPlans[index]?.length > 0) {
      this.map.remove(this.routingPlans[index]);
      this.routingPlans[index] = undefined;
      scheduleDataList[index].routeDistance = null;
      // return this.sxYm()
      return this.setState({ scheduleDataList: [...scheduleDataList] });
    }

    // 没有线路，开始创建线路
    const { map, AMap, warehouseMarker } = this;
    // 构造路线导航类
    const driving = new AMap.Driving({
      hideMarkers: true,
      ferry: 1,
      showTraffic: false,
      autoFitView: false,
      outlineColor: colors[index],
    });
    this.routingPlans[index] = [];                                                        // 初始化路线数组
    // 因为路线规划一次就最多16个 还要拆分多次调用
    const aLine = [warehouseMarker, ...this.groupMarkers[index] || []];  // 添加起始点和终点 才是一个完整的路径
    if (routingConfig.isBack === 0) aLine.push(warehouseMarker);               // 配置回仓 终点就是仓库

    const arr16 = [];                                                                     // 拆分后的数组
    for (let i = 0; i < aLine.length; i += (16 - 1)) {                                  // 步进值确保每组之间有一个重叠元素
      arr16.push(aLine.slice(i, i + 16));
    }
    const isLoad = Array(arr16.length).fill(true);   // 多次规划路线是否加载全部完毕|标记
    // 每16个点做一次规划
    arr16.forEach((line, i) => {
      const waypoints = line.slice(1, line.length - 1).map(x => x.getPosition());   // 全部途经点
      // 根据起终点经纬度规划驾车导航路线
      driving.search(line[0].getPosition(), line[line.length - 1].getPosition(), { waypoints },
        (status, result) => {
          if (status === 'complete') {
            this.setState({ fullScreenLoading: true });
            const path = [];  // 路径经纬度数组初始化
            // 从响应里面拿到所有的点位
            result.routes[0].steps.forEach(step => step.path.forEach(x => path.push([x.lng, x.lat])));
            // 创建折线图
            const Polyline = new AMap.Polyline({
              path,                           // 设置线覆盖物路径
              showDir: true,
              strokeWeight: 6,                // 线宽
              strokeOpacity: 0.8,             // 线透明度(默认0.5
              strokeColor: colors[index],     // 线颜色
            });
            this.routingPlans[index].push(Polyline);
            map.add(Polyline);
            isLoad[i] = false;
            scheduleDataList[index].routeDistance[i] = result.routes[0].distance;
            scheduleDataList[index].routeTime[i] = result.routes[0].time;
            scheduleDataList[index].routeTolls[i] = result.routes[0].tolls;
            this.setState({ fullScreenLoading: isLoad.some(x => x), scheduleDataList });
            // this.sxYm()
          } else message.error('获取驾车数据失败');
        });
    });
  };

  /**
   * 重置数据
   * @author ChenGuangLong
   * @since 2024/11/12 上午9:49
   */
  resetData = (expStateData = {}) => {
    if (this.state.selectMarkers.open) {  // 现在是打开的 那么执行关闭
      this.map.setDefaultCursor('default');
      this.rectangleTool?.close(true);   // 关闭，并清除覆盖物(不清除（false）也没关系
    }
    message.info('重置中，请稍等...');
    // 清空地图覆盖物
    this.map.clearMap();
    this.routingPlans = [];
    this.groupMarkers = [];
    this.warehouseMarker = undefined;
    // 清空数据
    this.setState({
      showProgress: -1,
      ...expStateData,
      scheduleResults: [],
      scheduleDataList: [],
      selectOrderList: [],
      selectVehicles: [],
      unassignedNodes: [],
      showButtonDrawer: true,
      showResultDrawer: false,
      selectMarkers: { tag: -9, open: false, selectList: [] }
    }, message.destroy);
  };

  /**
   * 生成排车单（批量）
   * @author ChenGuangLong
   * @since 2024/11/12 上午9:47
   */
  createSchedules = async () => {
    const { orderList } = this;
    const { scheduleResults, scheduleDataList } = this.state;
    let errFlag = false;   // 错误标志,forEach的return只能结束内部方法，不能结束外层循环，外层继续循环继续提示报错，到生成排车单前用标记看看生不生成
    const scheduleParamBodyList = [];  // 准备排车单创建列表
    scheduleResults.forEach((link, index) => {
      const linkOrders = [];   // 一条路线的全部单（排车单全部明细：一个门店可能有多张单)
      let deliveryNumber = 1;
      link.forEach(order => {   // 每个门店的全部单都找出来
        let store = orderList.filter(x => x.deliveryPoint.uuid === order.deliveryPoint.uuid);
        store = store.map(item => ({ ...item, deliveryNumber: deliveryNumber++ }));  // 好像不用deliveryNumber，就是按顺序分deliveryNumber的
        linkOrders.push(...store);
      });
      // 禁止整车为转运单 针对福建仓
      if (linkOrders.length > 0 && linkOrders.filter(e => e.orderType === 'Transshipment').length === linkOrders.length) {
        errFlag = true;
        return message.error(`线路${index + 1}:禁止整车为转运单排车！`);
      }
      // ——————————开始构建参数——————————
      const orderType = uniqBy(linkOrders.map(x => x.orderType)).shift(); // 从去重并返回第一个订单类型。
      const orderTypeArr = ['Delivery', 'DeliveryAgain', 'Transshipment', 'OnlyBill'];
      const type = orderTypeArr.includes(orderType) ? 'Job' : 'Task';   // 排车单类型
      // 选的车
      const selectVehicle = scheduleDataList[index].selectVehicle ?? {};
      // 选择的人员
      const selectEmployees = scheduleDataList[index].selectEmployees ?? [];
      const driver = selectEmployees.find(x => x.memberType === 'Driver');
      // 订单明细
      const details = linkOrders.map(item => {
        if (!item.isSplit) item.isSplit = item.cartonCount === item.stillCartonCount ? 0 : 1;
        item.cartonCount = item.stillCartonCount;
        item.scatteredCount = item.stillScatteredCount;
        item.containerCount = item.stillContainerCount;
        item.coldContainerCount = item.stillColdContainerCount;
        item.freezeContainerCount = item.stillFreezeContainerCount;
        item.insulatedBagCount = item.stillInsulatedBagCount;
        item.insulatedContainerCount = item.stillInsulatedContainerCount;
        item.freshContainerCount = item.stillFreshContainerCount;

        if (item.reviewed) {
          item.realCartonCount = item.stillCartonCount;
          item.realScatteredCount = item.stillScatteredCount;
          item.realContainerCount = item.stillContainerCount;

          item.realColdContainerCount = item.stillColdContainerCount;
          item.realFreezeContainerCount = item.stillFreezeContainerCount;
          item.realInsulatedBagCount = item.stillInsulatedBagCount;
          item.realInsulatedContainerCount = item.stillInsulatedContainerCount;
          item.realFreshContainerCount = item.stillFreshContainerCount;
        }
        return {
          ...item,
          orderUuid: item.orderUuid || item.uuid,
          orderNumber: item.orderNumber || item.billNumber,
        };
      });
      // 主表汇总数据
      const orderSummary = groupByOrder(details);
      // 司机数据
      const carrier = driver
        ? {
          uuid: driver.UUID,
          code: driver.CODE,
          name: driver.NAME,
        }
        : {};
      // 请求体
      scheduleParamBodyList.push({
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
        memberDetails: selectEmployees.map((x, i) => ({
          line: i + 1,
          member: { uuid: x.UUID, code: x.CODE, name: x.NAME },
          memberType: x.memberType,
        })),
        ...orderSummary,
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        note: scheduleDataList[index].note || '',
      });
    });

    if (errFlag) return;
    if (scheduleParamBodyList.length !== scheduleResults.length) return message.error('线路数和生成数不相等!');
    scheduleDataList.forEach(x => x.errMsg = undefined);  // 清空错误信息(防止上次有，处理重新生成情况)
    // ——————————开始请求创建排车单——————————
    for (const paramBody of scheduleParamBodyList) {  // 循环创建，用forEach会异步循环，导致进度条无法正常显示
      const index = scheduleParamBodyList.indexOf(paramBody);
      if (!scheduleDataList[index].ok) {  // 没创建过或没成功的,创建排车单
        const linkName = `线路${index + 1}`;
        const res = await save(paramBody);
        scheduleDataList[index].ok = Boolean(res.success);
        if (res.success) message.success(`${linkName}创建成功`);
        else {
          message.error(`${linkName}创建失败`);
          scheduleDataList[index].errMsg = `${linkName}:${res.message}`;
        }
      }
      this.setState({ showProgress: parseFloat(((index + 1) / scheduleParamBodyList.length * 100).toFixed(1)) });
    }
    // ——————创建结束后——————
    this.orderPoolModalRef?.refreshOrderPool?.();      // 刷新订单池
    this.vehiclePoolModalRef?.refreshVehiclePool?.();  // 刷新车辆池
  };

  /**
   * 获取颜色块
   * @param index {number} 颜色索引
   * @param [px] {number}  颜色块大小，默认为14px
   * @author ChenGuangLong
   * @since 2024/11/19 下午3:33
   */
  getColorBlocks = (index, px = 14) =>
    <div className={styles.LinkColor} style={{ background: colors[index], width: px, height: px }}/>;

  /**
   * 获取是否创建成功图标
   * @author ChenGuangLong
   * @since 2024/11/27 上午11:30
   */
  getCreateIcon = index => {
    const ok = this.state.scheduleDataList[index].ok;
    if (typeof ok === 'undefined') return <></>;
    return ok ?
      <span className={styles.successTag}><Icon type="check" style={{ color: '#4caf50' }}/> 创建成功</span>
      :
      <span>
        <Popover content={this.state.scheduleDataList[index].errMsg?.split(':')[1] ?? '无错误信息'}>
          <span className={styles.failTag}><Icon type="close" style={{ color: '#f44336' }}/> 创建失败</span>
        </Popover>
      </span>;
  };

  /**
   * 获取对应索引的车辆信息
   * @param dataName{'车牌号'|'载重'|'体积'|'载重率'|'体积率'} 要获取的数据名称
   * @param index 车辆索引
   * @author ChenGuangLong
   * @since 2024/11/19 下午4:35
   */
  getVehicleInfo = (dataName, index) => {
    const vehicleObj = this.state.scheduleDataList[index].selectVehicle;
    const action = {
      '载重': () => Number(vehicleObj.BEARWEIGHT),
      '体积': () => Math.round(vehicleObj?.BEARVOLUME * vehicleObj?.BEARVOLUMERATE) / 100,
      '车牌号': () => vehicleObj.PLATENUMBER,
      '载重率': () => {
        const orders = this.state.scheduleResults[index];
        const productWeight = Math.round(orders.reduce((acc, cur) => acc + cur.weight, 0)) / 1000;
        const vehicleWeight = Number(vehicleObj.BEARWEIGHT);
        return Number(`${((productWeight / vehicleWeight) * 100).toFixed(2)}`);
      },
      '体积率': () => {
        const orders = this.state.scheduleResults[index];
        const productVolume = orders.reduce((acc, cur) => acc + cur.volume, 0);
        const vehicleVolume = Math.round(vehicleObj.BEARVOLUME * vehicleObj.BEARVOLUMERATE) / 100;
        return Number(`${((productVolume / vehicleVolume) * 100).toFixed(2)}`);
      }
    };
    return action[dataName] ? action[dataName]() : '';
  };

  /**
   * 删除点位
   * @author ChenGuangLong
   * @since 2024/11/21 下午2:52
   */
  removePoint = (order, linkIndex) => {
    const { scheduleResults, unassignedNodes, scheduleDataList } = this.state;
    if (linkIndex >= 0) {   // 线路内配送点
      const link = scheduleResults[linkIndex];
      scheduleResults[linkIndex] = link.filter(x => x.uuid !== order.uuid);
      this.loadingPoint(scheduleResults, [], RE_LINE);     // 点位更新
      scheduleDataList[linkIndex].vehicleModel = null;    // 定位改变高德推荐就没用了
      this.setState({ scheduleResults, showPointModal: null, scheduleDataList });
      // 线路更新： 里程 时间 过路费 更新
      if (this.routingPlans[linkIndex]?.length > 0) {
        this.routePlanning(linkIndex, true);
      }
    } else {              // 未分配线路配送点
      const newUnassignedNodes = unassignedNodes.filter(x => x.uuid !== order.uuid);
      this.loadingPoint([], newUnassignedNodes, RE_NOT_LINE);  // 点位更新
      this.setState({ unassignedNodes: newUnassignedNodes, showPointModal: null });
    }
  };

  /**
   * 切换线路
   * @author ChenGuangLong
   * @since 2024/11/22 上午9:17
   */
  switchingLine = (newLinkIndex) => {
    const [order, oldLink] = this.state.showPointModal;
    let { scheduleResults, unassignedNodes, scheduleDataList } = this.state;
    // ——————取消推荐———————
    if (oldLink >= 0) scheduleDataList[oldLink].vehicleModel = null;              // 定位改变高德推荐就没用了
    if (newLinkIndex >= 0) scheduleDataList[newLinkIndex].vehicleModel = null;    // 定位改变高德推荐就没用了
    // ——————隐藏显示———————
    if (scheduleDataList[oldLink]?.unseen) scheduleDataList[oldLink].unseen = false;
    if (scheduleDataList[newLinkIndex]?.unseen) scheduleDataList[newLinkIndex].unseen = false;
    // ————————切换————————
    if (oldLink >= 0) {
      scheduleResults[oldLink] = scheduleResults[oldLink].filter(x => x.uuid !== order.uuid);
      if (newLinkIndex >= 0) scheduleResults[newLinkIndex].push(order);
      else unassignedNodes.push(order);
    } else {
      unassignedNodes = unassignedNodes.filter(x => x.uuid !== order.uuid);
      scheduleResults[newLinkIndex].push(order);
    }
    this.setState({ showPointModal: null, scheduleDataList });
    this.loadingPoint(scheduleResults, unassignedNodes);
    this.setState({ scheduleResults: [...scheduleResults], unassignedNodes: [...unassignedNodes] }, () => {
      // 旧线路更新： 里程 时间 过路费 更新
      if (this.routingPlans[oldLink]?.length > 0) this.routePlanning(oldLink, true);
      // 新线路更新： 里程 时间 过路费 更新
      if (this.routingPlans[newLinkIndex]?.length > 0) this.routePlanning(newLinkIndex, true);
    });
  };

  /**
   * 删除线路
   * @param linkIndex {number} 要删除的线路索引
   * @param [isDissolution] {boolean} 是否是解散 解散就放未分配列表 否则就直接没了
   * @author ChenGuangLong
   * @since 2024/11/22 下午4:22
   */
  removeLine = (linkIndex = this.state.showRemoveModal, isDissolution) => {
    const { scheduleResults, scheduleDataList } = this.state;
    if (isDissolution) {  // 解散 放配送点到未分配列表
      const { unassignedNodes } = this.state;
      const newUnassignedNodes = unassignedNodes.concat(scheduleResults[linkIndex]);
      this.loadingPoint([], newUnassignedNodes, RE_NOT_LINE);  // 点位更新
      this.setState({ unassignedNodes: [...newUnassignedNodes] });
    }
    // 去掉路线规划
    if (this.routingPlans[linkIndex]?.length > 0) this.map.remove(this.routingPlans[linkIndex].flat());

    // 对应的线路和数据删除
    const newScheduleResults = scheduleResults.filter((__, index) => index !== linkIndex);
    const newScheduleDataList = scheduleDataList.filter((__, index) => index !== linkIndex);
    this.routingPlans = this.routingPlans.filter((__, index) => index !== linkIndex);
    // 更新折线图（路线颜色）
    this.routingPlans.forEach((item, index) => {
      item?.map(line => line.setOptions({ strokeColor: colors[index] }));
    });
    this.loadingPoint(newScheduleResults, [], RE_LINE); // 点位更新
    this.setState({
      showRemoveModal: -1,
      scheduleResults: [...newScheduleResults],
      scheduleDataList: [...newScheduleDataList],
    });
  };

  /**
   * 拖动中的逻辑
   * @param originallyIndex {number} 拖动的本来的索引
   * @param hoverIndex {number}      拖动后放置的索引
   * @author ChenGuangLong
   * @since 2024/11/25 下午3:12
   */
  moveCard = (originallyIndex, hoverIndex) => {
    this.orderDtlRef.current.childNodes.forEach(child => child.removeAttribute('class'));
    if (originallyIndex === hoverIndex) return;
    if (originallyIndex > hoverIndex) this.orderDtlRef.current.childNodes[hoverIndex].className = styles.dragIngUp;
    else this.orderDtlRef.current.childNodes[hoverIndex].className = styles.dragIngDown;
  };

  /**
   * 拖动结束的函数
   * @param originallyIndex {number} 拖动的本来的索引
   * @param hoverIndex {number}      拖动后放置的索引
   * @author ChenGuangLong
   * @since 2024/11/25 下午3:36
   */
  onDragEnd = (originallyIndex, hoverIndex) => {
    this.orderDtlRef.current.childNodes.forEach(child => child.removeAttribute('class'));
    this.orderDtlRef.current.childNodes.forEach(child => child.removeAttribute('style'));

    const { scheduleResults, scheduleDataList, childrenIndex } = this.state;
    // 拖动后更新地图点位序号和路线规划
    if (originallyIndex !== hoverIndex) {
      // ——————显示隐藏——————
      if (scheduleDataList[childrenIndex]?.unseen) scheduleDataList[childrenIndex].unseen = false;
      // ——————改变位置——————
      const updatedOrders = [...scheduleResults[childrenIndex]];
      const [draggedItem] = updatedOrders.splice(originallyIndex, 1);   // 从列表删除被拖动的元素，并拿到
      updatedOrders.splice(hoverIndex, 0, draggedItem);           // 将被拖动的元素插入到目标位置
      scheduleResults[childrenIndex] = updatedOrders;
      this.setState({ scheduleResults: [...scheduleResults] });

      // 更新点位序号
      this.loadingPoint(undefined, [], RE_LINE);
      // 如果有显示了路线规划，就重新规划
      if (this.routingPlans[childrenIndex]?.length > 0) this.routePlanning(childrenIndex, true);
    }
  };

  /**
   * 一键推荐人和车
   * @author ChenGuangLong
   * @since 2024/11/30 上午8:41
   */
  recommendPeopleAndVehicle = async () => {
    // 获取车辆数据
    if (!this.vehiclesAllData) {
      const reps = await dynamicQuery(getVehiclesParam());
      if (reps.success && reps.result.records !== 'false') this.vehiclesAllData = reps.result.records;
      else return message.error('车辆数据获取失败');
    }
    // 显示进度条
    this.setState({ showProgress: 0 });

    const { scheduleResults, scheduleDataList } = this.state;
    // 开始遍历推荐
    for (let i = 0; i < scheduleResults.length; i++) {
      // 进度条（放前面是因为用了continue）
      i !== 0 && this.setState({ showProgress: Number((i / scheduleResults.length * 100).toFixed(2)) });
      if (scheduleResults[i].length === 0) {
        message.info(`线路${i + 1}:无配送点 跳过`);
        continue;
      }
      if (scheduleDataList[i].selectEmployees?.length > 0 || scheduleDataList[i].selectVehicle) {
        message.info(`线路${i + 1}:已选 跳过`);
        continue;
      }
      const vehicles = await getRecommendByOrders(scheduleResults[i], this.vehiclesAllData);
      const productWeight = Math.round(scheduleResults[i].reduce((acc, cur) => acc + cur.weight, 0)) / 1000; // 配送点重量
      const productVolume = scheduleResults[i].reduce((acc, cur) => acc + cur.volume, 0);  // 配送点体积
      const vehicleWeight = x => Number(x.BEARWEIGHT);  // 车辆载重
      const vehicleVolume = x => Math.round(x?.BEARVOLUME * x?.BEARVOLUMERATE) / 100; // 车辆容积
      const canInstall = x => vehicleWeight(x) >= productWeight && vehicleVolume(x) >= productVolume; // 能装？
      const vehicle = vehicles.filter(x => x.JOBSTATE === 'Used' && canInstall(x))[0];
      if (!vehicle || vehicle.pro === 0) {
        message.info(`线路${i + 1}:无推荐车辆`);
        continue;
      }
      scheduleDataList[i].selectVehicle = vehicle;
      // ————————开始获取推荐员工————————
      const param = {
        tableName: 'v_sj_itms_vehicle_employee_z',
        condition: { params: [{ field: 'VEHICLEUUID', rule: 'eq', val: [vehicle.UUID] }] }
      };
      const resp = await dynamicQuery(param);
      if (resp.success && resp.result.records !== 'false') {
        scheduleDataList[i].selectEmployees = uniqBy(resp.result.records, 'CODE').map(item => ({
          ...item,
          memberType: item.ROLE_TYPE,
        }));
      } else {
        message.info(`线路${i + 1}:车辆推荐成功,无员工推荐`);
        continue;
      }
      message.success(`线路${i + 1}:推荐成功`);
    }
    // 显示进度条
    this.setState({ showProgress: 101 }); // 不写100是因为复用保存排车单的,写100会显示按钮，
    this.setState({ showProgress: -1 });
  };

  /**
   * 批量选择地图上的点    点在显示状态才允许被选择  -1 全部线路 -9 未分配点 >=0 这条索引的线路
   * @author ChenGuangLong
   * @since 2024/12/20 上午10:59
   */
  batchSelect = () => {
    if (!this.rectangleTool) {  // 第一次先创建
      this.rectangleTool = new this.AMap.MouseTool(this.map);
      this.rectangleTool.on('draw', (e) => {
        const { selectMarkers, scheduleResults, scheduleDataList, unassignedNodes } = this.state;    // 必须放里面（放外面导致严重的教训bug)
        const southWest = e.obj.getOptions().bounds.getSouthWest();  // 西南角坐标
        const northEast = e.obj.getOptions().bounds.getNorthEast();  // 东北角坐标
        const rectanglePath = [       // 矩形路径
          [southWest.lng, northEast.lat],   // 矩形左上角坐标(西北角)
          [northEast.lng, northEast.lat],   // 矩形右上角坐标(东北角)
          [northEast.lng, southWest.lat],   // 矩形右下角坐标(东南角)
          [southWest.lng, southWest.lat],   // 矩形左下角坐标(西南角)
        ];
        const orders = [];  // 矩形内的订单 格式：[{-9:[order1、2、3]}，{1:[order1、2、3]}]
        // ————————————————————————无线————————————————————————————————
        if (selectMarkers.tag === NOT_LINE) {
          const selectList = [];
          unassignedNodes.forEach(order => {
            const pt = { lng: order.longitude, lat: order.latitude };
            const isSelect = this.AMap.GeometryUtil.isPointInRing(pt, rectanglePath); // 判断点是否在矩形内
            if (isSelect) selectList.push(order);
          });
          if (selectList.length > 0) {
            orders.push({ [NOT_LINE]: selectList });
            this.setState({ selectMarkers: { ...selectMarkers, selectList: orders } });
          } else message.info('无选中点');
        }
        // ——————————————————————————全线——————————————————————————————
        if (selectMarkers.tag === ALL_LINE) {
          scheduleResults.forEach((orderList, index) => {
            const selectList = [];
            !scheduleDataList[index].unseen && orderList.forEach(order => {
              const pt = { lng: order.longitude, lat: order.latitude };
              const isSelect = this.AMap.GeometryUtil.isPointInRing(pt, rectanglePath); // 判断点是否在矩形内
              if (isSelect) selectList.push(order);
            });
            if (selectList.length > 0) orders.push({ [index]: selectList });
          });
          if (orders.length > 0) this.setState({ selectMarkers: { ...selectMarkers, selectList: orders } });
          else message.info('无选中点');
        }
        // ———————————————————————————一线—————————————————————————————
        if (selectMarkers.tag > -1) {
          if (scheduleDataList[selectMarkers.tag].unseen) return message.info('该线路已隐藏');
          const selectList = [];
          scheduleResults[selectMarkers.tag].forEach(order => {
            const pt = { lng: order.longitude, lat: order.latitude };
            const isSelect = this.AMap.GeometryUtil.isPointInRing(pt, rectanglePath); // 判断点是否在矩形内
            if (isSelect) selectList.push(order);
          });
          if (selectList.length > 0) {
            orders.push({ [selectMarkers.tag]: selectList });
            this.setState({ selectMarkers: { ...selectMarkers, selectList: orders } });
          } else message.info('无选中点');
        }

        this.map.remove(e.obj); // 清除矩形
      });
    }

    if (this.state.selectMarkers.open) {  // 现在是打开的 那么执行关闭
      this.map.setDefaultCursor('default');
      this.state.selectMarkers.open = false;
      this.rectangleTool.close(true);   // 关闭，并清除覆盖物(不清除（false）也没关系
    } else {     // 现在是关闭的 那么执行打开
      this.map.setDefaultCursor('crosshair');
      this.rectangleTool.rectangle({  // 同Polygon的Option设置
        fillColor: '#beffd7',
        strokeColor: '#f1b786'
      });
      this.state.selectMarkers.open = true;
    }
    this.sxYm();
  };

  /**
   * 批量选择处理
   * @param action{'解散'|'移除'|'转移'} 操作动作
   * @param [toLine] {number}         转移到的线路
   * @author ChenGuangLong
   * @since 2024/12/23 下午2:23
   */
  batchSelectHandle = (action, toLine) => {
    let { selectMarkers, scheduleResults, unassignedNodes } = this.state;
    const lines = []; // 记录被处理的路线 一会用来处理线路规划
    selectMarkers.selectList.forEach(item => {
      const line = Number(Object.keys(item)[0]);
      lines.push(line);
      const orders = Object.values(item)[0];
      const ordersUuid = orders.map(order => order.uuid);
      switch (action) {
        case '解散':
          scheduleResults[line] = scheduleResults[line].filter(order => !ordersUuid.includes(order.uuid));
          unassignedNodes = [...unassignedNodes, ...orders];
          break;
        case '转移':
          if (line > -1) {
            if (line !== toLine) { // 本身不用处理
              const schedule = [...scheduleResults[line]];   // 抽出来是因为下面一起用两个相反的过滤会导致后面的过滤拿不到数据
              scheduleResults[line] = schedule.filter(order => !ordersUuid.includes(order.uuid));
              scheduleResults[toLine] = [...scheduleResults[toLine], ...schedule.filter(order => ordersUuid.includes(order.uuid))];
            }
          } else {
            const unNodes = [...unassignedNodes];
            unassignedNodes = unNodes.filter(order => !ordersUuid.includes(order.uuid));
            scheduleResults[toLine] = [...scheduleResults[toLine], ...unNodes.filter(order => ordersUuid.includes(order.uuid))];
          }
          break;
        default:  // 移除
          if (line > -1) scheduleResults[line] = scheduleResults[line].filter(order => !ordersUuid.includes(order.uuid));
          else unassignedNodes = unassignedNodes.filter(order => !ordersUuid.includes(order.uuid));
          break;
      }
    });
    this.loadingPoint(scheduleResults, unassignedNodes,);
    this.setState({
      scheduleResults,
      unassignedNodes,
      selectMarkers: { ...selectMarkers, selectList: [] },
    }, () => {
      lines.forEach(line => {
        if (this.routingPlans[line]?.length > 0) this.routePlanning(line, true);
      });
      if (toLine && !lines.includes(toLine) && this.routingPlans[toLine]?.length > 0) {
        this.routePlanning(toLine, true);
      }
    });
  };

  /**
   * 合并车型 载重和体积相同的车型可以合并方便查看
   * @author ChenGuangLong
   * @since 2024/12/25 下午2:46
  */
  mergeVehicles = () => {
    const { selectVehicles } = this.state;
    const newSelectVehicles = [];
    selectVehicles.forEach(item => {
      const newVehicleModelList = newSelectVehicles.map(x => `${x.volume}+${x.weight}`);
      if (newVehicleModelList.includes(`${item.volume}+${item.weight}`)) {
        newSelectVehicles.find(x => `${x.volume}+${x.weight}` === `${item.volume}+${item.weight}`).vehicleCount += item.vehicleCount;
      } else newSelectVehicles.push(item);
    });

    if (newSelectVehicles < selectVehicles) {
      message.success('合并车型成功');
      this.setState({ selectVehicles: newSelectVehicles });
    } else message.info('没有可合并');
  };

  render () {
    const {
      showSmartSchedulingModal,
      showMenuModal,
      showVehicleModal,
      showEmpAndVehicleModal,
      showResultDrawer,
      showButtonDrawer,
      showRemoveModal,
      btnLoading,
      showPointModal,
      routingConfig,
      scheduleResults = [],
      scheduleDataList = [],
      unassignedNodes = [],
      selectOrderList = [],
      selectVehicles = [],
      showInputVehicleModal,
      fullScreenLoading,
      childrenIndex,
      isMultiVehicle,
      showProgress,
      fullLoadRate,
      arrivalType,
      fakeProgressBar,
      selectMarkers,
    } = this.state;
    // 出结果了之后，禁止一些操作
    const lockBtn = scheduleResults.length > 0;
    // 已经生成排车单之后，禁止一些操作
    const isCreate = scheduleDataList.some(x => typeof x.ok === 'boolean');
    const allOk = isCreate && !scheduleDataList.some(x => !x.ok);
    const showDtlType = new Set(scheduleResults[childrenIndex]?.filter(x => x.arrivalType).map(x => x.arrivalType)).size > 1;
    // 主卡片统计数据 因为未分配的和线路内的分开2个，所以用函数
    const mainCardContent = (orders) =>
      <>
        <Divider style={{ margin: '6px 0' }}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1 }}>
          <div>门店数: {orders.length}</div>
          <div>总重量: {Math.round(orders.reduce((acc, cur) => acc + cur.weight, 0)) / 1000}</div>
          <div>总体积: {orders.reduce((acc, cur) => acc + cur.volume, 0).toFixed(2)}</div>

          <div>整件数: {orders.reduce((acc, cur) => acc + cur.cartonCount, 0)}</div>
          <div>散件数: {orders.reduce((acc, cur) => acc + cur.scatteredCount, 0)}</div>
          <div>周转箱: {orders.reduce((acc, cur) => acc + cur.containerCount, 0)}</div>
        </div>
        {isMultiVehicle &&
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1 }}>
            <div>冷藏筐：{orders.reduce((acc, cur) => acc + cur.coldContainerCount, 0)}</div>
            <div>冷冻筐：{orders.reduce((acc, cur) => acc + cur.freezeContainerCount, 0)}</div>
            <div>保温袋: {orders.reduce((acc, cur) => acc + cur.insulatedBagCount, 0)}</div>
            <div>鲜食筐：{orders.reduce((acc, cur) => acc + cur.freshContainerCount, 0)}</div>
          </div>
        }
      </>;

    // 配送点详情 因为未分配的和线路内的分开抽屉，所以用函数
    const dtlCardContent = (order, index) =>
      <>
        <div> {/* 卡片头 */}
          <b className={styles.detailIndex}>{index + 1}</b>
          <b>{convertCodeName(order.deliveryPoint)}</b>
          <Popover content="地图上聚焦该点">
            <Icon
              type="environment"
              style={{ color: '#999', marginLeft: 3 }}
              onClick={() => this.map.setFitView(new this.AMap.Marker({ position: [order.longitude, order.latitude] }))}
            />
          </Popover>
        </div>
        <div className={styles.w50}>线路：{order.archLine?.code}</div>
        {(showDtlType || childrenIndex === -9) && getArrivalType(order.arrivalType) /* 送货类型 */}
        {order.lineNote && <div className={styles.w50}>备注：{order.lineNote}</div>}
        {order.shipAreaName && <div className={styles.w50}>配送区域：{order.shipAreaName}</div>}
        <Divider style={{ margin: 6 }}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          <span>整件数:{order.cartonCount}</span>
          <span>散件数:{order.scatteredCount}</span>
          <span>周转箱:{order.containerCount}</span>
          <span>体积:{order.volume.toFixed(2)}</span>
          <span>重量:{(order.weight / 1000).toFixed(3)}</span>
        </div>
        {isMultiVehicle &&  // 多载具
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            <span>冷藏筐：{order.coldContainerCount}</span>
            <span>冷冻筐：{order.freezeContainerCount}</span>
            <span>保温袋：{order.insulatedBagCount}</span>
            <span>鲜食筐：{order.freshContainerCount}</span>
          </div>
        }
      </>;

    // 获取车型上面的配送元素的高度 直接用element.offsetHeight拿不到margin占用的高，所以就这样吧
    const getConfigHeight = () => {
      if (!this.configDivRef.current) return 66;
      let element = this.configDivRef.current;
      let rect = element.getBoundingClientRect();
      return rect.height + parseFloat(window.getComputedStyle(element).marginTop) + parseFloat(window.getComputedStyle(element).marginBottom);
    };

    return (
      <div className={styles.SmartScheduling} id="smartSchedulingPage">
        <FullScreenLoading show={fullScreenLoading}/>
        {/* ——————————————————————左边按钮侧边栏———————————————————— */}
        <div style={{ left: showButtonDrawer ? '0px' : '-250px' }} className={styles.leftButtonSidebar}>
          <div style={{ padding: 4 }}/>
          <Button
            block
            disabled={lockBtn}
            onClick={() => this.setState({ showMenuModal: true, showSmartSchedulingModal: true })}
          >
            加载订单
          </Button>
          <div style={{ padding: 4 }}/>
          <Button
            block
            type="primary"
            onClick={() => this.setState({ showSmartSchedulingModal: true })}
          >
            智能调度
          </Button>

          <Divider/>

          {lockBtn &&
            <Button
              block
              size="large"
              type="primary"
              onClick={() => this.resetData({ showSmartSchedulingModal: true, showMenuModal: true })}
            >
              重新智能调度
            </Button>
          }
        </div>

        <span   // ——————————————————————左侧边栏开关————————————————————
          className={styles.leftSidebarSwitch}
          style={{ left: showButtonDrawer ? '250px' : '0px' }}
          onClick={() => this.setState({ showButtonDrawer: !showButtonDrawer })}
        >
          <Icon
            type="left"
            className={styles.iconStyle}
            style={{ transform: showButtonDrawer ? 'unset' : 'rotate(180deg)' }}
          />
        </span>

        {/* ——————————————————————高德地图———————————————————— */}
        <div id="smartSchedulingAMap" style={{ width: '100vw', height: 'calc(100vh - 104px)' }}/>

        <span   // ——————————————————————右侧边栏开关————————————————————
          className={styles.rightSidebarSwitch}
          style={{ right: showResultDrawer ? this.RIGHT_DRAWER_WIDTH - 5 : -5 }}
          onClick={() => this.setState({ showResultDrawer: !showResultDrawer })}
        >
          <Icon
            type="left"
            className={styles.iconStyle}
            style={{ transform: showResultDrawer ? 'rotate(180deg)' : 'unset' }}
          />
        </span>
        <Drawer   // ——————————————————————侧边栏(智能调度结果)————————————————————
          title="智能调度结果预览"
          mask={false}
          placement="right"
          getContainer={false}
          visible={showResultDrawer}
          bodyStyle={{ padding: 10 }}
          width={this.RIGHT_DRAWER_WIDTH}
          onClose={() => this.setState({ showResultDrawer: false })}
        >{scheduleResults.length ?
          <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto', paddingBottom: 5 }}>
            {scheduleResults.map((orders, index) =>
              <div
                key={orders.uuid}
                className={styles.resultCard}
                onClick={() => this.routePlanning(index)}
                style={{
                  border: this.routingPlans[index] ? `${colors[index]} solid 2px` : 'unset',
                  width: this.RIGHT_DRAWER_WIDTH - 40,
                }}
              >
                {this.getColorBlocks(index)}
                <span style={{ fontSize: '16px' }}>线路{index + 1}</span>
                <Icon
                  style={{ fontSize: 14, color: scheduleDataList[index].unseen ? '#f75353' : '#999', padding: '0 5px' }}
                  type={scheduleDataList[index].unseen ? 'eye-invisible' : 'eye'}
                  onClick={e => {
                    e.stopPropagation();
                    const unseen = !scheduleDataList[index].unseen;
                    scheduleDataList[index].unseen = unseen;
                    this.setState({ scheduleDataList: [...scheduleDataList] }, () => {
                      this.loadingPoint(undefined, [], RE_LINE);
                      if (this.routingPlans[index]?.length > 0)
                        if (unseen) this.routingPlans[index].forEach(x => x.hide());
                        else this.routingPlans[index].forEach(x => x.show());
                    });
                  }}
                />
                {this.getCreateIcon(index)}
                {scheduleDataList[index].ok === false &&  // ——————————到配送调度界面创建——————————一点写false是因为空时不显示
                  <Popover
                    placement="topRight"
                    content={<div>跳转到配送调度的创建排车单页面，!!!这里选择的人、车、备注不会被带过去</div>}
                  >
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: '2px 8px', background: '#f2f2f2', borderRadius: 5, marginLeft: 5 }}
                      className={styles.yellowBtn}
                      onClick={() => {
                        if (window.openCreateSchedule) window.openCreateSchedule(orders);
                        else window.createScheduleOrders = orders;
                        this.props.history.push(this.dispatchingUri);
                      }}
                    >
                      单张保存
                    </Button>
                  </Popover>
                }
                {mainCardContent(orders)}
                {scheduleDataList[index]?.routeDistance?.length > 0 && // 公里数等
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1 }}>
                    <div>预估公里：{(_.sum(scheduleDataList[index].routeDistance) / 1000).toFixed(2)}</div>
                    <div>预估耗时：{formatSeconds(_.sum(scheduleDataList[index].routeTime))}</div>
                    <div>预估过路费: {_.sum(scheduleDataList[index].routeTolls)}元</div>
                  </div>
                }
                {scheduleDataList[index]?.selectEmployees?.map(emp =>
                  <div key={emp.UUID} className={styles.empTag}>
                    <span className={styles.empRole}>{this.empTypeMapper[emp.memberType] ?? emp.memberType}</span>
                    <span className={styles.empName}>[{emp.CODE}]{emp.NAME}</span>
                  </div>
                )}

                {scheduleDataList[index]?.selectVehicle?.UUID && // ——————车辆&满载率——————
                  <div>
                    <div>车辆：{this.getVehicleInfo('车牌号', index)}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 2 }}>
                      <div>载重：{this.getVehicleInfo('载重', index)}</div>
                      <Progress
                        size="small"
                        style={{ width: '90%' }}
                        percent={this.getVehicleInfo('载重率', index)}
                        status={this.getVehicleInfo('载重率', index) > 100 ? 'exception' : 'normal'}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 2 }}>
                      <div>体积：{this.getVehicleInfo('体积', index)}</div>
                      <Progress
                        size="small"
                        style={{ width: '90%' }}
                        percent={this.getVehicleInfo('体积率', index)}
                        status={this.getVehicleInfo('体积率', index) > 100 ? 'exception' : 'normal'}
                      />
                    </div>
                  </div>
                }

                <Divider style={{ margin: '6px 0' }}/>
                <div onClick={e => e.stopPropagation()}>
                  {/* ————————————打开线路明细抽屉—————————— */}
                  <LinkBtn onClick={() => this.setState({ childrenIndex: index })}>
                    明细
                  </LinkBtn>
                  {/* ——————————打开选择人员和车辆—————————— */}
                  <LinkBtn
                    onClick={() => {
                      if (scheduleDataList[index].ok) return message.error('无效操作：已生成排车单!');
                      if (orders.length === 0) return message.error('没有配送点时，不支持选车辆和人员!');
                      this.setState({ showEmpAndVehicleModal: index });
                      window.setTimeout(() => {
                        this.empAndVehicleModalRef?.show?.(orders, scheduleDataList[index].selectEmployees, scheduleDataList[index].selectVehicle, scheduleDataList[index].vehicleModel);
                      }, 50);
                    }}
                  >
                    车辆与人员
                  </LinkBtn>

                  {/* ——————————在地图上聚焦这条线路的点—————————— */}
                  <LinkBtn
                    disabled={orders.length === 0}
                    onClick={() => this.map.setFitView(this.groupMarkers[index], false, [60, 60, 60, 500])}    // 不是立即过渡 四周边距，上、下、左、右
                  >
                    聚焦
                  </LinkBtn>
                  {/* ——————————移除or解散 线路—————————— */}
                  <LinkBtn
                    className={styles.redBtn}
                    onClick={() => {
                      if (scheduleDataList[index].ok) return message.error('无效操作：已生成排车单!');
                      this.setState({ showRemoveModal: index });
                    }}
                  >
                    移除
                  </LinkBtn>

                  <div style={{ display: 'inline-block', paddingLeft: 8, color: '#666' }}>
                    备注：
                    <Input
                      size="small"
                      placeholder="请输入备注"
                      style={{ width: 110 }}
                      value={scheduleDataList[index].note}
                      onChange={e => {
                        const scheduleDataArr = [...scheduleDataList];
                        scheduleDataArr[index].note = e.target.value;
                        this.setState({ scheduleDataList: scheduleDataArr });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {unassignedNodes.length > 0 &&
              <div
                className={styles.resultCard}
                style={{ width: this.RIGHT_DRAWER_WIDTH - 40, boxShadow: 'inset 0px 0px 6px 0px #b5181861' }}
              >
                <Icon type="warning" theme="twoTone" style={{ fontSize: 19 }} twoToneColor="#eb2f96"/>
                <span style={{ fontSize: 14, marginLeft: 5 }}>未分配配送点</span>
                {mainCardContent(unassignedNodes)}
                <Divider style={{ margin: '6px 0' }}/>
                <LinkBtn onClick={() => this.setState({ childrenIndex: -9 })}>
                  明细
                </LinkBtn>
                <LinkBtn onClick={() => this.map.setFitView(this.unassignedMarkers, false, [60, 60, 60, 500])}>
                  聚焦
                </LinkBtn>

                <Popover
                  content={
                    <>
                      <div style={{ textAlign: 'center' }}>选择转移的路线</div>
                      {scheduleResults.map((_item, index) =>
                        <div
                          key={index}
                          className={styles.mapStyleItem}
                          onClick={() => {
                            scheduleResults[index] = [...scheduleResults[index], ...unassignedNodes];
                            this.setState({ scheduleResults, unassignedNodes: [] }, () => {
                              message.success(`已添加${unassignedNodes.length}个点到线路${index + 1}`);
                              this.loadingPoint();
                              // 如果有显示了路线规划，就重新规划
                              if (this.routingPlans[index]?.length > 0) this.routePlanning(index, true);
                            });
                          }}
                        >
                          线路{index + 1}
                        </div>
                      )}
                    </>
                  }
                >
                  <a style={{ display: 'inline-block', padding: '0px 8px 5px 8px' }}>一键转移</a>
                </Popover>

                <Popconfirm
                  title="确定移除吗"
                  onConfirm={() => {
                    this.map.remove(this.unassignedMarkers);
                    this.setState({ unassignedNodes: [] });
                  }}
                >
                  <LinkBtn style={{ color: 'red' }}>
                    一键移除
                  </LinkBtn>
                </Popconfirm>

              </div>

            }

            {/* ——————————————————智能调度结果底部按钮———————————————————— */}
            <div className={styles.resultBottom}>
              {/* ——————地图底色转换按钮——————— */}
              <Popover
                content={
                  <>
                    <div style={{ textAlign: 'center' }}>地图底色设置</div>
                    {Object.keys(mapStyleMap).map(name =>
                      <div
                        key={name}
                        className={styles.mapStyleItem}
                        style={this.mapStyleName === name ? { boxShadow: 'inset 1px 1px 4px 0 #39487061' } : {}}
                        onClick={() => {
                          if (this.mapStyleName === name) return;
                          this.map.setMapStyle(`amap://styles/${mapStyleMap[name]}`);
                          this.sxYm(this.mapStyleName = name);
                          window.localStorage.setItem('mapStyleName', name);
                        }}
                      >
                        {name}
                      </div>
                    )}
                  </>
                }
              >
                <Button
                  className={styles.resultBottomBtn}
                  onClick={() => {
                    const mapStyleName = this.mapStyleName === '月光银' ? '幻影黑' : '月光银';
                    this.map.setMapStyle(`amap://styles/${mapStyleMap[mapStyleName]}`);
                    this.sxYm(this.mapStyleName = mapStyleName);
                    window.localStorage.setItem('mapStyleName', mapStyleName);
                  }}
                >
                  <Icon type="skin" theme={this.mapStyleName === '月光银' ? 'outlined' : 'filled'}/>
                </Button>
              </Popover>

              {/* ——————————一键隐藏或查看全部全部点—————— */}
              <Popover
                content={`一键${scheduleDataList.some(x => x.unseen) ? '显示' : '隐藏'}配送点，未分配点位不受影响。ps:线路配送点受到影响时,会自动显示`}
              >
                <Button
                  className={styles.resultBottomBtn}
                  onClick={() => {
                    const unseen = !scheduleDataList.some(x => x.unseen);
                    scheduleDataList.forEach(x => x.unseen = unseen);
                    this.routingPlans.forEach(lineArr => lineArr?.forEach(x => {
                      if (unseen) x.hide();
                      else x.show();
                    }));
                    this.setState({ scheduleDataList: [...scheduleDataList] }, () => this.loadingPoint(undefined, [], RE_LINE));
                  }}
                >
                  <Icon type={scheduleDataList.some(x => x.unseen) ? 'eye-invisible' : 'eye'}/>
                </Button>
              </Popover>

              {/* ——————————批量选择点—————— */}
              <Popover
                content={
                  <div style={{ textAlign: 'center' }}>
                    <div>选择指定线路</div>
                    <div
                      className={styles.mapStyleItem}
                      style={selectMarkers.tag === -9 ? { boxShadow: 'inset 1px 1px 4px 0 #39487061' } : {}}
                      onClick={() => {
                        if (selectMarkers.tag !== -9) this.setState({ selectMarkers: { ...selectMarkers, tag: -9 } });
                      }}
                    >
                      未分配
                    </div>
                    <div
                      className={styles.mapStyleItem}
                      style={selectMarkers.tag === -1 ? { boxShadow: 'inset 1px 1px 4px 0 #39487061' } : {}}
                      onClick={() => {
                        if (selectMarkers.tag !== -1) this.setState({ selectMarkers: { ...selectMarkers, tag: -1 } });
                      }}
                    >
                      全部线路
                    </div>
                    {scheduleResults.map((_x, index) =>
                      <div
                        key={index}
                        className={styles.mapStyleItem}
                        style={selectMarkers.tag === index ? { boxShadow: 'inset 1px 1px 4px 0 #39487061' } : {}}
                        onClick={() => {
                          if (selectMarkers.tag !== index) this.setState({
                            selectMarkers: {
                              ...selectMarkers,
                              tag: index
                            }
                          });
                        }}
                      >
                        线路{index + 1}
                      </div>
                    )}
                  </div>
                }
              >
                <Badge
                  offset={[-25, -3]}
                  count={
                    selectMarkers.open ?
                      <div
                        style={{
                          width: 45,
                          borderRadius: 4,
                          padding: '0px 2px',
                          background: '#a9f6cb',
                          textAlign: 'center',
                        }}
                      >
                        {selectMarkers.tag === -9 && '未分配'}
                        {selectMarkers.tag === -1 && '全线路'}
                        {selectMarkers.tag > -1 && `线路${selectMarkers.tag + 1}`}
                      </div> : 0
                  }
                >
                  <Button
                    className={`${styles.resultBottomBtn} ${selectMarkers.open ? styles.bgColorAnimation : ''}`}
                    onClick={this.batchSelect}
                  >
                    <Icon type="select"/>
                  </Button>
                </Badge>
              </Popover>

              {/* ——————————一键推荐车和人按钮—————— */}
              <Popover content={<div>一键按熟练度推荐车辆和人员，如果已经选过车辆或人员的不会覆盖</div>}>
                <Button
                  className={styles.resultBottomBtn}
                  onClick={this.recommendPeopleAndVehicle}
                >
                  <Icon type="car"/>
                </Button>
              </Popover>

              {/* ——————————加上一条线路按钮—————— */}
              <Popover content={<div>添加一条空的线路</div>}>
                <Button
                  className={styles.resultBottomBtn}
                  onClick={() => {
                    this.setState({
                      scheduleResults: [...scheduleResults, []],
                      scheduleDataList: [...scheduleDataList, {}],
                    });
                    this.routingPlans.push(null);
                  }}
                >
                  <Icon type="plus"/>
                </Button>
              </Popover>

              {/* ——————————放弃本次结果按钮—————— */}
              <Popconfirm
                title={isCreate ? '开始新的智能调度' : '确定放弃本次智能调度结果?'}
                onConfirm={this.resetData}
              >
                <Popover content={isCreate ? '重新新的智能调度' : '放弃本次智能调度结果'}>
                  <Button type="danger" className={styles.resultBottomBtn}><Icon type="delete"/></Button>
                </Popover>
              </Popconfirm>
              {/* ——————————生成排车单按钮———————— */}
              <Tooltip
                placement="topRight"
                title={!allOk && isCreate ? '重新尝试保存生成失败的线路(已经成功的排车单不会再被保存)，ps：如果用了单张保存功能就建议不要在点击了,因为两边数据不互通！' : null}
              >
                <Button onClick={this.createSchedules} type="primary" disabled={allOk}>
                  {!allOk && isCreate ? '重试生成' : '生成排车单'}
                </Button>
              </Tooltip>
            </div>
          </div>
          :
          <Empty/>
        }
          <Drawer // ————————————————————智能调度结果明细————————————————————
            title={
              <div>
                {this.getColorBlocks(childrenIndex)}线路{childrenIndex + 1}明细
                <Popover content="地图上聚焦该点">
                  <Icon
                    type="environment"
                    style={{ color: '#999', marginLeft: 3 }}
                    onClick={() => this.map.setFitView(this.groupMarkers[childrenIndex], false, [60, 60, 60, 600])}
                  />
                </Popover>
              </div>
            }
            width={370}
            id="order-dtl-list"
            closable={false}
            bodyStyle={{ padding: 8 }}
            visible={childrenIndex >= 0}
            onClose={() => this.setState({ childrenIndex: -1 })}
          >
            <div
              ref={this.orderDtlRef}
              className={styles.orderDtlList}
              onMouseUp={() => this.orderDtlRef.current.childNodes.forEach(child => child.removeAttribute('style'))}
            >
              <DndProvider backend={HTML5Backend}>
                {scheduleResults[childrenIndex]?.map((order, index) =>
                  <DragDtlCard
                    key={order.uuid}
                    index={index}
                    moveCard={this.moveCard}
                    onDragEnd={this.onDragEnd}
                    disabled={scheduleDataList[childrenIndex].ok}
                  >
                    <div
                      className={styles.detailCard}
                      onMouseDown={() => this.orderDtlRef.current.childNodes[index].style.background = '#f2ffeb'}
                    >
                      {dtlCardContent(order, index)}
                    </div>
                  </DragDtlCard>
                )}
              </DndProvider>
            </div>
          </Drawer>

          <Drawer // ————————————————————智能调度未分配明细————————————————————
            title={
              <div>
                <Icon type="warning" theme="twoTone" style={{ fontSize: 19 }} twoToneColor="#eb2f96"/>
                <span style={{ fontSize: 14, marginLeft: 5 }}>未分配配送点</span>明细
                <Popover content="地图上聚焦该点">
                  <Icon
                    type="environment"
                    style={{ color: '#999', marginLeft: 3 }}
                    onClick={() => this.map.setFitView(this.unassignedMarkers, false, [60, 60, 60, 600])}
                  />
                </Popover>
              </div>
            }
            width={370}
            closable={false}
            bodyStyle={{ padding: 8 }}
            visible={childrenIndex === -9 && unassignedNodes.length > 0}
            onClose={() => this.setState({ childrenIndex: -1 })}
          >
            {unassignedNodes.map((order, index) =>
              <div key={order.uuid} className={styles.detailCard}>
                {dtlCardContent(order, index)}
                <Divider style={{ margin: '6px 0' }}/>
                <Popover // ————————————未分配转移的路线按钮——————————————
                  content={
                    <>
                      <div style={{ textAlign: 'center' }}>选择转移的路线</div>
                      {scheduleResults.map((_item, i) =>
                        <div
                          key={i}
                          className={styles.mapStyleItem}
                          onClick={() => {
                            scheduleResults[i] = [...scheduleResults[i], order];
                            if (unassignedNodes.length === 1) this.setState({ childrenIndex: -1 });
                            this.setState({
                              scheduleResults,
                              unassignedNodes: unassignedNodes.filter(item => item.uuid !== order.uuid)
                            }, () => {
                              message.success(`已添加到线路${i + 1}`);
                              this.loadingPoint();
                              // 如果有显示了路线规划，就重新规划
                              if (this.routingPlans[i]?.length > 0) this.routePlanning(i, true);
                            });
                          }}
                        >
                          线路{i + 1}
                        </div>
                      )}
                    </>
                  }
                >
                  <a style={{ display: 'inline-block', padding: '0px 8px 5px 8px' }}>转移</a>
                </Popover>

                <Popconfirm // ————————————移除未分配按钮——————————————
                  title="确定移除吗"
                  onConfirm={() => {
                    if (unassignedNodes.length === 1) this.setState({ childrenIndex: -1 });
                    this.setState({ unassignedNodes: unassignedNodes.filter(item => item.uuid !== order.uuid) }, () => {
                      this.loadingPoint([], undefined, RE_NOT_LINE);
                    });
                  }}
                >
                  <LinkBtn style={{ color: 'red' }}>移除</LinkBtn>
                </Popconfirm>
              </div>
            )}
          </Drawer>


        </Drawer>

        <Modal    // ————————————————————————————智能调度弹窗——————————————————————————————
          title="智能调度"
          visible={showSmartSchedulingModal}
          okText="开始智能调度"
          okButtonProps={{ disabled: lockBtn }}   // ok按钮参数
          width="100vw"
          style={{ top: 0 }}
          className={styles.modalxxxxxx}
          onCancel={() => this.setState({ showSmartSchedulingModal: false })}
          confirmLoading={btnLoading}
          getContainer={false}    // 挂载到当前节点，因为选单弹窗先弹出又在同一个节点 就会在底下显示看不到
          onOk={this.intelligentScheduling}
        >
          <Row style={{ height: 'calc(100vh - 140px)', overflow: 'auto', cursor: lockBtn ? 'not-allowed' : 'unset' }}>
            <Col span={12}>
              <Button type="primary" onClick={() => this.setState({ showMenuModal: true })} disabled={lockBtn}>
                加载订单
              </Button>
              &nbsp;&nbsp;
              {selectOrderList.length ?
                <>
                  <Button onClick={() => this.setState({ selectOrderList: [] })} disabled={lockBtn}>
                    清空
                  </Button>&nbsp;&nbsp;
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={selectOrderList}
                    scroll={{ x: '38vw', y: 'calc(100vh - 235px)' }}
                    columns={[
                      ...mergeOrdersColumns,
                      {
                        title: '操作',
                        key: 'operation',
                        width: 50,
                        align: 'center',
                        fixed: 'right',
                        render: (_text, _record, index) =>
                          <div>
                            <Button
                              type="link"
                              disabled={lockBtn}
                              onClick={() => this.setState({
                                selectOrderList: selectOrderList.filter((_v, i) => i !== index)
                              })}
                            >
                              移除
                            </Button>
                          </div>
                      }
                    ]}
                    footer={(data) =>
                      <div style={{ color: 'red', display: 'grid', gridTemplateColumns: '0.4fr 3fr 1fr 1fr 0.5fr' }}>
                        <b>合计</b>
                        <span>配送点数量：{data.length}</span>
                        <span>总重量：{(data.reduce((a, b) => a + b.weight, 0) / 1000).toFixed(3)}t</span>
                        <span>总体积：{data.reduce((a, b) => a + b.volume, 0).toFixed(2)}m³</span>
                      </div>
                    }
                  />
                </>
                :
                <Empty description="请先加载订单"/>
              }
            </Col>
            <Col span={12}>
              {/* 配置 设置边框 */}
              <div
                ref={this.configDivRef}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: 5,
                  marginBottom: 5,
                  pointerEvents: lockBtn ? 'none' : 'unset',
                }}
              >
                <b>配置</b>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    算路选项：
                    <Select
                      value={routingConfig.routeOption}
                      style={{ width: 120 }}
                      onChange={v => this.setState({ routingConfig: { ...routingConfig, routeOption: v } })}
                    >
                      <Option value={0}>综合最优</Option>
                      <Option value={1}>不走高速</Option>
                      <Option value={2}>避免收费</Option>
                    </Select>
                  </div>

                  <div>
                    排线排序⽅式：
                    <Select
                      value={routingConfig.sortRule}
                      style={{ width: 120 }}
                      onChange={v => this.setState({ routingConfig: { ...routingConfig, sortRule: v } })}
                    >
                      <Option value={0}>距离最短</Option>
                      <Option value={1}>时间最短</Option>
                    </Select>
                  </div>


                  <div>
                    最大满载率：
                    <InputNumber
                      min={10}
                      max={100}
                      value={fullLoadRate}
                      onChange={v => this.setState({ fullLoadRate: v })}
                    />%
                  </div>

                  <div>
                    是否回仓：
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      checked={!routingConfig.isBack}
                      onChange={v => this.setState({ routingConfig: { ...routingConfig, isBack: v ? 0 : 1 } })}
                    />
                  </div>

                  <div>
                    ⽆限⻋辆：
                    <Switch
                      checkedChildren="开"
                      unCheckedChildren="关"
                      checked={!routingConfig.infiniteVehicle}
                      onChange={v => this.setState({ routingConfig: { ...routingConfig, infiniteVehicle: v ? 0 : 1 } })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <span style={{ pointerEvents: lockBtn ? 'none' : 'unset' }}>
                  <Tooltip title="手动添加车辆参数：不会覆盖，在当前表格下追加一列" mouseEnterDelay={1}>
                    <Button onClick={() => this.setState({ showInputVehicleModal: true })} type="primary">
                      添加车型
                    </Button>
                  </Tooltip>
                  <VehicleInputModal  // 手动添加车辆参数弹窗
                    showCount={routingConfig.infiniteVehicle === 1}
                    open={showInputVehicleModal}
                    onClose={() => this.setState({ showInputVehicleModal: false })}
                    addVehicle={vehicle => this.setState({ selectVehicles: [...selectVehicles, vehicle] })}
                  />
                  &nbsp;&nbsp;
                  <Tooltip title="使用运力池车型：会覆盖当前输入的数据！！！" mouseEnterDelay={1}>
                    <Button   // 打开运力池按钮
                      onClick={() => {
                        this.setState({ showVehicleModal: true });
                        if (selectVehicles.length) message.warning('此操作会覆盖本来选择的车辆数据，如果不想被覆盖可以选择手动添加按钮！');
                      }}
                    >
                      使用运力池车型
                    </Button>
                  </Tooltip>
                  &nbsp;&nbsp;
                  <Tooltip title="载重和体积相同的车型可以合并方便查看">
                    <Button onClick={this.mergeVehicles} style={selectVehicles.length ? {} : { display: 'none' }}>
                      合并车型
                    </Button>
                  </Tooltip>
                  &nbsp;&nbsp;
                  {Boolean(localStorage.getItem(`lastVehicles${loginOrg().uuid}`)) && // 从localStorage读取上次车辆参数
                    <>
                      <Tooltip title="使用上次车辆参数：如果已经添加了参数，会被覆盖!" mouseEnterDelay={1}>
                        <Button
                          onClick={() => {
                            this.setState({ selectVehicles: JSON.parse(localStorage.getItem(`lastVehicles${loginOrg().uuid}`)) });
                            message.warning('已使用上次车辆参数，请注意检查数据是否正确！');
                          }}
                        >
                          使用上次车型
                        </Button>
                      </Tooltip>
                      &nbsp;&nbsp;
                    </>
                  }
                </span>

                {selectVehicles.length ?
                  <>
                    <Button type="danger" onClick={() => this.setState({ selectVehicles: [] })} disabled={lockBtn}>
                      清空
                    </Button>&nbsp;&nbsp;
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={selectVehicles}
                      scroll={{ x: '38vw', y: `calc(100vh - 235px - ${getConfigHeight()}px)` }}
                      columns={[
                        ...mergeVehicleColumns,
                        {
                          title: '车辆数',
                          dataIndex: 'vehicleCount',
                          width: 100,
                          render: (_text, record, index) => (
                            <div>
                              <Button
                                size="small"
                                disabled={record.vehicleCount <= 1 || lockBtn}
                                onClick={() => {
                                  let { selectVehicles: vehicles } = this.state;
                                  vehicles[index].vehicleCount--;
                                  this.setState({ selectVehicles: vehicles });
                                }}
                              >
                                -
                              </Button>
                              &nbsp;{record.vehicleCount}&nbsp;
                              <Button
                                size="small"
                                disabled={lockBtn}
                                onClick={() => {
                                  let { selectVehicles: vehicles } = this.state;
                                  vehicles[index].vehicleCount++;
                                  this.setState({ selectVehicles: vehicles });
                                }}
                              >
                                +
                              </Button>
                            </div>
                          ),
                        },
                        {
                          title: '操作', dataIndex: 'action', width: 80, render: (text, record, index) => (
                            <Button
                              type="link"
                              disabled={lockBtn}
                              onClick={() => this.setState({
                                selectVehicles: selectVehicles.filter((_v, i) => i !== index)
                              })}
                            >
                              移除
                            </Button>
                          )
                        }
                      ].filter(c => routingConfig.infiniteVehicle ? true : c.title !== '车辆数')}
                      footer={(data) => Boolean(routingConfig.infiniteVehicle) && // 无限车就不用合计了
                        <div style={{ color: 'red', display: 'grid', gridTemplateColumns: '0.2fr 1fr 1fr 1fr 0.7fr' }}>
                          <b>合计</b>
                          <span>总载重：{data.reduce((a, b) => a + b.weight * b.vehicleCount, 0).toFixed(2)}t</span>
                          <span>总体积：{data.reduce((a, b) => a + b.volume * b.vehicleCount, 0).toFixed(2)}m³</span>
                          <span>车辆数量：{data.reduce((a, b) => a + b.vehicleCount, 0)}</span>
                        </div>
                      }
                    />
                  </>
                  :
                  <Empty description="载入排车车型参数，系统会按照车型参数进行排排线"/>
                }
              </div>
            </Col>
          </Row>
        </Modal>

        <Modal  // ——————————————————————————————订单池弹窗——————————————————————————————————
          title="订单池（上限200个门店）"
          width="90vw"
          okText="选定"
          style={{ top: 20 }}
          visible={showMenuModal}
          className={styles.modalMaxHeight100}
          onCancel={() => this.setState({ showMenuModal: false })}
          onOk={() => this.handleOrders()}  // 不能直接写this.handleOrders，会把event作为参数传进去
        >
          <OrderPoolModal
            arrivalType={arrivalType} // 订单池搜索条件是否加上到货类型搜索条件
            ref={ref => (this.orderPoolModalRef = ref)}
          />
        </Modal>

        <Modal  // ——————————————————————————————运力池弹窗——————————————————————————————————
          title="运力池（上限50辆）"
          width="90vw"
          okText="选定"
          style={{ top: 20 }}
          visible={showVehicleModal}
          className={styles.modalMaxHeight100}
          onCancel={() => this.setState({ showVehicleModal: false })}
          onOk={() => {
            if (!this.vehiclePoolModalRef.state) return message.error('数据异常，请刷新页面重试');
            const { vehicleData, vehicleRowKeys } = this.vehiclePoolModalRef.state;
            if (!vehicleRowKeys.length) return message.error('请选择车辆');
            let selectVehicleList = vehicleData.filter(v => vehicleRowKeys.includes(v.UUID));
            if (selectVehicleList.some(v => !v.BEARVOLUME || !v.BEARWEIGHT)) {
              message.warning('已过滤没有重量体积的车辆');
              selectVehicleList = selectVehicleList.filter(v => v.BEARVOLUME && v.BEARWEIGHT);
            }
            if (selectVehicleList.length === 0) return message.error('选择车辆均为无效车辆');
            if (selectVehicleList.length > 50) return message.error('车辆最多只能选择50辆');
            // ——————————————车辆分组——————————————
            // 创建一个空对象来存储分组后的车量数据
            const groupedData = {};
            // 遍历原始数据
            selectVehicleList.forEach(item => {
              // 创建一个唯一键，由重量、体积和班组组成
              // const key = `${item.BEARWEIGHT}-${Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100}-${item.VEHICLEGROUP}`
              const key = `${item.BEARWEIGHT}-${Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100}`;
              // 如果当前组合不存在，则创建一个新的条目
              if (!groupedData[key]) {
                groupedData[key] = {
                  vehicleCount: 0,
                  // vehicleGroup: item.VEHICLEGROUP,
                  weight: parseFloat(item.BEARWEIGHT.replace(/[^0-9.]/g, '')), // 转换为数字,
                  volume: Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100,
                };
              }
              // 更新车辆数量
              groupedData[key].vehicleCount++;
            });
            // 将分组后的数据转换为数组
            const groupedVehicle = Object.values(groupedData);
            this.setState({ showVehicleModal: false, selectVehicles: groupedVehicle });
          }}
        >
          <VehiclePoolPage
            ref={ref => (this.vehiclePoolModalRef = ref)}
            searchKey="VehiclePoolPageModal"
            vehicleColumns={vehicleColumns}
            tabHeight={80}
          />
        </Modal>

        <Modal  // ——————————————————————————————显示进度条——————————————————————————————————
          footer={null}
          closable={false}
          getContainer={false}    // 挂载到当前节点，因为要是跳转到配送调度页面，弹窗还卡着呢
          visible={showProgress >= 0}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <Progress percent={showProgress} status={showProgress < 100 ? 'active' : 'success'}/>
            {scheduleDataList.map((x, i) => x.errMsg && <div key={x.errMsg + i}>{x.errMsg}</div>)}
            {showProgress === 100 &&
              <div>
                <Button
                  type="primary"
                  style={{ margin: '10px 20px 0 0' }}
                  onClick={() => this.resetData({ showSmartSchedulingModal: true, showMenuModal: true })}
                >
                  继续新的排线
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    this.props.history.push(this.dispatchingUri);
                    window.refreshDispatchAll && window.refreshDispatchAll();   // 本来打开了就刷新调度页面数据
                  }}
                >
                  查看排车单(跳转到配送调度页面)
                </Button>
                <Button
                  style={{ margin: '0 0 0 20px' }}
                  onClick={() => this.setState({ showProgress: -1, showButtonDrawer: true })}
                >
                  保持界面
                </Button>
              </div>
            }
          </div>
        </Modal>

        <Modal  // ——————————————————————————————智能调度假进度条——————————————————————————————————
          footer={null}
          closable={false}
          getContainer={false}
          style={{ top: '35vh' }}
          visible={fakeProgressBar > 0}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <Progress percent={fakeProgressBar}/>
            <VanLoader/>
            <b>智能调度中...</b>
          </div>
        </Modal>

        <Modal  // ——————————————————————————————选择员工和车辆弹窗——————————————————————————————————
          title={
            <div>
              线路{showEmpAndVehicleModal + 1}{this.getColorBlocks(showEmpAndVehicleModal)}选择员工和车辆
              <Tips>在车辆的默认匹配选项中,重量体积是绿色的,表示这个是智能调度推荐的重量体积</Tips>
            </div>
          }
          width="78vw"
          // style={{ top: 20 }}
          visible={showEmpAndVehicleModal >= 0}
          onCancel={() => this.setState({ showEmpAndVehicleModal: -1 })}
          onOk={async () => {
            const { selectVehicle, selectEmployees, } = this.empAndVehicleModalRef.state;
            const { dispatchConfig, checkVehicleFollower } = this.empAndVehicleModalRef;
            if (selectEmployees.filter(item => item.memberType === 'Driver').length > 1) return message.error('只能有一个驾驶员哦');
            if (selectEmployees.some(item => !item.memberType)) return message.error('已选人有未选工种');
            if (selectEmployees.length > [...new Set(selectEmployees.map(x => x.memberType + x.UUID))].length) return message.error('有重复人员且重复工种');
            if (dispatchConfig.checkVehicleFollower === 1 || dispatchConfig.checkVehicleFollower === 2) { // 校验随车人员
              const includes = await checkVehicleFollower(selectVehicle, selectEmployees);
              if (!includes && dispatchConfig.checkVehicleFollower === 1) {
                return Modal.confirm({
                  title: '车辆与人员不匹配，确定生成排车单吗？',
                  onOk: () => {
                    const dataList = [...scheduleDataList];
                    dataList[showEmpAndVehicleModal].selectVehicle = selectVehicle;
                    dataList[showEmpAndVehicleModal].selectEmployees = selectEmployees;
                    this.setState({ showEmpAndVehicleModal: -1, scheduleDataList: dataList });
                  },
                });
              }
              if (!includes && dispatchConfig.checkVehicleFollower === 2) return message.error('车辆与人员不匹配');
            }
            const dataList = [...scheduleDataList];
            dataList[showEmpAndVehicleModal].selectVehicle = selectVehicle;
            dataList[showEmpAndVehicleModal].selectEmployees = selectEmployees;
            this.setState({ showEmpAndVehicleModal: -1, scheduleDataList: dataList });
          }}
        >
          <EmpAndVehicleModal
            onRef={ref => this.empAndVehicleModalRef = ref}
            weight={showEmpAndVehicleModal >= 0 ? Math.round(scheduleResults[showEmpAndVehicleModal].reduce((acc, cur) => acc + cur.weight, 0)) / 1000 : 0}
            volume={showEmpAndVehicleModal >= 0 ? parseFloat(scheduleResults[showEmpAndVehicleModal].reduce((acc, cur) => acc + cur.volume, 0).toFixed(2)) : 0}
            lineNum={showEmpAndVehicleModal + 1}
          />
        </Modal>

        {Boolean(showPointModal) &&
          <Modal // ——————————————————————————————操作配送点弹窗——————————————————————————————————
            title="配送点操作"
            visible
            footer={null}
            onCancel={() => this.setState({ showPointModal: null })}
          >
            <div style={{ textAlign: 'center' }}>{convertCodeName(showPointModal[0].deliveryPoint)}</div>
            {showPointModal[1] >= 0 ?
              <div>当前线路：{showPointModal[1] + 1}{this.getColorBlocks(showPointModal[1], 9)}</div>
              :
              <div>当前未分配线路</div>
            }
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8, textAlign: 'center' }}>
              <Button onClick={() => this.setState({ showPointModal: null })}>取消</Button>
              <Popconfirm
                title="移除后,本次排车将无法使用该点?"
                onConfirm={() => this.removePoint(...showPointModal)}
              >
                <Tooltip title="移除后,本次排车将无法使用该点。如果本次还想操作请使用切换线路" mouseEnterDelay={1}>
                  <Button type="danger">移除</Button>
                </Tooltip>
              </Popconfirm>
              <div>
                切换线路：
                <Select value={showPointModal[1]} style={{ width: 90 }} onChange={this.switchingLine}>
                  <Option value={-1} disabled={showPointModal[1] === -1}>未分配</Option>
                  {scheduleResults.map((_item, i) => (
                    <Option key={i} value={i} disabled={i === showPointModal[1]}>
                      {this.getColorBlocks(i, 9)}线路{i + 1}
                    </Option>
                  ))}
                </Select>
                <Tips>选择后该配送点直接改变到新选线路最后一个。</Tips>
              </div>
            </div>
          </Modal>
        }

        <Modal  // ——————————————————————————————操作线路弹窗——————————————————————————————————
          title={<div>{this.getColorBlocks(showRemoveModal, 9)}线路{showRemoveModal + 1}操作</div>}
          footer={null}
          visible={showRemoveModal >= 0}
          onCancel={() => this.setState({ showRemoveModal: -1 })}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, textAlign: 'center' }}>
            <Button onClick={() => this.setState({ showRemoveModal: -1 })}>取消</Button>
            <Popover content="移除后,线路内所有配送点在本次排车将无法使用" placement="bottom">
              <Button type="danger" onClick={() => this.removeLine()}>
                移除
              </Button>
            </Popover>
            <Popover content="解散后,线路内所有配送点变成未分配线路状态" placement="bottom">
              <Button type="danger" onClick={() => this.removeLine(showRemoveModal, true)}>
                解散
              </Button>
            </Popover>
          </div>
        </Modal>

        <Modal  // ——————————————————————————————框选批量操作弹窗————————————[{-9:[order1、2、3]}，{1:[order1、2、3]}]———————
          title="框选批量操作"
          width="60vw"
          footer={null}
          visible={selectMarkers?.selectList?.length > 0}
          onCancel={() => this.setState({ selectMarkers: { ...selectMarkers, selectList: [] } })}
        >
          <div style={{ textAlign: 'center', overflowY: 'auto', height: '65vh' }}>
            {selectMarkers.selectList?.map((obj, index) => Object.entries(obj).map(([line, orders]) =>
              <div>
                <b style={{ fontSize: 16 }}>{getLineName(line)}</b>
                <Icon
                  type="close-circle"
                  style={{ fontSize: 16, paddingLeft: 5 }}
                  onClick={() => {
                    selectMarkers.selectList = selectMarkers.selectList.filter(item => item !== obj);
                    this.setState({ selectMarkers });
                  }}
                />
                {orders.map(order =>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <Icon
                      type="close-circle"
                      style={{ padding: '7px 5px', fontSize: 15, cursor: 'pointer' }}
                      onClick={() => {
                        selectMarkers.selectList[index][line] = orders.filter(item => item.uuid !== order.uuid);
                        this.setState({ selectMarkers });
                      }}
                    />
                    <div className={styles.cellBorder}>[{order.deliveryPoint.code}]{order.deliveryPoint.name}</div>
                    <div className={styles.cellBorder}>线路：{order.archLine?.code}</div>
                    <div className={styles.cellBorder}>配送区域：{order.shipAreaName}</div>
                    <div className={styles.cellBorder}>{getArrivalType(order.arrivalType)}</div>
                  </div>
                )}
                <br/>
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 15,
              justifyContent: 'center',
              paddingTop: 10,
              marginTop: 5,
              boxShadow: '0 -4px 6px #0000001a'
            }}
          >
            <Button onClick={() => this.setState({ selectMarkers: { ...selectMarkers, selectList: [] } })}>
              取消
            </Button>
            <Popconfirm
              title="确定批量解散吗？"
              okText="我肯定"
              cancelText="点错了"
              onConfirm={() => this.batchSelectHandle('解散')}
            >
              <Button type="danger" style={{ display: selectMarkers.tag === -9 ? 'none' : 'inline-block' }}>
                解散
              </Button>
            </Popconfirm>

            <Popconfirm
              title="确定批量移除吗？"
              okText="我确定"
              cancelText="我再想想"
              onConfirm={() => this.batchSelectHandle('移除')}
            >
              <Button type="danger">移除</Button>
            </Popconfirm>
            <Popover
              getPopupContainer={triggerNode => triggerNode} // 弹出框位置放到按钮上。 默认body，tmd弹窗消失他还在
              content={
                <div style={{ textAlign: 'center', width: 99 }}>
                  {scheduleResults.map((_item, i) =>
                    <div
                      key={i}
                      className={styles.mapStyleItem}
                      onClick={() => this.batchSelectHandle('转移', i)}
                    >
                      {this.getColorBlocks(i, 9)}
                      线路{i + 1}
                    </div>
                  )}
                </div>
              }
            >
              <Button type="primary">转移</Button>
            </Popover>
          </div>
        </Modal>

      </div>
    );
  }
}
