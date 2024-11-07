// ///////////////////////////智能调度页面//////////////
import React, { Component, createRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Button, Col, Drawer, Empty, Icon, message, Modal, Row, Select, Table } from 'antd'
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
  AMap = null                   // 高德地图对象
  map = null                    // 高德地图实例
  text = null                   // 高德地图文本对象
  warehousePoint = ''
  vehiclePoolModalRef = createRef()
  orderPoolModalRef = createRef()

  state = {
    selectOrderList: [],             // 选中订单池订单
    selectVehicles: [],              // 选中运力池数据
    showSmartSchedulingModal: false, // 显示智能调度弹窗
    showMenuModal: false,            // 显示选订单弹窗
    showVehicleModal: false,         // 显示选车辆弹窗
    showResultDrawer: false,         // 显示调度结果右侧侧边栏
    showButtonDrawer: true,          // 显示左边按钮侧边栏
    scheduleResults: [],             // 智能调度排车结果
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
      name: `${x.deliveryPoint.code}`,                         // 配送点poi名称
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

    const result = await getSmartScheduling(requestBody)
    if (result.errmsg !== 'OK') return message.error(result.errmsg)

    this.setState({ showSmartSchedulingModal: false, showButtonDrawer: false, showResultDrawer: true })
  }


  render () {
    const {
      showSmartSchedulingModal,
      showMenuModal,
      showVehicleModal,
      showResultDrawer,
      showButtonDrawer,
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
          style={{ right: showResultDrawer ? '250px' : '-15px' }}
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
          placement="right"
          mask={false}
          getContainer={false}
          onClose={() => this.setState({ showResultDrawer: false })}
          visible={showResultDrawer}
        >{scheduleResults.length ?
          <>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </>
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
          confirmLoading={false}
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
                    columns={mergeOrdersColumns}
                    dataSource={selectOrderList}
                    scroll={{ x: '38vw', y: 'calc(100vh - 217px)' }}
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