// ///////////////////////////智能调度页面//////////////
import React, { Component, createRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Button, Col, Divider, Drawer, Empty, Icon, message, Modal, Row, Select, Table } from 'antd'
import { AMapDefaultConfigObj, AMapDefaultLoaderObj } from '@/utils/mapUtil'
import styles from './SmartScheduling.less'
import VehiclePoolPage from '@/pages/SJTms/Dispatching/VehiclePoolPage'
import OrderPoolModal from '@/pages/SJTms/SmartScheduling/OrderPoolModal'
import { mergeOrdersColumns, mergeVehicleColumns } from '@/pages/SJTms/SmartScheduling/columns'
import { queryDict } from '@/services/quick/Quick'
import { loginOrg } from '@/utils/LoginContext'
import { getSmartScheduling } from '@/services/sjitms/smartSchedulingApi'

const { Option } = Select

export default class SmartScheduling extends Component {
  RIGHT_DRAWER_WIDTH = 400   // 右侧侧边栏宽度
  AMap = null                   // 高德地图对象
  map = null                    // 高德地图实例
  text = null                   // 高德地图文本对象
  warehouseMarker = null        // 当前仓库高德点
  warehousePoint = ''         // 当前仓库经纬度
  groupMarkers = []            // 分组的高德点位
  routingPlans = []           // 路线规划数据列表（按index对应groupMarkers）

  vehiclePoolModalRef = createRef()
  orderPoolModalRef = createRef()
  /** 每个排车单不同颜色 */
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

  state = {
    sx: 0,                           // 有时刷新页面用
    selectOrderList: [],             // 选中订单池订单
    selectVehicles: [],              // 选中运力池数据
    showSmartSchedulingModal: false, // 显示智能调度弹窗
    showMenuModal: false,            // 显示选订单弹窗
    showVehicleModal: false,         // 显示选车辆弹窗
    showResultDrawer: false,         // 显示调度结果右侧侧边栏
    showButtonDrawer: true,          // 显示左边按钮侧边栏
    scheduleResults: [],             // 智能调度排车结果
    unassignedNodes:[],              // 智能调度未分配节点
    btnLoading: false,               // 智能调度按钮加载状态
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
      queryDict('warehouse').then(res => {    // 获取当前仓库经纬度
        const description = res.data.find(x => x.itemValue === loginOrg().uuid)?.description
        if (description) this.warehousePoint = description.split(',').reverse().join(',')  // 字典经纬度位置调换位置
        else message.error('获取当前仓库经纬度失败')
      })
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }
  }

  /** 非状态变量改变后可刷新页面 */
  sxYm = () => {
    this.setState({ sx: this.state.sx + 1 })
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
    this.setState({ btnLoading: true })
    const result = await getSmartScheduling(requestBody)
    this.setState({ btnLoading: false })

    if (result.errmsg !== 'OK' || !result.data) return message.error(result.errmsg)
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
    const { map, AMap, colors, warehouseMarker, warehousePoint, groupMarkers } = this
    if (!warehouseMarker) { // 仓库点
      this.warehouseMarker = new AMap.Marker({
        position: warehousePoint.split(','),      // 设置Marker的位置
        anchor: 'center',              // 设置Marker的锚点
        content: `<div class="${styles.point}">仓</div>`
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
    const { map, AMap, colors, groupMarkers, warehouseMarker } = this
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
    // 每16个点做一次规划
    arr16.forEach(line => {
      const waypoints = line.slice(1, line.length - 1).map(x => x.getPosition())
      // 根据起终点经纬度规划驾车导航路线
      driving.search(line[0].getPosition(), line[line.length - 1].getPosition(), { waypoints },
        (status, result) => {
          if (status === 'complete') {
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
            this.sxYm()
          } else message.error('获取驾车数据失败')
        })
    })
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
    } = this.state

    return (
      <div className={styles.SmartScheduling}>
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
          width={this.RIGHT_DRAWER_WIDTH}
          onClose={() => this.setState({ showResultDrawer: false })}
          visible={showResultDrawer}
        >{scheduleResults.length ?
          scheduleResults.map((orders, index) =>
            <div
              style={{
                padding: 4,
                borderRadius: 8,
                marginBottom: 5,
                cursor: 'pointer',
                boxShadow: '2px 2px 5px 0px #39487061',
                border: this.routingPlans[index] ? `${this.colors[index]} solid 2px` : 'unset',
              }}
              onClick={()=> this.routePlanning(index)}
            >
              <div style={{width: 14, height: 14, background: this.colors[index], marginRight: 5,display: 'inline-block'}}/>
              <span style={{fontSize: '16px'}}>线路{index + 1}</span>
              <Divider style={{ margin: 6 }}/>
              门店数: {orders.length} &nbsp;&nbsp;
              总重量: {Math.round(orders.reduce((acc, cur) => acc + cur.weight, 0))/100} &nbsp;&nbsp;
              总体积: {Math.round(orders.reduce((acc, cur) => acc + cur.volume, 0))/100} &nbsp;&nbsp;
            </div>
          )
          :
          <Empty/>
        }

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
                        ,
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
                是否算返回仓库：
                <Select
                  value={routingConfig.isBack}
                  style={{ width: 120 }}
                  onChange={v => this.setState({ routingConfig: { ...routingConfig, isBack: v } })}
                >
                  <Option value={0}>是</Option>
                  <Option value={1}>否</Option>
                </Select>
              </div>

              <div>
                <Button onClick={() => this.setState({ showVehicleModal: true })}>
                  加载车辆
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
                                selectVehicles: selectVehicles.filter((v, i) => i !== index)
                              })}
                            >
                              删除
                            </Button>
                          )
                        }
                      ]}
                    />
                  </>
                  :
                  <Empty description="请选择排车车辆,以便统计"/>
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
          onOk={() => {
            if (!this.orderPoolModalRef.state) return message.error('数据异常，请刷新页面重试')
            const { selectOrders } = this.orderPoolModalRef.state
            if (!selectOrders.length) return message.error('请先选择订单')
            // 有些仓是一个运输订单是多个订单，所以需要合并
            let mergeOrders = Object.values(
              selectOrders.reduce((acc, order) => {
                if (!acc[order.deliveryPoint.uuid]) {
                  acc[order.deliveryPoint.uuid] = JSON.parse(JSON.stringify(order))
                } else {
                  acc[order.deliveryPoint.uuid].weight += order.weight
                  acc[order.deliveryPoint.uuid].volume += order.volume
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
          }}
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
            let selectVehicleList = vehicleData.filter(v => vehicleRowKeys.includes(v.CODE))
            if (selectVehicleList.some(v => !v.BEARVOLUME || !v.BEARWEIGHT)) {
              message.warning('已过滤没有重量体积的车辆')
              selectVehicleList = selectVehicleList.filter(v => v.BEARVOLUME && v.BEARWEIGHT)
            }
            // ——————————————车辆分组——————————————
            // 创建一个空对象来存储分组后的车量数据
            const groupedData = {};
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
            const groupedVehicle = Object.values(groupedData);

            this.setState({ showVehicleModal: false, selectVehicles: groupedVehicle })
          }}
        >
          <VehiclePoolPage
            ref={ref => (this.vehiclePoolModalRef = ref)}
            searchKey="VehiclePoolPageModal"
            tabHeight={80}
          />
        </Modal>

      </div>
    )
  }

}