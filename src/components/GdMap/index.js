import React, { Component } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import ShopsIcon from '@/assets/common/shops.png';
import './index.less'

/**
 * 高德地图
 * @author ChenGuangLong
 * @since 2024/9/19 16:33
 */
class GdMap extends Component {
  constructor (props) {
    super(props)
    this.map = {}
    this.AMap = null
  }

  // 2.dom渲染成功后进行map对象的创建
  componentDidMount () {
    window._AMapSecurityConfig = {
      securityJsCode: "77a94bd6b19c71f32a6a5154764fe7f6",   // 安全密钥，路线规划必须要这个配置
    };
    AMapLoader.load({
      key: '0adda227efca2b24d25df3213c87cca2', // 需要设置您申请的key
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.Driving'],
      AMapUI: { version: '1.1', plugins: [], },
      Loca: { version: '2.0.0' },
    }).then((AMap) => {
      this.AMap=AMap
      this.map = new AMap.Map('mapcontainer', {
        viewMode: '3D',
        zoom: 5,
        zooms: [2, 22],
        center: [113.802834,23.061303],
      })
    }).catch(e => {
      console.error(e)
    })
  }

  /**
   * 生成默认图标
   * @param positionArr{[{longitude:number,latitude:number}]} 包涵经纬度和图标
   * @author ChenGuangLong
   * @since 2024/9/20 10:04
  */
  addMarkers = (positionArr) => {
    const positionList = positionArr || this.props.positionArr || []
    positionList.forEach(item => {
      const marker = new this.AMap.Marker({
        position: [item.longitude, item.latitude],          // 设置Marker的位置
        anchor: 'bottom-center',                            // 设置Marker的锚点
      })
      this.map.add(marker)
    })
  }

  /**
   * 生成门店图标
   * @param positionArr{[{longitude:number,latitude:number,iconNum:number}]} 包涵经纬度和图标序号（1~20）
   * @param labelContent{(item)=>string}                                    显示文字(元素也得用双引号括起来)
   * @author ChenGuangLong
   * @since 2024/9/20 10:04
   */
  addStoreMarkers = (positionArr, labelContent = null) => {
    positionArr.forEach(item => {
      const marker = new this.AMap.Marker({            // 创建一个Marker对象
        position: [item.longitude, item.latitude],          // 设置Marker的位置
        icon: this.generateStoreIcon(item.iconNum),    // 设置Marker的图标
        anchor: 'bottom-center',                            // 设置Marker的锚点
      })
      if (labelContent) {                                   // 如果有文字 就鼠标移入显示文字
        marker.on('mouseover', () => {                // 鼠标移入
          marker.setzIndex(13)                              // 提升层级 不然弹出来的会被其他指标遮住
          marker.setLabel({
            direction: 'top',
            offset: new this.AMap.Pixel(0, -5),             // 设置文本标注偏移量
            content: `${labelContent(item).toString()}`,    // 设置文本标注内容
          })
        })
        marker.on('mouseout', () => {                 // 鼠标移出
          marker.setzIndex(12)
          marker.setLabel({ direction: undefined, offset: undefined, content: undefined })
        })
      }
      this.map.add(marker)
    })
  }

  /**
   * 清除地图所有覆盖物
   * @author ChenGuangLong
   * @since 2024/9/21 14:20
  */
  clearMap = () => {
    this.map.clearMap()
  }

  /**
   * 生成门店图标 num是几就是第几个 最小1(默认) 最大20
   * @author ChenGuangLong
   * @since 2024/9/20 9:44
  */
  generateStoreIcon = (num = 1) => {
    return new this.AMap.Icon({
      size: new this.AMap.Size(150 / 5, 120 / 4),                         // 图标尺寸
      image: ShopsIcon,                                                   // 图标的取图地址
      imageSize: new this.AMap.Size(150, 120),                            // 图标所用图片大小
      imageOffset: new this.AMap.Pixel(-(150 / 5) * ((num % 21) - 1), 0)  // 图标取图偏移量  取余防止值超过20
    })
  }

  render () {
    const { title } = this.props
    // 1.创建地图容器
    return (
      <div className="home_div">
        <div className="map-title">
          <h3>{title}</h3>
        </div>
        <div id="mapcontainer" className="map" style={{ height: '100%' }} />
      </div>
    )
  }
}

export default GdMap


