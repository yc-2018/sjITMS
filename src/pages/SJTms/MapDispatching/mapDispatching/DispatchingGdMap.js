// ////////// 地图排车独立高德版 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\MapDispatching\mapDispatching\DispatchingGdMap.js  由`陈光龙`创建 时间：2024/10/7 17:16
// 请同步修改弹窗版：src/pages/SJTms/MapDispatching/dispatching/DispatchingGdMap.js
import React, { Component } from 'react'
import {
  Divider, Button, Row, Col, Spin, message, Input,
  List, Avatar, Icon, Checkbox,
} from 'antd'
import { uniqBy } from 'lodash'
import { getSchedule, getDetailByBillUuids } from '@/services/sjitms/ScheduleBill'
import style from './DispatchingGdMap.less'
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon'
import { queryAuditedOrderByParams, GetConfig } from '@/services/sjitms/OrderBill'
import { queryData, dynamicQuery } from '@/services/quick/Quick'
import { loginCompany, loginOrg } from '@/utils/LoginContext'
import truck from '@/assets/common/truck.svg'
import SearchForm from '@/pages/SJTms/MapDispatching/dispatching/SearchForm'
import {
  colors,
  getOrderTotal,
  setMarkerText,
  getTotals,
  getAllTotals,
  validateOrder
} from '@/pages/SJTms/MapDispatching/dispatchingGdMapCommon'
import startMarkerIcon from '@/assets/common/startMarker.png'
import vanIcon from '@/assets/common/van.svg';
import MyjRedIcon from '@/assets/common/22.png'
import MyjGreenIcon from '@/assets/common/23.png'
import MyjBlueIcon from '@/assets/common/24.png'
import { getDispatchConfig } from '@/services/sjtms/DispatcherConfig'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import Page from '@/components/MyComponent/Page'
import DispatchingCreatePage from '@/pages/SJTms/Dispatching/DispatchingCreatePage'
import GdMap from '@/components/GdMap'

/**
 * build简化Flex Div代码 +++
 * @author ChenGuangLong
 * @since 2024/5/16 11:03
 */
const bFlexDiv = (name, value, bold = true) => (
  <div style={{ flex: 1, fontWeight: bold ? 'bold' : 'normal' }}>
    {name}:{value}
  </div>
);
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
);


export default class DispatchMap extends Component {
  basicOrders = [];
  basicScheduleList = [];
  select = null;

