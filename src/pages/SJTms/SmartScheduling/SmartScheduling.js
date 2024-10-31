import React, { Component } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Button, Col, Drawer, Empty, Icon, message, Modal, Row, Select } from 'antd'
import { AMapDefaultConfigObj, AMapDefaultLoaderObj } from '@/utils/mapUtil'
import styles from './SmartScheduling.less'

const { Option } = Select

export default class SmartScheduling extends Component {
  AMap = null                   // 高德地图对象
  map = null                    // 高德地图实例
  text = null                   // 高德地图文本对象

  state = {
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
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }

  }

  render () {
    const {
      showSmartSchedulingModal,
      showMenuModal,
      showVehicleModal,
      showResultDrawer,
      showButtonDrawer,
      routingConfig,
      scheduleResults,
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
        {/* ——————————————————————左侧边栏开关———————————————————— */}
        <span
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

        {/* ——————————————————————右侧边栏开关———————————————————— */}
        <span
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
        {/* ——————————————————————侧边栏———————————————————— */}
        <Drawer
          title="智能调度结果"
          placement="right"
          mask={false}
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

        {/* ——————————————————————智能调度弹窗———————————————————————— */}
        <Modal
          title="智能调度"
          visible={showSmartSchedulingModal}
          onOk={() => {}}
          okText="开始智能调度"
          width="100vw"
          style={{ top: 0 }}
          className={styles.modalxxxxxx}
          onCancel={() => this.setState({ showSmartSchedulingModal: false })}
          confirmLoading={false}
          getContainer={false}    // 挂载到当前节点，因为选单弹窗先弹出又在同一个节点 就会在底下显示看不到
        >
          <Row style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
            <Col span={12}>
              <Button onClick={() => this.setState({ showMenuModal: true })}>
                加载订单
              </Button>

              选单
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
                选车
              </div>

            </Col>
          </Row>
        </Modal>

        {/* ————————————————————订单池弹窗———————————————————————— */}
        <Modal
          title="订单池"
          visible={showMenuModal}
          onOk={() => {}}
          onCancel={() => this.setState({ showMenuModal: false })}
        >
          选择订单...........
        </Modal>

        {/* ——————————————————运力池弹窗———————————————————— */}
        <Modal
          title="运力池"
          visible={showVehicleModal}
          onOk={() => {}}
          onCancel={() => this.setState({ showVehicleModal: false })}
        >
          选择车辆...........
        </Modal>

      </div>
    )
  }

}