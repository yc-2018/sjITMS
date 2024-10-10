// ////////// 线路地图 页面 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\LineSystem\LineGdMap.js  由`陈光龙`创建 时间：2024/10/9 15:21
import React, { Component } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { message } from 'antd'
import { AMapDefaultConfigObj, AMapDefaultLoaderObj } from '@/utils/mapUtil'
import { dynamicqueryById } from '@/services/quick/Quick'

/**
 * 线路地图组件
 * @param props.lineuuid {string} 线路uuid
 * @param [props.height] {string} 高度
 * @author ChenGuangLong
 * @since 2024/10/9 17:36
 */
export default class LineGdMap extends Component {
  map                                       // 地图对象
  AMap                                      // 高德地图类
  text                                      // 高德地图文本对象
  markers = []                       // 地图标记对象列表
  idSuffix = new Date().valueOf()  // ID后缀 保证id唯一
  state = {
    lineShipAddress: [],
  }

  componentDidMount = async () => {
    try { // 加载高德地图，放在最前面
      const AMap = await AMapLoader.load(AMapDefaultLoaderObj)
      this.AMap = AMap
      this.map = new AMap.Map(`LineMap${this.idSuffix}`, AMapDefaultConfigObj)
      if (this.props.lineuuid) this.getSerialArchLineList() // 获取线路点数据
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }
  }

  /** 检查 props 中的 lineuuid 是否发生变化  获取线路点数据 */
  componentDidUpdate (prevProps) {
    if (prevProps.lineuuid !== this.props.lineuuid && this.props.lineuuid)
      this.getSerialArchLineList()
  }

  /** 获取门店数据 */
  getSerialArchLineList = () => {
    const { lineuuid } = this.props
    const param = {
      tableName: 'V_SJ_ITMS_LINE_SHIP_ADDRESS',
      condition: {
        params: [{ field: 'LINEUUID', rule: 'eq', val: [lineuuid] }],
      },
    }
    dynamicqueryById(param).then(response => {
      if (response.result.records !== 'false') {
        this.setState({
          lineShipAddress: response.result.records,
        }, this.refreshLineMarkers)
      }
    }).catch(() => {message.error('获取地图点位数据失败')})
  }

  /**
   * 刷新线路点坐标
   * @author ChenGuangLong
   * @since 2024/10/9 16:01
   */
  refreshLineMarkers = () => {
    const { lineShipAddress } = this.state
    if (!this.map) return message.error('地图消失')
    // 先清除再添加
    if (this.markers.length > 0) {
      this.map.remove(this.markers)
      this.markers = []
    }

    lineShipAddress.filter(x => x.LONGITUDE && x.LATITUDE).forEach(item => {
      // 创建点位
      const marker = new this.AMap.Marker({
        position: [item.LONGITUDE, item.LATITUDE],          // 设置Marker的位置
        anchor: 'bottom-center',                            // 设置Marker的锚点
        label: { content: item.ADDRESSNAME },
      })
      // 鼠标移入事件
      marker.on('mouseover', () => {
        this.text = new this.AMap.Text({
          position: new this.AMap.LngLat(item.LONGITUDE, item.LATITUDE),
          anchor: 'bottom-center',
          text: `
            <div>[${item.ADDRESSCODE}]${item.ADDRESSNAME}</div>
            <div>经纬度：${item.LONGITUDE},${item.LATITUDE}</div>
          `,
          offset: new this.AMap.Pixel(0, -31),             // 设置文本标注偏移量
        });
        this.map.add(this.text);
      })
      // 鼠标移出事件
      marker.on('mouseout', () => {
        this.text && this.map.remove(this.text)
      })
      // 保存对象的引用
      this.markers.push(marker)
    })
    this.map.add(this.markers)                              // 添加到地图
    this.map.setFitView()                                   // 自动缩放地图
  }

  render () {
    // id一定要唯一
    return <div id={`LineMap${this.idSuffix}`} style={{ height: this.props.height ?? 'calc(100vh - 200px)' }}/>
  };
}