  rectangleTool = null                           // 存储创建好的矩形选取工具
  startMarker = null                             // 起始点（仓库位置坐标)
  drivingList = []                             // 路线规划数据
  marksIndexList = []                          // 已排序点坐标序号列表
  vanMass = null                                // 货车（已排）海量点列表
  myjMass = null                                // myj（未排）海量点列表
  text  = null                                  // 地图文本对象（循环利用)
  isSetFitView = true                        // 是否需要重新设置视图范围(保存排车单的时候返回不要调整所以加上这个控制)
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
    loading: false,
    pageFilter: [],
    orders: [],
    orderMarkers: [],
    ScheduledMarkers: [],
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
    dispatchConfig: {},
    scheduleSelect: [],
    fence: { lng: 113.809388, lat: 23.067107 },
  };

  componentDidMount = () => {
    this.initConfig()  // 设置是否多载具
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDown);
  }

  /**
   * 获取时捷配置中心配置，拿到改调度中心是否是多载具的+++
   * @author ChenGuangLong
   * @since 2024/5/17 14:57
   */
  initConfig = async () => {
    const response = await getDispatchConfig(loginOrg().uuid);
    if (response.success) this.setState({ dispatchConfig: response.data });


    const configResponse = await GetConfig('dispatch', loginOrg().uuid);
    if (configResponse?.data?.[0]?.multiVehicle)
      this.setState({ multiVehicle: configResponse?.data?.[0]?.multiVehicle === '1' });

    const mobileSchedule = await GetConfig('mobileSchedule', loginOrg().uuid);
    if (mobileSchedule?.data?.[0]?.fence) {
      let houseLocation = JSON.parse(mobileSchedule?.data?.[0]?.fence);
      this.setState({ fence: { lng: houseLocation.longitude, lat: houseLocation.latitude } });
    }
  };

  keyDown = (event) => {
    const e = event || {}
    // alt+s
    if (e && e.keyCode === 83 && e.altKey) this.switchRectangleSelect()
    // alt+w
    if (e && e.keyCode === 81 && e.altKey) this.saveSchedule()
    // alt+r
    if (e && e.keyCode === 82 && e.altKey) this.cancelSelect()
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
    if (params) {
      pageFilter = params
    }

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
        const data = result.filter(x => x.longitude && x.latitude) // .map(item => bdToGd(item))  // 🫵🫵🫵百度转高德🫵🫵🫵
        // 计算所有
        const allTotals = getAllTotals(data.filter(e => e.stat !== 'Scheduled'))

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
          this.clearMap()                         // 清除地图所有覆盖物（包括线路)
          this.reloadMyjMarkers(orderMarkers)     // 重新加载美宜佳图标
          if (this.isSetFitView) this.gdMapRef.current.map.setFitView() // 无参数时，自动自适应所有覆盖物
          else this.isSetFitView = true
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
      };
      queryData(queryParams).then(res => {
        this.setState({ scheduleList: res?.data?.records });
        this.basicScheduleList = res?.data?.records;
      });
      this.setState({ loading: false, pageFilter });
    }).catch(err => {message.error(`查询失败：${err.message}`)});
  };

  /**
   * 清除地图上的所有覆盖物（包括路线）
   * @author ChenGuangLong
   * @since 2024/9/27 22:52
   */
  clearMap = () => {
    this.gdMapRef.current?.clearMap()
    this.vanMass = null
    if (this.drivingList.length) this.closeLine(true)
    this.checkSchedule() // 如果排车单还勾选着，那还是要显示的
  }

  /**
   * 增加未排（myj）海量点
   * @author ChenGuangLong
   * @since 2024/10/4 8:47
   */
  addMyjMassMarks = orderMarkerList => {
    const { map, AMap } = this.gdMapRef.current
    const anchor = new AMap.Pixel(10, 10)   // 锚点位置 一半一半 就是中心位置为锚点  以底部中心为锚点就应该是 new AMap.Pixel(10, 20)
    const size = new AMap.Size(20, 20)
    const styleList = [     // 样式列表
      { url: MyjBlueIcon, anchor, size, zIndex: 12 },
      { url: MyjGreenIcon, anchor, size, zIndex: 12 },
      { url: MyjRedIcon, anchor, size, zIndex: 12 },
    ]
    // 创建美宜佳图标海量点
    this.myjMass = new AMap.MassMarks(orderMarkerList.map(item => ({
      lnglat: `${item.longitude},${item.latitude}]`,
      style: item.isSelect && item.sort ? 0 : item.isSelect ? 1 : 2,  // 样式序号
      item,
    })), {
      zIndex: 111,
      cursor: 'pointer',
      style: styleList,
    })

    // 创建已排序号(海量点不带label 自己加上)
    orderMarkerList.filter(item => item.isSelect && item.sort).forEach(order => {
      const marker = new AMap.Marker({
        map,
        content: ' ',       // 不需要点图标
        position: [order.longitude, order.latitude],
        label: { content: order.sort, offset: new AMap.Pixel(10, 0) }   // 显示序号
      })
      this.marksIndexList.push(marker)  // 添加到数组 后续好删除
    })


    // 文本框就创建一次 循环利用
    this.text = this.text ?? new AMap.Text({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -11),             // 设置文本标注偏移量 因为坐标偏移一半 所以是大小的一半+1
    });

    this.myjMass.on('mouseover', ({ data }) => {                                // 鼠标移入
      this.text.setPosition(new AMap.LngLat(data.item.longitude, data.item.latitude)) // 改变经纬度
      this.text.setText(setMarkerText(this.state, data.item))             // 设置文本标注内容
      map.add(this.text);
    })
    this.myjMass.on('mouseout', () => {                                         // 鼠标移出
      this.text && map.remove(this.text)
    })
    this.myjMass.on('click', ({ data }) => {                                    // 点击事件
      this.onChangeSelect(!data.item.isSelect, data.item)
    })

    this.myjMass.setMap(map)
  }

  /**
   * 增加已排（货车）海量点
   * @author ChenGuangLong
   * @since 2024/9/27 16:30
   */
  addVanMassMarks = () => {
    const { map, AMap } = this.gdMapRef.current
    const { ScheduledMarkers } = this.state

    // 创建海量点
    this.vanMass = new AMap.MassMarks(ScheduledMarkers.map(item => ({
      lnglat: `${item.longitude},${item.latitude}]`,
      item,
    })), {
      zIndex: 111,
      cursor: 'pointer',
      style: {
        url: vanIcon,
        anchor: new AMap.Pixel(10, 10),   // 锚点位置 一半一半 就是中心位置为锚点  以底部中心为锚点就应该是 new AMap.Pixel(10, 20)
        size: new AMap.Size(20, 20),
        zIndex: 12,
      },
    })

    // 中文就创建一次 循环利用
    this.text = this.text ?? new AMap.Text({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -11),             // 设置文本标注偏移量 因为坐标偏移一半 所以是大小的一半+1
    });

    this.vanMass.on('mouseover', ({ data }) => {                                // 鼠标移入
      this.text.setPosition(new AMap.LngLat(data.item.longitude, data.item.latitude)) // 改变经纬度
      this.text.setText(setMarkerText(this.state, data.item))             // 设置文本标注内容
      map.add(this.text);
    })
    this.vanMass.on('mouseout', () => {                                         // 鼠标移出
      this.text && map.remove(this.text)
    })

    this.vanMass.setMap(map)
  }

  /**
   * 刷新美宜佳坐标
   * @param {Array} [orderMarkerList] 美宜佳点位列表 传就用传的 不传就用state的orderMarkers
   * @author ChenGuangLong
   * @since 2024/9/26 14:25
   */
  reloadMyjMarkers = orderMarkerList => {
    const { orderMarkers } = this.state // 其实有些地方我没看懂 有些地方只修改了orders，但是orderMarkers就变了？ 共用地址导致？
    const { map } = this.gdMapRef.current

    if (this.marksIndexList.length > 0) {   // 移除已排序号
      map.remove(this.marksIndexList)
      this.marksIndexList = []
    }
    this.myjMass?.clear()
    this.addMyjMassMarks(orderMarkerList ?? orderMarkers)
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
    contextMenu.addItem('取消选中(ALT+R)', () => {
      contextMenu.close()
      this.cancelSelect()
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
      if (!this.vanMass) {
        this.addVanMassMarks()
      } else {
        this.vanMass.clear()
        this.vanMass = null
      }
    }, 6)
    // 地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', e => contextMenu.open(map, e.lnglat))
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
  }

  /**
   * 创建矩形
   * @author ChenGuangLong
   * @since 2024/9/24 17:23
   */
  switchRectangleSelect = () => {
    const { mapSelect } = this.state
    const { AMap, map } = this.gdMapRef.current
    if (!this.rectangleTool) {  // 第一次先创建
      this.rectangleTool = new AMap.MouseTool(map)
      this.rectangleTool.on('draw', (e) => {
        let { orders, orderMarkers } = this.state      // 必须放里面（放外面导致严重的教训bug)
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
      map.setDefaultCursor('crosshair')
      this.rectangleTool.rectangle({  // 同Polygon的Option设置
        fillColor: '#fff',
        strokeColor: '#80d8ff'
      })
      this.setState({ mapSelect: true })
    } else {
      map.setDefaultCursor('default')
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
    const { fence } = this.state
    const { AMap, map, chunkArrayWithOverlap } = this.gdMapRef.current
    // 先清除上次绘制的路线
    if (this.drivingList.length) this.closeLine(true)

    // 仓库点对象(给线路用)
    const {lng,lat} = fence
    const warehousePointObj = {
      longitude: Number(lng),
      latitude: Number(lat),
    }

    // 起点坐标（绘制图标用）
    this.startMarker = new AMap.Marker({
      position: [Number(lng), Number(lat)],             // 设置Marker的位置
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
    this.dispatchingByMap(isEdit, isEdit ? schedule : allSelectOrders, allSelectOrders)
  }

  /** 地图排车 */
  dispatchingByMap = (isEdit, record, orders) => {
    // 订单类型校验
    if (!validateOrder(orders)) return;
    this.isSetFitView = false   // 不执行自动重新聚焦
    this.createPageModalRef.show(isEdit, record, orders);
  };

  /** 取消选中 */
  cancelSelect = () => {
    const { orders, orderMarkers } = this.state
    orders.forEach(item => {
      item.isSelect = false
      item.sort = undefined
    })
    this.reloadMyjMarkers(orderMarkers) // 重新加载美宜佳图标
    this.setState({ orders })
  };

  /** 过滤门店 */
  storeFilter = (key, e) => {
    const serachStores = this.basicOrders.filter(
      item => item.deliveryPoint.code.search(e) !== -1 || item.deliveryPoint.name.search(e) !== -1
    )
    this.setState({ orders: serachStores })
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
    const { checked } = e?.target ?? {}
    let checkList = [...checkSchedules]   // 获取已选中的排车单
    let checkScheduleOrders = []          // 获取已选中的排车单明细

    if (e)                                                              // 是不是在页面上点的排车单
      if (checked) checkList.push(scheduleUUID)                         // 选中
      else checkList = checkList.filter(item => item !== scheduleUUID)  // 取消

    if (checkList.length > 0) {                   // 选中的排车单列表大于0
      const response = await getDetailByBillUuids(checkList)
      if (response.success) {
        checkScheduleOrders = response.data ?? []
        checkList.forEach((item, index) => {
          checkScheduleOrders.forEach(order => {
            if (order.billUuid === item) order.iconNum = index + 1
          })
        })
      }
    }
    this.gdMapRef.current.removeMarkersByType('store')
    this.gdMapRef.current.addStoreMarkers(
      checkScheduleOrders,
      (order) => setMarkerText(this.state, order),
      'store'
    )
    this.setState({
      checkSchedules: checkList,
      checkScheduleOrders,
      scheduleSelect: checkScheduleOrders,
    });
  }


  render() {
    const {
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
      dispatchConfig,
      scheduleSelect,
      showLine,
    } = this.state;
    const selectOrder = orderMarkers.filter(x => x.isSelect).sort(x => x.sort);
    const totals = getTotals(this.state, selectOrder.length > 0 ? selectOrder : scheduleSelect)

    return (
      <PageHeaderWrapper>
        <Page withCollect pathname={this.props.location ? this.props.location.pathname : ''} className={style.gdPage}>
          <div>
            {/* ————————顶部搜索———————— */}
            <Row type="flex" justify="space-between">
              <Col span={23}><SearchForm refresh={this.refresh} onRef={node => (this.searchFormRef = node)} /></Col>
              <Col span={1}><Button onClick={() => this.onReset()}>清空</Button></Col>
            </Row>
            <Divider style={{ margin: 0, marginTop: 5 }} />
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
                  {/* 为了美观而占位 */ <div style={{ flex: 5 }} />}
                </div>
              )}
            </Row>
          </div>
          {/* ——————排车弹窗（选择后）—————— */}
          <DispatchingCreatePage
            modal={{ title: '排车' }}
            refresh={() => {
              this.refresh();
            }}
            dispatchConfig={dispatchConfig}
            onRef={node => (this.createPageModalRef = node)}
            refreshMap={() => this.dispatchMapRef?.refresh()}
          />

          <Spin
            indicator={LoadingIcon('default')}
            spinning={loading}
            tip="加载中..."
            wrapperClassName={style.loading}
          >
            {/*  中心内容 ———————————————————————————————— 是否多载具高度不同—————————————————— */}
            <Row type="flex" style={{ height: window.innerHeight - (multiVehicle ? 270 : 250) }}>
              {/* —————————— 左边排车单选择和筛选数据———————————— */}
              <Col
                span={closeLeft ? 0 : 6}
                className={style.dispatchingMap}
                style={{ height: '100%', background: '#fff', overflow: 'auto' }}
              >
                {isEdit || selectOrder.length > 0 ? (
                  <div style={{ position: 'relative', height: '100%', marginTop: '10px' }}>
                    <Button
                      style={{ float: 'left' }}
                      onClick={() => {
                        this.setState({ isEdit: false, bearweight: 0, volumet: 0 });
                        this.searchFormRef?.onSubmit();
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
                      {isEdit ? `编辑排车单:${schedule.BILLNUMBER}` : '新建排车单'}
                      (ALT+Q)
                    </div>

                    {selectOrder.map(order => {
                      const totalObj = getOrderTotal(this.state, order.deliveryPoint.code)
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
                          <Divider style={{ margin: 0, marginTop: 5 }} />
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
                      );
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
                                backgroundColor: colors[
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
                          avatar={<Avatar style={{ width: '50px', height: '50px' }} src={truck} />}
                          title={
                            <a
                              style={{ fontSize: '15px' }}
                              onClick={() => {
                                this.clickSchedule(item);
                              }}
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
                {/* ————————地图左上角按钮—————— */}
                {(orderMarkers.length > 0 || checkScheduleOrders.length > 0) &&
                  <div>
                    <Button   // 地图框选按钮
                      style={{ zIndex: 1 }}
                      onClick={this.switchRectangleSelect}
                      type={mapSelect ? 'danger' : 'primary'}
                    >
                      <Icon type="select"/>(ALT+S)
                    </Button>
                    <Button
                      onClick={() => this.closeLine(false)}
                      style={{ zIndex: 1, display: showLine ? 'unset' : 'none', marginLeft: 20 }}
                    >
                      隐藏线路
                    </Button>

                    <Button
                      onClick={() => this.gdMapRef.current.map.setFitView()}
                      style={{ zIndex: 1, marginLeft: 20, opacity: 0.5 }}
                    >
                      调整地图看到所有点
                    </Button>
                  </div>
                }

                {/* ——————————高德地图—————————— */}
                <GdMap ref={this.gdMapRef} style={{ top: 0 }} initFunc={this.gdMapContextMenu}/>

              </Col>
            </Row>

            {/* ———————————————— 底部统计 ———————————————— */}
            <Divider style={{ margin: 0, marginTop: 5 }} />
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
        </Page>
      </PageHeaderWrapper>
    );
  }
}
