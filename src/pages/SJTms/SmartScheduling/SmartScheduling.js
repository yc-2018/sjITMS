// ///////////////////////////智能调度页面//////////////
import React, { Component, createRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import {
  Button, Col, Divider, Drawer, Empty, Icon, message,
  Modal, Popconfirm, Popover, Progress, Row, Select, Table
} from 'antd'
import { uniqBy } from 'lodash'
import { AMapDefaultConfigObj, AMapDefaultLoaderObj } from '@/utils/mapUtil'
import styles from './SmartScheduling.less'
import VehiclePoolPage from '@/pages/SJTms/Dispatching/VehiclePoolPage'
import OrderPoolModal from '@/pages/SJTms/SmartScheduling/OrderPoolModal'
import { mergeOrdersColumns, mergeVehicleColumns, vehicleColumns } from '@/pages/SJTms/SmartScheduling/columns'
import { queryDict } from '@/services/quick/Quick'
import { loginCompany, loginOrg } from '@/utils/LoginContext'
import { getSmartScheduling } from '@/services/sjitms/smartSchedulingApi'
import VehicleInputModal from '@/pages/SJTms/SmartScheduling/VehicleInputModal'
import FullScreenLoading from '@/components/FullScreenLoading'
import { colors } from '@/pages/SJTms/SmartScheduling/colors'
import { convertCodeName } from '@/utils/utils'
import { GetConfig } from '@/services/sjitms/OrderBill'
import { groupByOrder, mapStyle } from '@/pages/SJTms/SmartScheduling/common'
import { save } from '@/services/sjitms/ScheduleBill'

const { Option } = Select
window.selectOrders = undefined      // 如果是配送调度跳转过来的订单池原数据列表

export default class SmartScheduling extends Component {
  RIGHT_DRAWER_WIDTH = 400   // 右侧侧边栏宽度（智能调度结果抽屉宽度）
  AMap = null                   // 高德地图对象
  map = null                    // 高德地图实例
  text = null                   // 高德地图文本对象
  warehouseMarker = null        // 当前仓库高德点
  warehousePoint = ''         // 当前仓库经纬度
  groupMarkers = []            // 分组的高德点位
  routingPlans = []           // 路线规划数据列表（按index对应groupMarkers）
  mapStyle = 'normal'         // 地图样式 标准 normal    幻影黑 dark
  orderList = []               // 点击智能调度时订单池原数据列表（用来生成排车单时用）

  vehiclePoolModalRef = createRef() // 车辆池弹窗ref
  orderPoolModalRef = createRef()   // 订单池弹窗ref

  state = {
    sx: 0,                           // 有时刷新页面用
    selectOrderList: [],             // 选中订单池订单
    selectVehicles: [],              // 选中运力池数据
    showInputVehicleModal: false,    // 显示手动输入车辆弹窗
    showSmartSchedulingModal: false, // 显示智能调度弹窗
    showMenuModal: false,            // 显示选订单弹窗
    showVehicleModal: false,         // 显示选车辆弹窗
    showResultDrawer: false,         // 显示调度结果右侧侧边栏
    showButtonDrawer: true,          // 显示左边按钮侧边栏
    showProgress: -1,                // 显示生成排车进度条（>0就是显示)
    errMessages: [],                 // 生成排车单时如果有错误信息
    childrenIndex: -1,               // 显示调度排车子抽屉 这个是它的索引>=0就是显示
    scheduleResults: [],             // 智能调度排车处理后的结果（二重数组内的订单）
    unassignedNodes:[],              // 智能调度未分配节点
    btnLoading: false,               // 智能调度按钮加载状态
    fullScreenLoading: false,        // 全屏加载中
    isMultiVehicle: false,           // 是否是多载具仓库
    routingConfig: {                 // 智能调度接口参数配置
      sortRule: 0,    // 排线排序⽅式
      routeOption: 0, // 算路选项
      isBack: 1,      // 是否算返回仓库
    }

  }

  componentDidMount = async () => {
    try { // 加载高德地图
      this.AMap = window.AMap ?? await AMapLoader.load(AMapDefaultLoaderObj)
      this.map = new this.AMap.Map('smartSchedulingAMap', AMapDefaultConfigObj)
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }
    this.initConfig()
  }
  /**
   * 初始化配置，如多载具
   * @author ChenGuangLong
   * @since 2024/11/12 下午3:41
  */
  initConfig = async () => {
    // ————————设置地图样式————————
    const mapStyleName = window.localStorage.getItem('mapStyle')
    if (mapStyleName && this.map) {
      this.mapStyle = mapStyleName
      this.map.setMapStyle(`amap://styles/${mapStyle[mapStyleName]}`)
    }

    // ————————仓库坐标————————
    queryDict('warehouse').then(res => {    // 获取当前仓库经纬度
      const description = res.data.find(x => x.itemValue === loginOrg().uuid)?.description
      if (description) {
        this.warehousePoint = description.split(',').reverse().join(',')  // 字典经纬度位置调换位置
        if (this.map) this.map.setCenter(this.warehousePoint.split(','), true)  // 立即过渡到仓库位置视野
      }
      else message.error('获取当前仓库经纬度失败')
    })
    // ————————多载具————————
    GetConfig('dispatch', loginOrg().uuid).then(res => {
      if (res?.data?.[0]?.multiVehicle) this.setState({ isMultiVehicle: res?.data?.[0]?.multiVehicle === '1' })
      else message.error('获取多载具配置失败')
    }).catch(() => message.error('获取多载具配置失败！'))

  }

  /** 非状态变量改变后可刷新页面 */
  sxYm = () => {
    this.setState({ sx: this.state.sx + 1 })
  }

  /**
   * 处理选择订单池订单
   * @author ChenGuangLong
   * @since 2024/11/13 上午9:48
  */
  handleOrders = (selectOrders = this.orderPoolModalRef?.state?.selectOrders) => {
    if (!selectOrders?.length) return message.error('请先选择订单')
    this.orderList = [...selectOrders] // 订单池原数据列表
    // 有些仓是一个运输订单是多个订单，所以需要合并
    let mergeOrders = Object.values(
      selectOrders.reduce((acc, order) => {
        if (!acc[order.deliveryPoint.uuid]) {
          acc[order.deliveryPoint.uuid] = JSON.parse(JSON.stringify(order))
        } else {
          acc[order.deliveryPoint.uuid].weight += order.weight                       // 重量
          acc[order.deliveryPoint.uuid].volume += order.volume                       // 体积
          acc[order.deliveryPoint.uuid].cartonCount += order.cartonCount ?? 0        // 整件数
          acc[order.deliveryPoint.uuid].scatteredCount += order.scatteredCount ?? 0  // 散件数
          acc[order.deliveryPoint.uuid].containerCount += order.containerCount ?? 0  // 周转箱
          // 下面多载具
          acc[order.deliveryPoint.uuid].coldContainerCount += order.coldContainerCount ?? 0       // 冷藏周转筐
          acc[order.deliveryPoint.uuid].freezeContainerCount += order.freezeContainerCount ?? 0  // 冷冻周转筐
          acc[order.deliveryPoint.uuid].insulatedBagCount += order.insulatedBagCount ?? 0       // 保温袋
          acc[order.deliveryPoint.uuid].freshContainerCount += order.freshContainerCount ?? 0  // 鲜食筐
        }
        return acc
      }, {})
    )
    // 没有经纬度的排除
    if (mergeOrders.some(item => !item.longitude || !item.latitude)) {
      message.warning('已排除没有经纬度的点')
      mergeOrders = mergeOrders.filter(item => item.longitude && item.latitude)
    }
    if (mergeOrders.length < 2) return message.error('请选择至少两个要排车的门店！')

    this.setState({ showMenuModal: false, selectOrderList: mergeOrders })
  }

  /**
   * 智能调度 排单排线
   * @author ChenGuangLong
   * @since 2024/11/7 下午5:10
  */
  intelligentScheduling = async () => {
    const { selectOrderList, selectVehicles, routingConfig } = this.state
    // —————————————————————————————————校验数据—————————————————————————————
    if (!this.warehousePoint) return message.error('获取当前仓库经纬度失败，请刷新页面再试试')
    if (selectOrderList.length === 0) return message.error('请选择订单')
    if (selectVehicles.length === 0) return message.error('请选择车辆')
    // 订单总体积或重量超出现有车辆的最大限度，无法进行排车!
    const orderTotalWeight = selectOrderList.reduce((a, b) => a + b.weight, 0) / 1000
    const orderTotalVolume = selectOrderList.reduce((a, b) => a + b.volume, 0)
    const vehicleTotalWeight = selectVehicles.reduce((a, b) => a + b.weight * b.vehicleCount, 0)
    const vehicleTotalVolume = selectVehicles.reduce((a, b) => a + b.volume * b.vehicleCount, 0)
    if (orderTotalWeight > vehicleTotalWeight) return message.error('订单总重量超出现有车辆重量')
    if (orderTotalVolume > vehicleTotalVolume) return message.error('订单总体积超出现有车辆体积')
    // ————————————————————————————————组装请求体——————————————————————————————
    // 定义仓库信息
    const depots = [{
      location:this.warehousePoint,
      vehicleGroups: selectVehicles.map(x => ({
        deliveryType: 0,                            // 配送方式，默认值为0（驾车配送）
        // vehicleGroupId: x.vehicleGroup,          // 车辆组ID，非必填
        vehicleModelId: `${x.weight}-${x.volume}`,  // 车辆型号ID，非必填
        vehicleCount: x.vehicleCount,               // 该（型号）车数量，默认值为1
        capacity: {
          weight: x.weight,                         // 装载容量，
          volume: x.volume,                         // 装载体积，
        }
      })),
    }]
    // 定义配送点信息
    const servicePoints = selectOrderList.map(x => ({
      location: `${x.longitude},${x.latitude}`,                // 配送点坐标
      name: `${x.deliveryPoint.uuid}`,                         // 配送点poi名称
      demand: {
        weight: x.weight / 1000,  // 需求容量
        volume: x.volume,         // 需求体积
      }
    }))
    // 开始组装
    const requestBody = {
      ...routingConfig,
      depots,
      servicePoints,
      deliveryCapacity: 0,
      infiniteVehicle: 1,
    }
    this.setState({ btnLoading: true, fullScreenLoading: true })
    const result = await getSmartScheduling(requestBody)
    this.setState({ btnLoading: false, fullScreenLoading: false })

    if (result.errmsg !== 'OK' || !result.data) return message.error(`${result.errmsg}:${result.errdetail}`)
    const { routes, unassignedNodes } = result.data[0]
    const groupOrders = routes.map(route =>
      route.queue.map(r => selectOrderList.find(order => order.deliveryPoint.uuid === r.endName)))
    this.setState({
      showSmartSchedulingModal: false,
      showButtonDrawer: false,
      showResultDrawer: true,
      scheduleResults: groupOrders,
      unassignedNodes,
    })
    this.loadingPoint(groupOrders, unassignedNodes)
  }

  /**
   * 加载地图点位
   * @author ChenGuangLong
   * @since 2024/11/8 上午10:59
  */
  loadingPoint = (groupOrders = this.state.scheduleResults, unassigneds = this.state.unassignedNodes) => {
    const { map, AMap,  warehouseMarker, warehousePoint, groupMarkers } = this
    if (!warehouseMarker) { // 仓库点
      this.warehouseMarker = new AMap.Marker({
        position: warehousePoint.split(','),      // 设置Marker的位置
        anchor: 'center',              // 设置Marker的锚点
        content: `<div class="${styles.point}" style="border: white solid 2px;">仓</div>`
      })
      map.add(this.warehouseMarker)
    }

    groupOrders.forEach((orders, index) => {  // 每个组循环
      const markers = orders.map((order, i) => {            // 组内循环
        const { longitude, latitude } = order
        const marker = new AMap.Marker({
          position: [longitude, latitude],      // 设置Marker的位置
          anchor: 'center',                     // 设置Marker的锚点
          content: `<div style="background: ${colors[index]}" class="${styles.point}">${i + 1}</div>`
        })
        return marker
      })
      map.add(markers)
      groupMarkers[index] = markers
    })

  }

  /**
   * 路线规划
   * @author ChenGuangLong
   * @since 2024/11/9 下午2:57
   */
  routePlanning = index => {
    if (this.routingPlans[index]?.length > 0) {
      this.map.remove(this.routingPlans[index])
      this.routingPlans[index] = undefined
      return this.sxYm()
    }
    const { map, AMap,  groupMarkers, warehouseMarker } = this
    // 构造路线导航类
    const driving = new AMap.Driving({
      hideMarkers: true,
      ferry: 1,
      showTraffic: false,
      autoFitView: false,
      outlineColor: colors[index],
    })
    this.routingPlans[index] = []                                                   // 初始化路线数组
    // 因为路线规划一次就最多16个 还要拆分多次调用
    const aLine = [warehouseMarker, ...groupMarkers[index], warehouseMarker]  // 添加起始点和终点 才是一个完整的路径
    const arr16 = []                                                          // 拆分后的数组
    for (let i = 0; i < aLine.length; i += (16 - 1)) {                      // 步进值确保每组之间有一个重叠元素
      arr16.push(aLine.slice(i, i + 16))
    }
    const isLoad = Array(arr16.length).fill(true)   // 多次规划路线是否加载全部完毕|标记
    // 每16个点做一次规划
    arr16.forEach((line,i) => {
      const waypoints = line.slice(1, line.length - 1).map(x => x.getPosition())
      // 根据起终点经纬度规划驾车导航路线
      driving.search(line[0].getPosition(), line[line.length - 1].getPosition(), { waypoints },
        (status, result) => {
          if (status === 'complete') {
            this.setState({ fullScreenLoading: true })
            const path = []  // 路径经纬度数组初始化
            // 从响应里面拿到所有的点位
            result.routes[0].steps.forEach(step => step.path.forEach(x => path.push([x.lng, x.lat])))
            // 创建折线图
            const Polyline = new AMap.Polyline({
              path,                           // 设置线覆盖物路径
              showDir: true,
              strokeColor: colors[index],     // 线颜色
              strokeWeight: 6                 // 线宽
            })
            this.routingPlans[index].push(Polyline)
            map.add(Polyline)
            isLoad[i] = false
            this.setState({ fullScreenLoading: isLoad.some(x => x) })
            // this.sxYm()
          } else message.error('获取驾车数据失败')
        })
    })
  }

  /**
   * 重置数据
   * @author ChenGuangLong
   * @since 2024/11/12 上午9:49
  */
  resetData = () => {
    // 清空地图覆盖物
    this.map.clearMap()
    this.routingPlans = []
    this.groupMarkers = []
    this.warehouseMarker = undefined
    // 清空数据
    this.setState({
      scheduleResults: [],
      selectOrderList: [],
      selectVehicles: [],
      unassignedNodes:[],
      showButtonDrawer: true,
      showResultDrawer: false,
      showProgress: -1,
      errMessages: [],
    })
  }

  /**
   * 生成排车单（批量）
   * @author ChenGuangLong
   * @since 2024/11/12 上午9:47
  */
  createSchedules = () => {
    const { orderList } = this
    const { scheduleResults } = this.state
    let errFlag = false   // 错误标志,forEach的return只能结束内部方法，不能结束外层循环，外层继续循环继续提示报错，到生成排车单前用标记看看生不生成
    const  scheduleParamBodyList = []  // 准备排车单创建列表
    scheduleResults.forEach((link, index) => {
      const linkOrders = []   // 一条路线的全部单（排车单全部明细：一个门店可能有多张单)
      let deliveryNumber = 1
      link.forEach(order => {   // 每个门店的全部单都找出来
        let store = orderList.filter(x => x.deliveryPoint.uuid === order.deliveryPoint.uuid)
        store = store.map(item => ({ ...item, deliveryNumber: deliveryNumber++ }))  // 好像不用deliveryNumber，就是按顺序分deliveryNumber的
        linkOrders.push(...store)
      })
      // 禁止整车为转运单 针对福建仓
      if (linkOrders.length > 0 && linkOrders.filter(e => e.orderType === 'Transshipment').length === linkOrders.length) {
        errFlag = true
        return message.error(`线路${index + 1}:禁止整车为转运单排车！`)
      }
      // ——————————开始构建参数——————————
      const orderType = uniqBy(linkOrders.map(x => x.orderType)).shift() // 从去重并返回第一个订单类型。
      const orderTypeArr = ['Delivery', 'DeliveryAgain', 'Transshipment', 'OnlyBill']
      const type = orderTypeArr.includes(orderType) ? 'Job' : 'Task'   // 排车单类型
      // todo 司机
      const driver = null // selectEmployees.find(x => x.memberType == 'Driver');
      // 订单明细
      const details = linkOrders.map(item => {
        if (!item.isSplit) item.isSplit = item.cartonCount === item.stillCartonCount ? 0 : 1
        item.cartonCount = item.stillCartonCount
        item.scatteredCount = item.stillScatteredCount
        item.containerCount = item.stillContainerCount
        item.coldContainerCount = item.stillColdContainerCount
        item.freezeContainerCount = item.stillFreezeContainerCount
        item.insulatedBagCount = item.stillInsulatedBagCount
        item.insulatedContainerCount = item.stillInsulatedContainerCount
        item.freshContainerCount = item.stillFreshContainerCount

        if (item.reviewed) {
          item.realCartonCount = item.stillCartonCount
          item.realScatteredCount = item.stillScatteredCount
          item.realContainerCount = item.stillContainerCount

          item.realColdContainerCount = item.stillColdContainerCount
          item.realFreezeContainerCount = item.stillFreezeContainerCount
          item.realInsulatedBagCount = item.stillInsulatedBagCount
          item.realInsulatedContainerCount = item.stillInsulatedContainerCount
          item.realFreshContainerCount = item.stillFreshContainerCount
        }
        return {
          ...item,
          orderUuid: item.orderUuid || item.uuid,
          orderNumber: item.orderNumber || item.billNumber,
        }
      })
      // 主表汇总数据
      const orderSummary = groupByOrder(details)
      // 司机数据
      const carrier = driver
        ? {
          uuid: driver.UUID,
          code: driver.CODE,
          name: driver.NAME,
        }
        : {}
      // 请求体
      scheduleParamBodyList.push({
        type,
        vehicle: {
          // uuid: selectVehicle.UUID,
          // code: selectVehicle.CODE,
          // name: selectVehicle.PLATENUMBER,
        },
        vehicleType: {
          // uuid: selectVehicle.VEHICLETYPEUUID,
          // code: selectVehicle.VEHICLETYPECODE,
          // name: selectVehicle.VEHICLETYPENAME,
        },
        carrier: { ...carrier },
        details,
        memberDetails: [],
        // memberDetails: selectEmployees.map((x, i) => ({
        //   line: i + 1,
        //   member: { uuid: x.UUID, code: x.CODE, name: x.NAME },
        //   memberType: x.memberType,
        // })),
        ...orderSummary,
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        note: '',
      })
    })

    if (errFlag) return
    if (scheduleParamBodyList.length !== scheduleResults.length) return message.error('线路数和生成数不相等!')
    // ——————————开始请求创建排车单——————————
    const errMessages = []  // 记录失败信息
    this.setState({ showProgress: 1 })
    scheduleParamBodyList.forEach(async (paramBody, index) => {
      const linkName = `线路${index + 1}`
      const res = await save(paramBody)
      if (res.success) message.success(`${linkName}创建成功`)
      else {
        message.error(`${linkName}创建失败`)
        errMessages.push(`${linkName}:${res.message}`)
        this.setState({ errMessages: [...errMessages] })
      }
      this.setState({ showProgress: parseFloat(((index + 1) / scheduleParamBodyList.length * 100).toFixed(1)) })

    })
    // ——————创建结束后——————
    if (errMessages.length === 0) this.setState({ showProgress: -1 })
    this.orderPoolModalRef?.refreshOrderPool?.()      // 刷新订单池
    this.vehiclePoolModalRef?.refreshVehiclePool?.()  // 刷新车辆池

  }

  render () {
    const {
      showSmartSchedulingModal,
      showMenuModal,
      showVehicleModal,
      showResultDrawer,
      showButtonDrawer,
      btnLoading,
      routingConfig,
      scheduleResults = [],
      selectOrderList = [],
      selectVehicles = [],
      showInputVehicleModal,
      fullScreenLoading,
      childrenIndex,
      isMultiVehicle,
      showProgress,
      errMessages,
    } = this.state

    return (
      <div className={styles.SmartScheduling}>
        <FullScreenLoading show={fullScreenLoading}/>
        {/* ——————————————————————左边按钮侧边栏———————————————————— */}
        <div style={{ left: showButtonDrawer ? '0px' : '-250px' }} className={styles.leftButtonSidebar}>
          <Row gutter={[8, 16]}>
            <Col span={12}>
              <Button onClick={() => this.setState({ showMenuModal: true })} block>
                加载订单
              </Button>
            </Col>
            <Col span={12}>
              <Button onClick={() => this.setState({ showVehicleModal: true })} block>
                加载车辆
              </Button>
            </Col>
          </Row>
          <Button
            block
            type="primary"
            onClick={() => this.setState({ showSmartSchedulingModal: true })}
          >
            智能调度
          </Button>
        </div>

        <span   // ——————————————————————左侧边栏开关————————————————————
          className={styles.leftSidebarSwitch}
          style={{ left: showButtonDrawer ? '250px' : '0px', display: scheduleResults.length ? 'none' : 'block' }}
          onClick={() => this.setState({ showButtonDrawer: !showButtonDrawer })}
        >
          <Icon
            type="left"
            className={styles.iconStyle}
            style={{ transform: showButtonDrawer ? 'unset' : 'rotate(180deg)' }}
          />
        </span>

        {/* ——————————————————————高德地图———————————————————— */}
        <div id="smartSchedulingAMap" style={{ width: '100vw', height: 'calc(100vh - 138px)' }}/>

        <span   // ——————————————————————右侧边栏开关————————————————————
          className={styles.rightSidebarSwitch}
          style={{ right: showResultDrawer ? this.RIGHT_DRAWER_WIDTH : '-15px' }}
          onClick={() => this.setState({ showResultDrawer: !showResultDrawer })}
        >
          <Icon
            type="left"
            className={styles.iconStyle}
            style={{ transform: showResultDrawer ? 'rotate(180deg)' : 'unset' }}
          />
        </span>
        <Drawer   // ——————————————————————侧边栏(智能调度结果)————————————————————
          title="智能调度结果"
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
                className={styles.resultCard}
                onClick={() => this.routePlanning(index)}
                style={{
                  border: this.routingPlans[index] ? `${colors[index]} solid 2px` : 'unset',
                  width: this.RIGHT_DRAWER_WIDTH - 40,
                }}
              >
                <div className={styles.cardTagColor} style={{ background: colors[index] }}/>
                <span style={{ fontSize: '16px' }}>线路{index + 1}</span>
                <Divider style={{ margin: 6 }}/>
                门店数: {orders.length} &nbsp;&nbsp;
                总重量: {Math.round(orders.reduce((acc, cur) => acc + cur.weight, 0)) / 100} &nbsp;&nbsp;
                总体积: {Math.round(orders.reduce((acc, cur) => acc + cur.volume, 0)) / 100} &nbsp;&nbsp;
                <br/>
                整件数: {orders.reduce((acc, cur) => acc + cur.cartonCount, 0)} &nbsp;&nbsp;
                散件数: {orders.reduce((acc, cur) => acc + cur.scatteredCount, 0)} &nbsp;&nbsp;
                周转箱: {orders.reduce((acc, cur) => acc + cur.containerCount, 0)} &nbsp;&nbsp;
                {isMultiVehicle &&
                  <>
                    冷藏周转筐：{orders.reduce((acc, cur) => acc + cur.coldContainerCount, 0)} &nbsp;&nbsp;
                    冷冻周转筐：{orders.reduce((acc, cur) => acc + cur.freezeContainerCount, 0)} &nbsp;&nbsp;
                    保温袋: {orders.reduce((acc, cur) => acc + cur.insulatedBagCount, 0)} &nbsp;&nbsp;
                    鲜食筐：{orders.reduce((acc, cur) => acc + cur.freshContainerCount, 0)} &nbsp;&nbsp;
                  </>
                }

                <Divider style={{ margin: 6 }}/>
                {/* ————————————打开线路明细抽屉—————————— */}
                <Button type="link" onClick={e => e.stopPropagation() || this.setState({ childrenIndex: index })}>
                  明细
                </Button>
                {/* ——————————在地图上聚焦这条线路的点—————————— */}
                <Button
                  type="link"
                  onClick={e => {
                    e.stopPropagation()
                    this.map.setFitView(this.groupMarkers[index], false, [60, 60, 60, 500]) // 不是立即过渡 四周边距，上、下、左、右
                  }}
                >
                  聚焦
                </Button>
              </div>
            )}

            <div className={styles.resultBottom}>
              {/* ——————地图底色转换按钮——————— */}
              <Popover
                content={
                  <>
                    <div style={{textAlign: 'center'}}>地图底色设置</div>
                    {Object.keys(mapStyle).map(name =>
                      <div
                        key={name}
                        className={styles.mapStyleItem}
                        style={this.mapStyle === name ? { boxShadow: 'inset 1px 1px 4px 0 #39487061' } : {}}
                        onClick={() => {
                          this.map.setMapStyle(`amap://styles/${mapStyle[name]}`)
                          this.sxYm(this.mapStyle = name)
                          window.localStorage.setItem('mapStyle', name)
                        }}
                      >
                        {name}
                      </div>
                    )}
                  </>
                }
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    const mapStyleName = this.mapStyle === '标准' ? '幻影黑' : '标准'
                    this.map.setMapStyle(`amap://styles/${mapStyle[mapStyleName]}`)
                    this.sxYm(this.mapStyle = mapStyleName)
                    window.localStorage.setItem('mapStyle', mapStyleName)
                  }}
                >
                  <Icon type="skin" theme={this.mapStyle === '标准' ? 'outlined' : 'filled'}/>
                </Button>
              </Popover>
              {/* ——————————放弃本次结果按钮—————— */}
              <Popconfirm title="确定放弃本次智能调度结果?" onConfirm={this.resetData}>
                <Popover content="放弃本次智能调度结果">
                  <Button type="danger" style={{ marginRight: 8 }}><Icon type="delete"/></Button>
                </Popover>
              </Popconfirm>
              {/* ——————————生成排车单按钮———————— */}
              <Button onClick={this.createSchedules} type="primary">生成排车单</Button>
            </div>
          </div>
          :
          <Empty/>
        }
          <Drawer // ————————————————————智能调度结果明细————————————————————
            title={`线路${childrenIndex + 1}明细`}
            width={350}
            closable={false}
            bodyStyle={{ padding: 8 }}
            visible={childrenIndex >= 0}
            onClose={() => this.setState({ childrenIndex: -1 })}
          >
            <div style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}>
              {scheduleResults[childrenIndex]?.map((order, index) =>
                <div className={styles.detailCard}>
                  <b className={styles.detailIndex}>{index + 1}</b>
                  <b>{convertCodeName(order.deliveryPoint)}</b>
                  <div className={styles.w50}>线路：{order.archLine?.code}</div>
                  <div className={styles.w50}>备注：{order.lineNote}</div>
                  <Divider style={{ margin: 6 }}/>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                    <span>整件数:{order.cartonCount}</span>
                    <span>散件数:{order.scatteredCount}</span>
                    <span>周转箱:{order.containerCount}</span>
                    <span>体积:{order.volume.toFixed(2)}</span>
                    <span>重量:{(order.weight / 1000).toFixed(3)}</span>
                  </div>
                  {isMultiVehicle &&  // 多载具
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8}}>
                      <span>冷藏周转筐：{order.coldContainerCount}</span>
                      <span>冷冻周转筐：{order.freezeContainerCount}</span>
                      <span>保温袋：{order.insulatedBagCount}</span>
                      <span>鲜食筐：{order.freshContainerCount}</span>
                    </div>
                  }
                </div>
              )}
            </div>
          </Drawer>
        </Drawer>

        <Modal    // ————————————————————————————智能调度弹窗——————————————————————————————
          title="智能调度"
          visible={showSmartSchedulingModal}
          okText="开始智能调度"
          width="100vw"
          style={{ top: 0 }}
          className={styles.modalxxxxxx}
          onCancel={() => this.setState({ showSmartSchedulingModal: false })}
          confirmLoading={btnLoading}
          getContainer={false}    // 挂载到当前节点，因为选单弹窗先弹出又在同一个节点 就会在底下显示看不到
          onOk={this.intelligentScheduling}
        >
          <Row style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
            <Col span={12}>
              <Button onClick={() => this.setState({ showMenuModal: true })}>
                加载订单
              </Button>
              &nbsp;&nbsp;
              {selectOrderList.length ?
                <>
                  <Button onClick={() => this.setState({ selectOrderList: [] })}>清空</Button>&nbsp;&nbsp;
                  <span>总重量：{(selectOrderList.reduce((a, b) => a + b.weight, 0) / 1000).toFixed(3)}t</span>&nbsp;&nbsp;
                  <span>总体积：{selectOrderList.reduce((a, b) => a + b.volume, 0).toFixed(2)}m³</span>&nbsp;&nbsp;
                  <span>配送点数量：{selectOrderList.length}</span>
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={selectOrderList}
                    scroll={{ x: '38vw', y: 'calc(100vh - 217px)' }}
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
                              onClick={() => this.setState({
                                selectOrderList: selectOrderList.filter((_v, i) => i !== index)
                              })}
                            >
                              移除
                            </Button>
                          </div>
                      }
                    ]}
                  />
                </>
                :
                <Empty description="请先加载订单"/>
              }
            </Col>
            <Col span={12}>
              {/* 配置 设置边框 */}
              <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 5, marginBottom: 5 }}>
                <div>配置</div>
                排线排序⽅式：
                <Select
                  value={routingConfig.sortRule}
                  style={{ width: 120 }}
                  onChange={v => this.setState({ routingConfig: { ...routingConfig, sortRule: v } })}
                >
                  <Option value={0}>距离最短</Option>
                  <Option value={1}>时间最短</Option>
                </Select>
                &nbsp;&nbsp;
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
                &nbsp;&nbsp;
                {/* 是否算返回仓库： */}
                {/* <Select */}
                {/*   value={routingConfig.isBack} */}
                {/*   style={{ width: 120 }} */}
                {/*   onChange={v => this.setState({ routingConfig: { ...routingConfig, isBack: v } })} */}
                {/* > */}
                {/*   <Option value={0}>是</Option> */}
                {/*   <Option value={1}>否</Option> */}
                {/* </Select> */}
              </div>

              <div>
                <Button onClick={() => this.setState({ showInputVehicleModal: true })}>
                  手动添加车辆参数
                </Button>
                <VehicleInputModal
                  open={showInputVehicleModal}
                  onClose={() => this.setState({ showInputVehicleModal: false })}
                  addVehicle={vehicle => this.setState({ selectVehicles: [...selectVehicles, vehicle] })}
                />
                &nbsp;&nbsp;
                <Button   // 打开运力池按钮
                  onClick={() => {
                    this.setState({ showVehicleModal: true })
                    if (selectVehicles.length) message.warning('此操作会覆盖本来选择的车辆数据，如果不想被覆盖可以选择手动添加按钮！')
                  }}
                >
                  加载车辆参数
                </Button>
                &nbsp;&nbsp;
                {selectVehicles.length ?
                  <>
                    <Button onClick={() => this.setState({ selectVehicles: [] })}>清空</Button>&nbsp;&nbsp;
                    <span>总重量：{selectVehicles.reduce((a, b) => a + b.weight * b.vehicleCount, 0).toFixed(2)}t</span>&nbsp;&nbsp;
                    <span>总体积：{selectVehicles.reduce((a, b) => a + b.volume * b.vehicleCount, 0).toFixed(2)}m³</span>&nbsp;&nbsp;
                    <span>车辆数量：{selectVehicles.reduce((a, b) => a + b.vehicleCount, 0)}</span>&nbsp;&nbsp;
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={selectVehicles}
                      scroll={{ x: '38vw', y: 'calc(100vh - 280px)' }}
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
                                disabled={record.vehicleCount <= 1}
                                onClick={() => {
                                  let { selectVehicles: vehicles } = this.state
                                  vehicles[index].vehicleCount--
                                  this.setState({ selectVehicles: vehicles })
                                }}
                              >
                                -
                              </Button>
                              &nbsp;{record.vehicleCount}&nbsp;
                              <Button
                                size="small"
                                onClick={() => {
                                  let { selectVehicles: vehicles } = this.state
                                  vehicles[index].vehicleCount++
                                  this.setState({ selectVehicles: vehicles })
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
                              onClick={() => this.setState({
                                selectVehicles: selectVehicles.filter((_, i) => i !== index)
                              })}
                            >
                              移除
                            </Button>
                          )
                        }
                      ]}
                    />
                  </>
                  :
                  <Empty description="载入排车车辆参数，系统会按照车辆参数进行排排线"/>
                }
              </div>
            </Col>
          </Row>
        </Modal>

        <Modal  // ——————————————————————————————订单池弹窗——————————————————————————————————
          title="订单池"
          width="90vw"
          okText="选定"
          style={{ top: 20 }}
          visible={showMenuModal}
          onCancel={() => this.setState({ showMenuModal: false })}
          onOk={() => this.handleOrders()}  // 不能直接写this.handleOrders，会把event作为参数传进去
        >
          <OrderPoolModal ref={ref => (this.orderPoolModalRef = ref)}/>
        </Modal>

        <Modal  // ——————————————————————————————运力池弹窗——————————————————————————————————
          title="运力池"
          width="90vw"
          okText="选定"
          style={{ top: 20 }}
          visible={showVehicleModal}
          onCancel={() => this.setState({ showVehicleModal: false })}
          onOk={() => {
            if (!this.vehiclePoolModalRef.state) return message.error('数据异常，请刷新页面重试')
            const { vehicleData, vehicleRowKeys } = this.vehiclePoolModalRef.state
            if (!vehicleRowKeys.length) return message.error('请选择车辆')
            let selectVehicleList = vehicleData.filter(v => vehicleRowKeys.includes(v.UUID))
            if (selectVehicleList.some(v => !v.BEARVOLUME || !v.BEARWEIGHT)) {
              message.warning('已过滤没有重量体积的车辆')
              selectVehicleList = selectVehicleList.filter(v => v.BEARVOLUME && v.BEARWEIGHT)
            }
            if (selectVehicleList.length === 0) return message.error('选择车辆均为无效车辆')
            // ——————————————车辆分组——————————————
            // 创建一个空对象来存储分组后的车量数据
            const groupedData = {}
            // 遍历原始数据
            selectVehicleList.forEach(item => {
              // 创建一个唯一键，由重量、体积和班组组成
              // const key = `${item.BEARWEIGHT}-${Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100}-${item.VEHICLEGROUP}`
              const key = `${item.BEARWEIGHT}-${Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100}`
              // 如果当前组合不存在，则创建一个新的条目
              if (!groupedData[key]) {
                groupedData[key] = {
                  vehicleCount: 0,
                  // vehicleGroup: item.VEHICLEGROUP,
                  weight: parseFloat(item.BEARWEIGHT.replace(/[^0-9.]/g, '')), // 转换为数字,
                  volume: Math.round(item.BEARVOLUME * item.BEARVOLUMERATE) / 100,
                }
              }
              // 更新车辆数量
              groupedData[key].vehicleCount++
            })
            // 将分组后的数据转换为数组
            const groupedVehicle = Object.values(groupedData)
            this.setState({ showVehicleModal: false, selectVehicles: groupedVehicle })
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
          visible={showProgress >= 0 || errMessages.length > 0}
          closable={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <Progress percent={showProgress} status={showProgress < 100 ? 'active' : 'success'}/>
            {errMessages.map(msg => <div>{msg}</div>)}
            {showProgress === 100 &&
              <>
                <Button onClick={() => this.resetData()}>
                  继续新的排线
                </Button>
                <Button onClick={() => this.resetData() || this.props.history.push('/tmscode/dispatch')}>
                  查看排车单(跳转到配送调度页面)
                </Button>
              </>
            }
          </div>
        </Modal>
      </div>
    )
  }
}