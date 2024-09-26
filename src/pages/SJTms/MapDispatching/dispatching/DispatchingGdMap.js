/*
 * 地图排车
 * @author ChenGuangLong
 * @since 2024/9/23 12:01
*/
import React, { Component } from 'react'
import {
  Divider, Modal, Button, Row, Col, Spin, message, Input,
  List, Avatar, Icon, Checkbox,
} from 'antd'
import { uniqBy } from 'lodash'
import { getSchedule, getDetailByBillUuids } from '@/services/sjitms/ScheduleBill'
import style from './DispatchingMap.less'
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon'
import { queryAuditedOrderByParams, GetConfig } from '@/services/sjitms/OrderBill'
import { queryDict, queryData, dynamicQuery } from '@/services/quick/Quick'
import { loginCompany, loginOrg } from '@/utils/LoginContext'
import truck from '@/assets/common/truck.svg'
import SearchForm from '@/pages/SJTms/MapDispatching/dispatching/SearchForm'
import GdMap from '@/components/GdMap'
import startMarkerIcon from '@/assets/common/startMarker.png'

/**
 * build简化Flex Div代码 +++
 * @author ChenGuangLong
 * @since 2024/5/16 11:03
 */
const bFlexDiv = (name, value, bold = true) => (
  <div style={{ flex: 1, fontWeight: bold ? 'bold' : 'normal' }}>
    {name}:{value}
  </div>
)
/**
 * build简化Col Div代码 +++
 * @author ChenGuangLong
 * @since 2024/5/17 9:18
 */
const bColDiv2 = (name, value, span = 4) => (
  <Col span={span}>
    <div>{name}</div>
    <div>{value}</div>
  </Col>
)

export default class DispatchMap extends Component {
  basicOrders = []
  isSelectOrders = []
  basicScheduleList = []
  select = null
  rectangleTool = null                           // 存储创建好的矩形选取工具
  startMarker = null                             // 起始点（仓库位置坐标)
  drivingList = []                                    // 路线规划数据
  gdMapRef = React.createRef()    // 高德地图ref
  state = {
    allTotals: {
      cartonCount: 0,               // 整件数
      scatteredCount: 0,            // 散件数
      containerCount: 0,            // 周转箱
      coldContainerCount: 0,        // 冷藏周转筐+++
      freezeContainerCount: 0,      // 冷冻周转筐+++
      insulatedContainerCount: 0,   // 保温箱+++
      insulatedBagCount: 0,         // 保温袋+++
      freshContainerCount: 0,       // 鲜食筐+++
      volume: 0,                    // 体积
      weight: 0,                    // 重量,
      totalCount: 0,                // 总件数
      stores: 0,                    // 总门店数
    },
    visible: false,
    loading: false,
    startPoint: '',
    pageFilter: [],
    orders: [],
    orderMarkers: [],
    ScheduledMarkers: [],
    showScheduled: false,           // 显示已排
    scheduleList: [],
    isEdit: false,
    schedule: undefined,
    closeLeft: false,
    checkSchedules: [],
    checkScheduleOrders: [],
    bearweight: 0,
    volumet: 0,
    multiVehicle: false,              // 是否多载具+++
    mapSelect: false,                 // 地图框选
    showLine: false,                  // 显示线路
  }

