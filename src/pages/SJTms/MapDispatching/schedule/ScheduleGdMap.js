/*
 * @Author: chenGuangLong
 * @Date: 2024-09-21
 * @Description: 排车单高德地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\schedule\ScheduleGdMap.js
 */
import React, { Component } from 'react'
import { Modal, Button, Row, Col, message } from 'antd'
import { uniqBy, orderBy } from 'lodash'
import { getDetailByBillUuids } from '@/services/sjitms/ScheduleBill'
import { queryDict } from '@/services/quick/Quick'
import { getAddressByUuids } from '@/services/sjitms/StoreTeam'
import { loginOrg } from '@/utils/LoginContext'
import GdMap from '@/components/GdMap'
import startMarkerIcon from '@/assets/common/startMarker.png'
import { bdToGd } from '@/utils/mapUtil'

export default class ScheduleGdMap extends Component {
  state = {
    showLine: true,        // true:显示线路按钮 false:隐藏线路按钮
    visible: false,
    startPoint: '',
    rowKeys: [],
    orders: [],
  }

  drivingList = []       // 存储所有路线,因为高德的清除全部覆盖物对路线轨迹无效
  startMarker = null      // 保存起点图标
  gdMapRef = React.createRef()

  componentDidMount = () => {
    if (this.props.onRef) this.props.onRef(this)
  }

  /** 显示地图弹窗，并获取和设置仓库经纬度 */
  show = rowKeys => {
    queryDict('warehouse').then(res => {
      this.setState({
        startPoint: res.data.find(x => x.itemValue === loginOrg().uuid)?.description,
      })
    })
    this.initialize(rowKeys)
    this.setState({ visible: true, rowKeys, showLine: true })
  }

  /** 初始化 */
  initialize = async rowKeys => {
    if (rowKeys.length === 0) return
    const response = await getDetailByBillUuids(rowKeys)
    if (!response.success) return
    let orders = response.data
    const deliveryPoints = uniqBy(orders.map(x => x.deliveryPoint), x => x.uuid).map(x => x.uuid)

    if (deliveryPoints.length === 0) return
    const storeRespones = await getAddressByUuids(deliveryPoints)
    const stores = storeRespones.data || []

    orders = orders.map(order => {
      const index = rowKeys.findIndex(x => x === order.billUuid)
      let store = stores.find(point => point.uuid === order.deliveryPoint.uuid)
      store = bdToGd(store)   // 🫵🫵🫵百度转高德🫵🫵🫵
      return {
        ...order,
        longitude: store.longitude || 113.809388,
        latitude: store.latitude || 23.067107,
        iconNum: index + 1,
      }
    })
    orders = orderBy(orders.filter(res => res), x => x.iconNum)
    window.setTimeout(() => {
      this.gdMapRef.current.addStoreMarkers(orders, this.setMarkerLabel) // 绘制门店图标
      this.gdMapRef.current.autoFocusViewPort(orders)                                   // 自动聚焦
    }, 1000)

    this.setState({ orders })
  }

  /**
   * 设置坐标点提示文字
   * @return {string} 高德要的一定是字符串！！！
   * @author ChenGuangLong
   * @since 2024/9/20 15:43
   */
  setMarkerLabel = (order) => `
    <div style="width: 300px; height: 100px; padding: 5px; background: #FFF;">
      <div style="font-weight: bold; overflow: hidden; white-space: nowrap;">
        [${order.deliveryPoint.code}]${order.deliveryPoint.name}
      </div>
      <hr style="margin: 5px 0 0 0;" />
      <div>线路：${order.archLine?.code}</div>
      <div style="display: flex; margin-top: 5px; text-align: center;">
        <div style="flex: 1;">整件数</div>
        <div style="flex: 1;">周转箱数</div>
        <div style="flex: 1;">体积</div>
        <div style="flex: 1;">重量</div>
      </div>
      <div style="display: flex; text-align: center;">
        <div style="flex: 1;">${order.cartonCount}</div>
        <div style="flex: 1;">${order.containerCount}</div>
        <div style="flex: 1;">${order.volume}</div>
        <div style="flex: 1;">${(order.weight / 1000).toFixed(3)}</div>
      </div>
    </div>
  `

