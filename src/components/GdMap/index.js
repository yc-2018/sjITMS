import React, { Component } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import ShopsIcon from '@/assets/common/shops.png'
import MyjRedIcon from '@/assets/common/MyjRedMin.png'
import MyjGreenIcon from '@/assets/common/23.png'
import MyjBlueIcon from '@/assets/common/24.png'
import vanIcon from '@/assets/common/vanMin.png';
import './index.less'

/**
 * 高德地图基础组件
 * <br>{@link #addMarkers }               🫵生成默认坐标（批量）
 * <br>{@link #addStoreMarkers }          🫵生成门店坐标（批量）
 * <br>{@link #generateStoreIcon }        🫵生成门店图标
 * <br>{@link #generateMyjIcon }          🫵生成美宜佳图标
 * <br>{@link #generateVanIcon }          🫵生成货车图标
 * <br>{@link #autoFocusViewPort }        🫵自动聚焦
 * <br>{@link #clearMap }                 🫵清除地图所有覆盖物
 * <br>{@link #removeMarkersByType }      🫵根据类型删除点
 * <br>{@link #chunkArrayWithOverlap }    🫵分割数组
 * @author ChenGuangLong
 * @since 2024/9/19 16:33
 */
class GdMap extends Component {
  constructor (props) {
    super(props)
    this.map = {}           // 地图对象
    this.text = {}          // 文本对象
    this.AMap = null        // 高德地图类
    this.markerObj={        // 分类记录点坐标
      store: [],
      myj: [],
      van: [],
    }
  }

  // 2.dom渲染成功后进行map对象的创建
  componentDidMount () {
    // window._AMapSecurityConfig = {
    //   securityJsCode: '77a94bd6b19c71f32a6a5154764fe7f6',   // 安全密钥，路线规划必须要这个配置
    // }
    AMapLoader.load({
      key: '0adda227efca2b24d25df3213c87cca2', // 需要设置您申请的key
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.Driving', 'AMap.MouseTool'],
      AMapUI: { version: '1.1', plugins: [], },
      Loca: { version: '2.0.0' },
    }).then((AMap) => {
      this.AMap = AMap
      this.map = new AMap.Map('mapcontainer', {
        viewMode: '3D',
        zoom: 9,
        zooms: [2, 22],
        center: [113.802834, 23.061303],
      })
    }).catch(e => console.error('🔴获取高德地图类对象失败🟠', e))
  }

  /**
   * 生成默认坐标（批量）
   * @param positionArr{[{longitude:number,latitude:number}]} 包涵经纬度和图标
   * @author ChenGuangLong
   * @since 2024/9/20 10:04
   */
  addMarkers = (positionArr) => {
    const positionList = positionArr || this.props.positionArr || []
    positionList.forEach(item => {
      const {longitude, latitude,lng, lat} = item
      const marker = new this.AMap.Marker({
        position: [longitude ?? lng, latitude ?? lat],      // 设置Marker的位置
        anchor: 'bottom-center',                            // 设置Marker的锚点
      })
      this.map.add(marker)
    })
  }

  /**
   * 生成门店坐标（批量）
   * 注意事项：如果图标是门店对象要包涵：iconNum（图标序号）字段 如果是myj对象要包涵 sort和isSelect字段
   *
   * @param positionArr{[{longitude:number,latitude:number,iconNum:number}]} 包涵经纬度和图标序号（1~20）
   * @param labelContent{(item)=>string}                                    显示文字(元素也得用双引号括起来)
   * @param icon{'store'|'myj','van'}                                       图标
   * @param click{(item)=>void}                                            点击事件
   * @author ChenGuangLong
   * @since 2024/9/20 10:04
   */
  addStoreMarkers = (positionArr = [], labelContent = null, icon = 'store', click) => {
    const positionList = positionArr.filter(item=>item.longitude && item.latitude)
    if (positionList.length === 0) return
    this.markerObj[icon] = []                               // 清空数组
    positionList.forEach(item => {
      const marker = new this.AMap.Marker({            // 创建一个Marker对象
        position: [item.longitude, item.latitude],          // 设置Marker的位置
        icon: {                                             // 设置Marker的图标
          store: this.generateStoreIcon(item.iconNum),
          myj: this.generateMyjIcon(item),
          van: this.generateVanIcon(),
        }[icon],
        anchor: 'bottom-center',                            // 设置Marker的锚点
        // extData: { obj: item },                          // 用户自定义属性
      })
      if (labelContent) {                                   // 如果有文字 就鼠标移入显示文字
        marker.on('mouseover', () => {                // 鼠标移入
          this.text = new this.AMap.Text({
            position: new this.AMap.LngLat(item.longitude, item.latitude),
            anchor: 'bottom-center',
            text: labelContent(item),                        // 设置文本标注内容
            offset: new this.AMap.Pixel(0, -31),             // 设置文本标注偏移量
          });
          this.map.add(this.text);
        })
        marker.on('mouseout', () => {                 // 鼠标移出
          this.text && this.map.remove(this.text)
        })
      }
      if (icon === 'myj' && item.isSelect && item.sort) marker.setLabel({ content: item.sort })
      if (click) marker.on('click', () => click(item))

      this.markerObj[icon].push(marker)
    })
    this.map.add(this.markerObj[icon])
  }