  colors = [
    '#0069FF',
    '#EF233C',
    '#20BF55',
    '#07BEB8',
    '#FF715B',
    '#523F38',
    '#FF206E',
    '#086375',
    '#A9E5BB',
    '#8F2D56',
    '#004E98',
    '#5D576B',
    '#248232',
    '#9A031E',
    '#8E443D',
    '#F15152',
    '#F79256',
    '#640D14',
    '#3F88C5',
    '#0FA3B1',
  ]

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this)
    this.initConfig()  // 设置是否多载具
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.keyDown)
  }

  /**
   * 获取时捷配置中心配置，拿到改调度中心是否是多载具的+++
   * @author ChenGuangLong
   * @since 2024/5/17 14:57
   */
  initConfig = async () => {
    const configResponse = await GetConfig('dispatch', loginOrg().uuid)
    if (configResponse?.data?.[0]?.multiVehicle)
      this.setState({ multiVehicle: configResponse?.data?.[0]?.multiVehicle === '1' })
  }

  keyDown = (event, ...args) => {
    const e = (event || window.event || args.callee.caller?.['arguments']?.[0]) ?? {}
    if (e?.keyCode === 81 && e.altKey) this.saveSchedule()
  }

  /** 打开地图 */
  show = orders => {
    this.setState({ visible: true })
    // 设置起始点
    queryDict('warehouse').then(res => {
      this.setState({ startPoint: res.data.find(x => x.itemValue === loginOrg().uuid)?.description })
    })
    if (orders) {
      const selectedOrdersCount = orders.filter(e => e.isSelect).length  // 首先计算出已选择的订单数量
      orders.filter(x => !x.isSelect).forEach((order, index) => {
        order.isSelect = true
        order.sort = selectedOrdersCount + index + 1
      })
      this.isSelectOrders = orders
    }
  }

  /** 关闭地图 */
  hide = () => {
    this.setState({
      visible: false,
      isEdit: false,
      checkScheduleOrders: [],
      checkSchedules: [],
      bearweight: 0,
      volumet: 0,
    })
    this.clusterLayer = undefined
    this.contextMenu = undefined
    this.isSelectOrders = []
    setTimeout(() => {
      window.removeEventListener('keydown', this.keyDown)
    }, 500)
    this.props.addEvent()
  }

  /** 查询 */
  refresh = params => {
    this.setState({ loading: true })
    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ]
    let { pageFilter } = this.state
    const filter = { pageSize: 4000, superQuery: { matchType: 'and', queryParams: [] } }
    if (params) pageFilter = params

    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled||Scheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ]
    // 查询已审核订单
    queryAuditedOrderByParams(filter).then(response => {
      if (response.success) {
        const result = response.data?.records ?? []
        const data = result.filter(x => x.longitude && x.latitude)
        // 计算所有
        const allTotals = this.getAllTotals(data.filter(e => e.stat !== 'Scheduled'))

        // 根据门店去重
        const flagObj = {}
        const orderMarkersAll = data.reduce((cur, next) => {
          if (!flagObj[next.deliveryPoint.code]) {    // 如果没有出现过该code
            flagObj[next.deliveryPoint.code] = true  // 标记为已出现
            cur.push(next)                           // 将该订单添加到结果数组中
          }
          return cur                                 // 返回结果的数组
        }, [])

        const orderMarkers = orderMarkersAll.filter(e => e.stat !== 'Scheduled')     // 未排车marker
        const ScheduledMarkers = orderMarkersAll.filter(e => e.stat === 'Scheduled') // 已排车marker

        // 获取选中订单相同区域门店
        const isSelectOrdersArea =
          this.isSelectOrders?.length > 0 ? uniqBy(this.isSelectOrders.map(e => e.shipAreaName)) : []

        orderMarkers.forEach(e => {
          if (this.isSelectOrders && this.isSelectOrders.length > 0) {
            const x = this.isSelectOrders.find(item => item.deliveryPoint.code === e.deliveryPoint.code)
            if (isSelectOrdersArea.indexOf(e.shipAreaName) !== -1) {
              e.isSelect = true
              e.sort = x?.sort ? x.sort : undefined
            }
          }
        })
        const filterData = data.filter(e => e.stat !== 'Scheduled')
        this.basicOrders = filterData
        this.setState(
          { orders: filterData, orderMarkers, allTotals, ScheduledMarkers, isEdit: false },
          () => {
            setTimeout(() => {
              window.addEventListener('keydown', this.keyDown)
            }, 500)
          }
        )

        // 地图上添加门店点位
        window.setTimeout(() => {
          this.gdMapRef.current.clearMap()        // 清除地图所有覆盖物(不包括路径)
          this.gdMapRef.current.addStoreMarkers(orderMarkers, this.setMarkerLabel, 'myj',this.onClickMarker)
          this.gdMapRef.current.map.setFitView() // 无参数时，自动自适应所有覆盖物
          this.gdMapContextMenu()
        }, 500)
      }

      // 查询排车单
      const queryParams = {
        page: 1,
        pageSize: 100,
        quickuuid: 'sj_itms_schedulepool',
        superQuery: {
          matchType: 'and',
          queryParams: [
            { field: 'STAT', type: 'VarChar', rule: 'eq', val: 'Saved' },
            { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
            { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
          ],
        },
      }
      queryData(queryParams).then(res => {
        this.setState({ scheduleList: res?.data?.records })
        this.basicScheduleList = res?.data?.records
      })
      this.setState({ loading: false, pageFilter })
    })
  }

  /**
   * 刷新美宜佳坐标
   * @param {Array} [orderMarkerList] 美宜佳点位列表 传就用传的 不传就用state的orderMarkers
   * @author ChenGuangLong
   * @since 2024/9/26 14:25
   */
  reloadMyjMarkers = orderMarkerList => {
    const { orderMarkers } = this.state // 其实有些地方我没看懂 有些地方只修改了orders，但是orderMarkers就变了？ 共用地址导致？
    const { removeMarkersByType, addStoreMarkers } = this.gdMapRef.current
    removeMarkersByType('myj')
    addStoreMarkers(orderMarkerList ?? orderMarkers, this.setMarkerLabel, 'myj', this.onClickMarker)
  }

  /**
   * 右键菜单
   * @author ChenGuangLong
   * @since 2024/9/24 9:47
   */
  gdMapContextMenu = () => {
    const { AMap, map } = this.gdMapRef.current
    // 创建右键菜单
    const contextMenu = new AMap.ContextMenu()
    // 地图中添加鼠标工具MouseTool插件
    const mouseTool = new AMap.MouseTool(map)
    mouseTool.on('draw', () => mouseTool.close(false)) // 画完关闭 不给第二次机会

    contextMenu.addItem('排车(ALT+Q)', () => {
      contextMenu.close()
      this.saveSchedule()
    }, 1)
    contextMenu.addItem('取消选中', () => {
      contextMenu.close()
      const { orders, orderMarkers } = this.state
      orders.forEach(item => {
        item.isSelect = false
        item.sort = undefined
      })
      this.reloadMyjMarkers(orderMarkers) // 重新加载美宜佳图标
      this.setState({ orders })
    }, 2)
    contextMenu.addItem('路线规划', () => {
      contextMenu.close()
      const { orders } = this.state
      const selectPoints = orders.filter(x => x.isSelect)
      if (selectPoints.length === 0) return message.error('请选择需要排车的门店！')
      this.openLine(selectPoints)
    }, 3)
    contextMenu.addItem('距离量测', () => {
      mouseTool.rule()
      contextMenu.close()
    }, 4)
    // contextMenu.addItem('导航', () => {
    // }, 5)
    contextMenu.addItem('显示已排', () => {
      contextMenu.close()
      const { ScheduledMarkers, showScheduled } = this.state
      if (!showScheduled) {
        this.gdMapRef.current.addStoreMarkers(ScheduledMarkers, this.setMarkerLabel, 'van')
        this.setState({ showScheduled: true })
      } else {
        map.remove(this.gdMapRef.current.markerObj.van)
        this.setState({ showScheduled: false })
      }
    }, 6)
    // 地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', e => contextMenu.open(map, e.lnglat))
  }

  /**
   * 设置坐标点提示文字
   * @return {string} 高德要的一定是字符串！！！
   * @author ChenGuangLong
   * @since 2024/9/23 17:07
   */
  setMarkerLabel = (order) => {
    const { multiVehicle } = this.state
    const infoTotals = this.getOrderTotal(order.deliveryPoint.code)
    const showMultiVehicle = () =>
      multiVehicle ? `
        <div style="display: flex;">
          <div style="flex: 1;">冷藏周转筐</div>
          <div style="flex: 1;">冷冻周转筐</div>
          <div style="flex: 1;">保温袋</div>
          <div style="flex: 1;">鲜食筐</div>
        </div>
        <div style="display: flex;">
          <div style="flex: 1;">${infoTotals.coldContainerCount}</div>
          <div style="flex: 1;">${infoTotals.freezeContainerCount}</div>
          <div style="flex: 1;">${infoTotals.insulatedBagCount}</div>
          <div style="flex: 1;">${infoTotals.freshContainerCount}</div>
        </div>
        ` : ''

    return `
    <div style="width: auto; height: auto; padding: 5px; background: #FFF;">
      <div style="font-weight: bold; white-space: nowrap;">
        [${order.deliveryPoint.code}]${order.deliveryPoint.name}
      </div>
      <hr style="margin: 5px 0 0 0;" />
      <div style="display: flex;">
        <div style="flex: 1;">线路：${order.archLine?.code ?? ''}</div>
        <div style="flex: 1;">备注：${order.archLine?.lineNote ?? ''}</div>
      </div>
      <div>配送区域：${order?.shipAreaName ?? ''}</div>
      <div>门店地址：${order?.deliveryPoint?.address ?? ''}</div>

      <div style="display: flex; margin-top: 5px; text-align: center;">
        <div style="flex: 1;">整件数</div>
        <div style="flex: 1;">散件数</div>
        <div style="flex: 1;">周转箱</div>
        <div style="flex: 1;">体积</div>
        <div style="flex: 1;">重量</div>
      </div>
      <div style="display: flex; text-align: center;">
        <div style="flex: 1;">${infoTotals.cartonCount}</div>
        <div style="flex: 1;">${infoTotals.scatteredCount}</div>
        <div style="flex: 1;">${infoTotals.containerCount}</div>
        <div style="flex: 1;">${infoTotals.volume}</div>
        <div style="flex: 1;">${(infoTotals.weight / 1000).toFixed(3)}</div>
      </div>
      ${showMultiVehicle()}
    </div>
  `
  }

  /**
   * 点击坐标点事件
   * @author ChenGuangLong
   * @since 2024/9/25 15:10
  */
  onClickMarker = (order) => {
    this.onChangeSelect(!order.isSelect, order)
  }

  /** 选门店 */
  onChangeSelect = (checked, order) => {
    const { orders } = this.state
    const num = orders.filter(e => e.isSelect).length
    if (!checked) {
      orders.forEach(e => {
        if (e.sort > order.sort) e.sort -= 1    // 取消时-1
      })
    }
    if (order) {
      order.isSelect = checked
      order.sort = checked ? num + 1 : null
      this.setState({ orders })
    }
    this.reloadMyjMarkers() // 重新加载美宜佳图标
  }

  /** 清空按钮 */
  onReset = () => {
    const { orders } = this.state
    orders.forEach(order => {
      order.isSelect = false
      order.sort = null
    })
    this.setState({
      orders,
      isEdit: false,
      checkScheduleOrders: [],
      checkSchedules: [],
    })
    this.storeFilter('')
    this.searchFormRef?.onSubmit()
    this.isSelectOrders = []
  }

  /**
   * 创建矩形
   * @author ChenGuangLong
   * @since 2024/9/24 17:23
   */
  switchRectangleSelect = () => {
    const { mapSelect, orders, orderMarkers } = this.state
    const { AMap, map } = this.gdMapRef.current
    if (!this.rectangleTool) {  // 第一次先创建
      this.rectangleTool = new AMap.MouseTool(map)
      this.rectangleTool.on('draw', (e) => {
        const southWest = e.obj.getOptions().bounds.getSouthWest()  // 西南角坐标
        const northEast = e.obj.getOptions().bounds.getNorthEast()  // 东北角坐标
        const rectanglePath = [       // 矩形路径
          [southWest.lng, northEast.lat],   // 矩形左上角坐标(西北角)
          [northEast.lng, northEast.lat],   // 矩形右上角坐标(东北角)
          [northEast.lng, southWest.lat],   // 矩形右下角坐标(东南角)
          [southWest.lng, southWest.lat],   // 矩形左下角坐标(西南角)
        ]
        // 筛选没有选中，且在矩形内的订单
        orderMarkers.filter(order => !order.isSelect).forEach(order => {
          const pt = { lng: order.longitude, lat: order.latitude }
          const num = orders.filter(item => item.isSelect).length
          order.isSelect = AMap.GeometryUtil.isPointInRing(pt, rectanglePath) // 判断点是否在矩形内
          order.sort = num +1
        })
        map.remove(e.obj) // 清除矩形
        this.setState({ orders })
        this.reloadMyjMarkers(orderMarkers) // 重新加载美宜佳图标
      })
    }
    // 画矩形开关
    if (!mapSelect) {
      this.rectangleTool.rectangle({  // 同Polygon的Option设置
        fillColor: '#fff',
        strokeColor: '#80d8ff'
      })
      this.setState({ mapSelect: true })
    } else {
      this.setState({ mapSelect: false })
      this.rectangleTool.close(true)   // 关闭，并清除覆盖物(不清除（false）也没关系
    }
  }

  /**
   * 显示线路
   * @author ChenGuangLong
   * @since 2024/9/21 9:03
   */
  openLine = selectPoints => {
    const { startPoint } = this.state
    const { AMap, map, chunkArrayWithOverlap } = this.gdMapRef.current
    // 先清除上次绘制的路线
    if (this.drivingList.length) this.closeLine(true)

    // 仓库点对象(给线路用)
    const [latitude, longitude] = startPoint.split(',')
    const warehousePointObj = {
      longitude: Number(longitude),
      latitude: Number(latitude),
    }

    // 起点坐标（绘制图标用）
    this.startMarker = new AMap.Marker({
      position: [Number(longitude), Number(latitude)],  // 设置Marker的位置
      anchor: 'bottom-center',                                      // 设置Marker的锚点
      icon: startMarkerIcon,
    })
    map.add(this.startMarker)
    selectPoints.unshift(warehousePointObj)     // 列表最前面加上起点(仓库位置)
    selectPoints.push(warehousePointObj)        // 列表最后面加上终点(仓库位置)
    // 每次规划16个指标点
    chunkArrayWithOverlap(selectPoints, 16).forEach(pointList => {
      const endIndex = pointList.length - 1
      // 构造路线导航类
      const driving = new AMap.Driving({
        map,                // 绘制路线的Map对象
        ferry: 1,           // 为1的时候表示不可以使用轮渡
        hideMarkers: true,  // 不显示点标记
      })
      // 根据起终点经纬度规划驾车导航路线
      driving.search(
        new AMap.LngLat(pointList[0].longitude, pointList[0].latitude),
        new AMap.LngLat(pointList[endIndex].longitude, pointList[endIndex].latitude), {
          waypoints: pointList.slice(1, -1).map(point => new AMap.LngLat(point.longitude, point.latitude)),
        }, (status, result) => {
          // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
          if (status === 'complete') {
            // message.success('绘制驾车路线成功')
          } else {
            message.error('获取驾车数据失败')
            console.warn('获取驾车数据失败>', result)
          }
        })
      this.drivingList.push(driving)  // 保存路线到数组
    })
    this.setState({ showLine: true })
  }

  /**
   * 关闭线路
   * @param onOff 是否显示关闭按钮
   * @author ChenGuangLong
   * @since 2024/9/25 17:37
   */
  closeLine = (onOff = false) => {
    this.startMarker?.remove()                            // 删除起点图标
    this.startMarker = null
    this.drivingList.forEach(driving => driving.clear())  // 清除所有路线
    this.drivingList = []
    this.setState({ showLine: onOff })
  }

  saveSchedule = () => {
    const { orders, orderMarkers, isEdit, schedule } = this.state
    const selectOrderStoreCodes = orderMarkers
    .filter(x => x.isSelect)
    .map(e => e.deliveryPoint.code)
    let allSelectOrders = orders.filter(e => selectOrderStoreCodes.indexOf(e.deliveryPoint.code) !== -1)
    if (allSelectOrders.length === 0) return message.error('请选择需要排车的门店！')
    if (schedule) schedule.uuid = schedule.UUID

    allSelectOrders = uniqBy(allSelectOrders, 'uuid')
    this.props.dispatchingByMap(isEdit, isEdit ? schedule : allSelectOrders, allSelectOrders)
  }

  /** 过滤门店 */
  storeFilter = (key, e) => {
    const serachStores = this.basicOrders.filter(
      item => item.deliveryPoint.code.search(e) !== -1 || item.deliveryPoint.name.search(e) !== -1
    )
    this.setState({ orders: serachStores })
  }

  /** 计算小数 */
  accAdd = (arg1, arg2) => {
    if (Number.isNaN(arg1)) {
      arg1 = 0
    }
    if (Number.isNaN(arg2)) {
      arg2 = 0
    }
    arg1 = Number(arg1)
    arg2 = Number(arg2)
    let r1
    let r2
    let m
    let c
    try {
      r1 = arg1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    c = Math.abs(r1 - r2)
    m = 10 ** Math.max(r1, r2)
    if (c > 0) {
      const cm = 10 ** c
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace('.', ''))
        arg2 = Number(arg2.toString().replace('.', '')) * cm
      } else {
        arg1 = Number(arg1.toString().replace('.', '')) * cm
        arg2 = Number(arg2.toString().replace('.', ''))
      }
    } else {
      arg1 = Number(arg1.toString().replace('.', ''))
      arg2 = Number(arg2.toString().replace('.', ''))
    }
    return (arg1 + arg2) / m
  }

  /** 计算所有 */
  getAllTotals = orders => {
    const totals = {
      cartonCount: 0, // 整件数
      scatteredCount: 0, // 散件数
      containerCount: 0, // 周转箱
      coldContainerCount: 0, // 冷藏周转筐+++
      freezeContainerCount: 0, // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0, // 保温袋+++
      freshContainerCount: 0, // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
      totalCount: 0, // 总件数
      stores: 0, // 总门店数
    }
    const totalStores = []
    orders.forEach(e => {
      totals.cartonCount += e.cartonCount // 整件数
      totals.scatteredCount += e.scatteredCount // 散件数
      totals.containerCount += e.containerCount // 周转箱
      totals.coldContainerCount += e.coldContainerCount // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount // 保温袋+++
      totals.freshContainerCount += e.freshContainerCount // 鲜食筐+++
      totals.volume = this.accAdd(totals.volume, e.volume)
      totals.weight = this.accAdd(totals.weight, e.weight)
      if (totalStores.indexOf(e.deliveryPoint.code) === -1) {
        totalStores.push(e.deliveryPoint.code)
      }
    })
    totals.stores = totalStores.length
    // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
    // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
    totals.totalCount =
      totals.cartonCount +
      totals.scatteredCount +
      (totals.containerCount + totals.coldContainerCount) * 2 +
      totals.freezeContainerCount * 3 +
      totals.insulatedBagCount +
      totals.freshContainerCount

    return totals
  }

  /** 获取总合计数 */
  getTotals = selectOrder => {
    const selectOrderStoreCodes = selectOrder.map(e => e.deliveryPoint.code)
    const { orders, bearweight, volumet } = this.state
    const allSelectOrders = orders.filter(
      e => selectOrderStoreCodes.indexOf(e.deliveryPoint?.code) !== -1
    )
    let totals = {
      cartonCount: 0, // 整件数
      scatteredCount: 0, // 散件数
      containerCount: 0, // 周转箱
      coldContainerCount: 0, // 冷藏周转筐+++
      freezeContainerCount: 0, // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0, // 保温袋+++
      freshContainerCount: 0, // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
      totalCount: 0, // 总件数
      stores: selectOrderStoreCodes.length,
    }
    allSelectOrders.forEach(e => {
      totals.cartonCount += e.cartonCount
      totals.scatteredCount += e.scatteredCount
      totals.containerCount += e.containerCount
      totals.coldContainerCount += e.coldContainerCount // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount // 保温袋+++
      totals.volume = this.accAdd(totals.volume, e.volume)
      totals.weight = this.accAdd(totals.weight, e.weight)
    })
    // totals.totalCount = totals.cartonCount + totals.scatteredCount + totals.containerCount * 2;
    // 总件数 = 整件+ 散件+（周转筐 + 冷藏）*2 + 冷冻*3 + 保温袋 + 鲜食筐
    totals.totalCount =
      totals.cartonCount +
      totals.scatteredCount +
      (totals.containerCount + totals.coldContainerCount) * 2 +
      totals.freezeContainerCount * 3 +
      totals.insulatedBagCount +
      totals.freshContainerCount

    totals = { ...totals, bearweight, volumet }
    return totals
  }

  /** 一家门店多份运输订单数量合并 */
  getOrderTotal = storeCode => {
    const totals = {
      cartonCount: 0, // 整件数
      scatteredCount: 0, // 散件数
      containerCount: 0, // 周转箱
      coldContainerCount: 0, // 冷藏周转筐+++
      freezeContainerCount: 0, // 冷冻周转筐+++
      insulatedContainerCount: 0, // 保温箱+++
      insulatedBagCount: 0, // 保温袋+++
      freshContainerCount: 0, // 鲜食筐+++
      volume: 0, // 体积
      weight: 0, // 重量,
    }
    const { orders, checkScheduleOrders } = this.state
    const isOrder = [...orders, ...checkScheduleOrders].filter(
      e => e.deliveryPoint.code === storeCode
    )
    isOrder.forEach(e => {
      totals.cartonCount += e.cartonCount
      totals.scatteredCount += e.scatteredCount
      totals.containerCount += e.containerCount
      totals.coldContainerCount += e.coldContainerCount // 冷藏周转筐+++
      totals.freezeContainerCount += e.freezeContainerCount // 冷冻周转筐+++
      totals.insulatedContainerCount += e.insulatedContainerCount // 保温箱+++
      totals.insulatedBagCount += e.insulatedBagCount // 保温袋+++
      totals.volume = this.accAdd(totals.volume, e.volume)
      totals.weight = this.accAdd(totals.weight, e.weight)
    })
    return totals
  }

  /** 排车单查询(本地过滤) */
  scheduleFilter = value => {
    let searchSchedule = [...this.basicScheduleList]
    if (value) searchSchedule = searchSchedule.filter(schedule => schedule.BILLNUMBER.search(value) !== -1)
    this.setState({ scheduleList: searchSchedule })
  }

  /** 点击‘查询排车单’列表项的单号 转为编辑这张排车单 */
  clickSchedule = async schedule => {
    this.setState({ loading: true })
    const { orderMarkers, orders } = this.state
    const response = await getDetailByBillUuids([schedule.UUID])
    if (response.success) {
      let details = response.data
      details = details?.filter(x => x.longitude && x.latitude)
      details?.forEach((e, index) => {
        const deliveryP = orderMarkers?.find(o => o.deliveryPoint?.code === e.deliveryPoint?.code)
        if (deliveryP) {
          deliveryP.isSelect = true
          deliveryP.sort = index + 1
        } else {
          e.isSelect = true
          e.sort = index + 1
          orderMarkers.push(e)
        }
        orders.push(e)
      })
      const result = await getSchedule(schedule.UUID)
      if (result.success) {
        const param = {
          tableName: 'SJ_ITMS_VEHICLE',
          condition: {
            params: [{ field: 'uuid', rule: 'eq', val: [result.data.vehicle.uuid] }],
          },
        }
        const vehicle = await dynamicQuery(param)
        if (vehicle.success) {
          this.setState({
            volumet:
              vehicle.result.records[0].LENGTH *
              vehicle.result.records[0].HEIGHT *
              vehicle.result.records[0].WIDTH,
            bearweight: vehicle.result.records[0].BEARWEIGHT,
          })
        }
      }

      this.setState({ orderMarkers, orders, isEdit: true, schedule, checkScheduleOrders: [], checkSchedules: [] })
    }
    this.setState({ loading: false })
    this.reloadMyjMarkers(orderMarkers) // 重新加载美宜佳图标
  }

  /**
   * 点击左边‘查询排车单’列表 地图门店显示
   * @author ChenGuangLong
   * @since 2024/9/25 9:33
   */
  checkSchedule = async (e, scheduleUUID) => {
    const { checkSchedules } = this.state
    const { checked } = e.target
    let checkList = [...checkSchedules]   // 获取已选中的排车单
    let checkScheduleOrders = []          // 获取已选中的排车单明细
    if (checked) {                               // 选中
      checkList.push(scheduleUUID)
    } else {                                     // 取消
      checkList = checkList.filter(item => item !== scheduleUUID)
    }
    if (checkList.length > 0) {                   // 选中的排车单列表大于0
      const response = await getDetailByBillUuids(checkList)
      if (response.success) {
        checkScheduleOrders = response.data ?? []
        checkList.forEach((item, index) => {
          checkScheduleOrders.forEach(order => {
            if (order.billUuid === item) {
              order.iconNum = index + 1
            }
          })
        })
      }
    }
    this.gdMapRef.current.removeMarkersByType('store')
    this.gdMapRef.current.addStoreMarkers(checkScheduleOrders, this.setMarkerLabel, 'store')
    this.setState({ checkSchedules: checkList, checkScheduleOrders })
  }


  render () {
    const {
      visible,
      loading,
      allTotals,
      orderMarkers,
      isEdit,
      schedule,
      closeLeft,
      checkScheduleOrders,
      checkSchedules,
      multiVehicle, // 是否多载具+++
      mapSelect,
      showLine,
    } = this.state
    const selectOrder = orderMarkers.filter(x => x.isSelect).sort(x => x.sort)
    const totals = this.getTotals(selectOrder)

    return (
      <Modal
        width="100vw"
        destroyOnClose       // 关闭时销毁
        closable={false}     // 是否显示右上角的关闭按钮
        visible={visible}
        className={style.dispatchingMap}
        bodyStyle={{ margin: -24, height: '99vh' }}
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        title={
          <div>
            {/* ————————顶部搜索———————— */}
            <Row type="flex" justify="space-between">
              <Col span={21}><SearchForm refresh={this.refresh} onRef={node => (this.searchFormRef = node)}/></Col>
              <Col span={1}><Button onClick={() => this.onReset()}>清空</Button></Col>
              <Col span={1}><Button onClick={() => this.hide()}>关闭</Button></Col>
            </Row>
            <Divider style={{ margin: 0, marginTop: 5 }}/>
            {/* ————————顶部统计———————— */}
            <Row>
              <div style={{ display: 'flex', marginTop: 5 }}>
                {bFlexDiv('总件数', totals.totalCount)}
                {bFlexDiv('整件数', totals.cartonCount)}
                {bFlexDiv('散件数', totals.scatteredCount)}
                {bFlexDiv('周转箱', totals.containerCount)}
                {bFlexDiv('体积', totals.volume)}
                {bFlexDiv('重量', (totals.weight / 1000).toFixed(3))}
                {bFlexDiv('车辆承重(T)', (totals?.bearweight / 1000).toFixed(3))}
                {bFlexDiv('车辆体积(m3)', (totals?.volumet / 1000000).toFixed(3))}
                {bFlexDiv('门店', totals.stores)}
              </div>
              {multiVehicle && ( // 多载具+++
                <div style={{ display: 'flex', marginTop: 5 }}>
                  {bFlexDiv('冷藏周转筐', totals.coldContainerCount)}
                  {bFlexDiv('冷冻周转筐', totals.freezeContainerCount)}
                  {bFlexDiv('保温袋', totals.insulatedBagCount)}
                  {bFlexDiv('鲜食筐', totals.freshContainerCount)}
                  {/* 为了美观而占位 */ <div style={{ flex: 5 }}/>}
                </div>
              )}
            </Row>
          </div>
        }
      >
        <Spin
          indicator={LoadingIcon('default')}
          spinning={loading}
          tip="加载中..."
          wrapperClassName={style.loading}
        >
          {/*  中心内容 ———————————————————————————————— 是否多载具高度不同—————————————————— */}
          <Row type="flex" style={{ height: window.innerHeight - (multiVehicle ? 185 : 145) }}>
            {/* —————————— 左边排车单选择和筛选数据———————————— */}
            <Col
              span={closeLeft ? 0 : 6}
              style={{ height: '100%', background: '#fff', overflow: 'auto' }}
            >
              {isEdit || selectOrder.length > 0 ? (
                <div style={{ position: 'relative', height: '100%', marginTop: '10px' }}>
                  <Button
                    style={{ float: 'left' }}
                    onClick={() => {
                      this.setState({ isEdit: false, bearweight: 0, volumet: 0 })
                      this.isSelectOrders = []
                      this.searchFormRef?.onSubmit()
                    }}
                  >
                    返回
                  </Button>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: '10px',
                      marginRight: '20px',
                    }}
                  >
                    {isEdit ? `编辑排车单:${schedule.BILLNUMBER}` : '新建排车单'}(ALT+Q)
                  </div>

                  {selectOrder.map(order => {
                    const totalObj = this.getOrderTotal(order.deliveryPoint.code)
                    return (
                      <div
                        className={style.storeCard}
                        onClick={() => this.onChangeSelect(!order.isSelect, order)}
                      >
                        <div className={style.storeCardTitle}>
                          {`[${order.deliveryPoint.code}]${order.deliveryPoint.name}`}
                        </div>
                        <div style={{ display: 'flex' }}>
                          {bFlexDiv('线路', order.archLine?.code, false)}
                          {bFlexDiv('备注', order?.lineNote, false)}
                        </div>
                        {/* 左边显示数据 */}
                        <Divider style={{ margin: 0, marginTop: 5 }}/>
                        <Row type="flex" justify="space-around" style={{ textAlign: 'center' }}>
                          {bColDiv2('整件数', totalObj.cartonCount, 4)}
                          {bColDiv2('散件数', totalObj.scatteredCount, 4)}
                          {bColDiv2('周转箱', totalObj.containerCount, 4)}
                          {bColDiv2('体积', totalObj.volume, 4)}
                          {bColDiv2('重量', (totalObj.weight / 1000).toFixed(3), 4)}
                          {multiVehicle && ( // 多载具+++
                            <>
                              {bColDiv2('冷藏周转筐', totalObj.coldContainerCount, 5)}
                              {bColDiv2('冷冻周转筐', totalObj.freezeContainerCount, 5)}
                              {bColDiv2('保温袋', totalObj.insulatedBagCount, 5)}
                              {bColDiv2('鲜食筐', totalObj.freshContainerCount, 5)}
                            </>
                          )}
                        </Row>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <List
                  header={
                    <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                      排车单查询：
                      <Input
                        style={{ width: '150px', marginLeft: '10px' }}
                        onChange={e => this.scheduleFilter(e.target.value)}
                      />
                    </div>
                  }
                  size="large"
                  itemLayout="horizontal"
                  dataSource={this.state.scheduleList}
                  renderItem={item => (
                    <List.Item
                      extra={
                        <div>
                          <Checkbox
                            style={{ marginRight: '10px' }}
                            onChange={e => this.checkSchedule(e, item.UUID)}
                            checked={this.state.checkSchedules.indexOf(item.UUID) !== -1}
                          />
                          <div
                            style={{
                              backgroundColor: this.colors[
                              checkSchedules.findIndex(e => e === item.UUID) % 20
                                ],
                              width: '20px',
                              height: '20px',
                              float: 'left',
                              marginRight: '10px',
                              borderRadius: '50px',
                            }}
                          />
                        </div>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar style={{ width: '50px', height: '50px' }} src={truck}/>}
                        title={
                          <a
                            style={{ fontSize: '15px' }}
                            onClick={() => this.clickSchedule(item)}
                          >
                            {item.BILLNUMBER}
                          </a>
                        }
                        description={
                          <div style={{ fontWeight: 'bold' }}>
                            车辆：
                            {item.VEHICLEPLATENUMBER ? item.VEHICLEPLATENUMBER : '<空>'}
                            &nbsp;&nbsp;司机：[
                            {item.CARRIERCODE ? item.CARRIERCODE : '<空>'}]
                            {item.CARRIERNAME ? item.CARRIERNAME : ''}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
            {/* ————————右边地图———————— */}
            <Col span={closeLeft ? 24 : 18}>
              {/* ————隐藏/显示左边按钮—————— */}
              <a onClick={() => this.setState({ closeLeft: !this.state.closeLeft })}>
                <div style={{ float: 'left', height: '100%' ,zIndex: 1, position: 'absolute', background: 'white'}}>
                  <Icon
                    type={closeLeft ? 'caret-right' : 'caret-left'}
                    style={{ marginTop: (window.innerHeight - 145) / 2}}
                  />
                </div>
              </a>

              {(orderMarkers.length > 0 || checkScheduleOrders.length > 0) &&
                <div>
                  <Button     // 地图框选按钮
                    size="large"
                    type={mapSelect ? 'danger' : 'primary'}
                    style={{ zIndex: 1 }}
                    onClick={this.switchRectangleSelect}
                  >
                    <Icon type="select"/>
                  </Button>
                  <Button
                    size="large"
                    onClick={() => this.closeLine(false)}
                    style={{ zIndex: 1, display: showLine ? 'unset' : 'none', marginLeft: 20 }}
                  >
                    隐藏线路
                  </Button>
                </div>
              }

              <GdMap ref={this.gdMapRef} style={{ top: 0 }}/>

            </Col>
          </Row>

          {/* ———————————————— 底部统计 ———————————————— */}
          <Divider style={{ margin: 0, marginTop: 5 }}/>
          <Row width="100%">
            <div style={{ display: 'flex', marginTop: 5, fontSize: '14px' }}>
              {bFlexDiv('总件数', allTotals.totalCount)}
              {bFlexDiv('总整件数', allTotals.cartonCount)}
              {bFlexDiv('总散件数', allTotals.scatteredCount)}
              {bFlexDiv('总周转箱', allTotals.containerCount)}
              {multiVehicle && ( // 多载具+++
                <>
                  {bFlexDiv('总冷藏周转筐', allTotals.coldContainerCount)}
                  {bFlexDiv('总冷冻周转筐', allTotals.freezeContainerCount)}
                  {bFlexDiv('总保温袋', allTotals.insulatedBagCount)}
                  {bFlexDiv('总鲜食筐', allTotals.freshContainerCount)}
                </>
              )}
              {bFlexDiv('总体积', allTotals.volume)}
              {bFlexDiv('总重量', (allTotals.weight / 1000).toFixed(3))}
              {bFlexDiv('总门店数', allTotals.stores)}
            </div>
          </Row>
        </Spin>
      </Modal>
    )
  }
}