  /**
   * 显示线路
   * @author ChenGuangLong
   * @since 2024/9/21 9:03
   */
  openLine = () => {
    const { rowKeys, orders, startPoint } = this.state
    const { AMap, map, markerObj } = this.gdMapRef.current

    // 显示标签 1 2 3 4 。。。 按创建顺序
    markerObj.store.forEach((marker,index) => marker.setLabel({ content: index + 1}))

    // 根据门店去重
    const flagObj = {}
    const uniqueOrderList = orders.reduce((cur, next) => {
      if (!flagObj[next.deliveryPoint.code]) {    // 如果没有出现过该code
        flagObj[next.deliveryPoint.code] = true  // 标记为已出现
        cur.push(next)                           // 将该订单添加到结果数组中
      }
      return cur                                 // 返回结果的数组
    }, [])

    // 起点对象(给线路用)
    const [latitude, longitude] = startPoint.split(',')
    const WarehousePointObj = {
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

    // 按排车单规划路线
    rowKeys.forEach(rowKey => {
      const pointList = uniqueOrderList.filter(res => res.billUuid === rowKey)
      // 列表最前面加上起点(仓库位置)
      pointList.unshift(WarehousePointObj)
      // 列表最后面加上终点(仓库位置)
      pointList.push(WarehousePointObj)
      // 每次规划16个指标点
      this.gdMapRef.current.chunkArrayWithOverlap(pointList, 16).forEach(points => {
        const endIndex = points.length - 1
        // 构造路线导航类
        const driving = new AMap.Driving({
          map,                // 绘制路线的Map对象
          ferry: 1,           // 为1的时候表示不可以使用轮渡
          hideMarkers: true,  // 不显示点标记
        })
        // 根据起终点经纬度规划驾车导航路线
        driving.search(
          new AMap.LngLat(points[0].longitude, points[0].latitude),
          new AMap.LngLat(points[endIndex].longitude, points[endIndex].latitude), {
            waypoints: points.slice(1, -1).map(point => new AMap.LngLat(point.longitude, point.latitude)),
          }, (status, result) => {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
              // message.success('绘制驾车路线成功')
            } else {
              message.error('获取驾车数据失败')
              console.error('获取驾车数据失败>', result)
            }
          })
        this.drivingList.push(driving)  // 保存路线到数组
      })
    })
    this.setState({ showLine: false })
  }

  closeLine = () => {
    this.gdMapRef.current.markerObj.store.forEach(marker => marker.setLabel({ content: undefined }))  // 去除标签
    this.startMarker?.remove()                                   // 删除起点图标
    this.startMarker = null
    const { orders } = this.state
    this.drivingList.forEach(driving => driving.clear())         // 清除所有路线
    this.drivingList = []
    this.gdMapRef.current.autoFocusViewPort(orders)       // 自动聚焦
    this.setState({ showLine: true })
  }



  render () {
    const { visible, showLine, orders } = this.state
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        bodyStyle={{ margin: -24, height: '100vh' }}
        visible={visible}
        title={
          <Row type="flex" justify="space-between">
            <Col span={22}>
              <b style={{ fontSize: 20 }}>排车单地图</b>
              {orders.length > 0 &&
                <>
                  {showLine && <Button onClick={this.openLine} style={{ marginLeft: 20 }}>显示线路</Button>}
                  {!showLine && <Button onClick={this.closeLine} style={{ marginLeft: 20 }}>隐藏线路</Button>}
                </>
              }
            </Col>
            <Col span={1}>
              <Button onClick={() => {this.setState({ visible: false })}}>关闭</Button>
            </Col>
          </Row>
        }
        closable={false}  // 不显示右上角的关闭按钮
        destroyOnClose    // 关闭后销毁
      >
        <GdMap ref={this.gdMapRef}/>
      </Modal>
    )
  }
}