  /**
   * 获取最大经度和纬度，获取最小经度和纬度（自动聚焦）
   * @param points{[{longitude:number,latitude:number}]} 带经纬度的对象列表
   * @author ChenGuangLong
   * @since 2024/9/20 11:49
   */
  autoFocusViewPort = points => {
    if (!points || !points.length) return
    try {
      const maxLng = Math.max(...points.map(point => point.longitude)) + 0.009
      const minLng = Math.min(...points.map(point => point.longitude)) - 0.009
      const maxLat = Math.max(...points.map(point => point.latitude)) + 0.009
      const minLat = Math.min(...points.map(point => point.latitude)) - 0.009
      const bounds = new this.AMap.Bounds([minLng, minLat], [maxLng, maxLat])
      this.map.setBounds(bounds)
    } catch (e) {console.error('对焦报错了:', e) }
  }

  /**
   * 清除地图所有覆盖物(线路清不掉的)
   * @author ChenGuangLong
   * @since 2024/9/21 14:20
   */
  clearMap = () => {
    this.map.clearMap()
    this.markerObj={
      store: [],
      myj: [],
      van: [],
    }
  }

  /**
   * 根据类型删除点
   * @param type{'store'|'myj','van'}
   * @author ChenGuangLong
   * @since 2024/9/25 9:59
  */
  removeMarkersByType = (type) => {
    if (this.markerObj[type].length === 0) return
    this.map.remove(this.markerObj[type])
    this.markerObj[type] = []
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

  /**
   * 生成美宜佳图标
   * @author ChenGuangLong
   * @since 2024/9/23 16:30
   */
  generateMyjIcon = (order = {}) => {
    const icon = order.isSelect ? (order.sort ? MyjBlueIcon : MyjGreenIcon) : MyjRedIcon
    return new this.AMap.Icon({
      size: new this.AMap.Size(20, 20),          // 图标尺寸
      image: icon,                               // 图标的取图地址
      imageSize: new this.AMap.Size(20, 20),     // 图标所用图片大小
    })
  }

  /**
   * 生成货车图标
   * @author ChenGuangLong
   * @since 2024/9/24 11:31
  */
  generateVanIcon = () => {
    return new this.AMap.Icon({
      size: new this.AMap.Size(20, 20),          // 图标尺寸
      image: vanIcon,                            // 图标的取图地址
      imageSize: new this.AMap.Size(20, 20),     // 图标所用图片大小
    })
  }

  /**
   * 将一个数组按指定大小分割为多个子数组，相邻的子数组之间会有一个重叠元素。
   *
   * @param {Array} array - 需要分割的原始数组。
   * @param {number} size - 每个子数组的大小。每个子数组的最后一个元素
   *                        会作为下一个子数组的第一个元素。
   * @returns {Array[]} 返回一个二维数组，每个子数组为分割后的数组，且相邻的子数组
   *                    之间有重叠的元素。
   *
   * @example
   * const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
   * const chunked = chunkArrayWithOverlap(list, 5);
   * console.log(chunked); // [[1, 2, 3, 4, 5], [5, 6, 7, 8, 9], [9, 10, 11, 12]]
   */
  chunkArrayWithOverlap = (array, size) => {
    const result = []
    for (let i = 0; i < array.length; i += (size - 1)) { // 步进值确保每组之间有一个重叠元素
      result.push(array.slice(i, i + size))
    }
    return result
  }

  render () {
    const { title, style = {} } = this.props
    // 1.创建地图容器
    return (
      <div className="home_div">
        <div className="map-title">
          <h3>{title}</h3>
        </div>
        <div id="mapcontainer" className="map" style={{ height: '100%', ...style }}/>
      </div>
    )
  }
}

export default GdMap


