// //////////  经纬度审核高德地图 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\AddrReport\AddrReportGdMap.js  由`陈光龙`创建 时间：2024/10/10 10:13
import React, { useEffect } from 'react'
import { AMapDefaultConfigObj, getStoreIcon } from '@/utils/mapUtil'
import { getStoreByUUID } from '@/services/sjitms/OrderBill'

let map = null    // 地图实例
let text = null   // 文本实例

/**
 * 经纬度审核高德地图组件
 * @param AMap         高德地图类
 * @param reportData   审核对象
 * @author ChenGuangLong
 * @since 2024/10/10 14:34
*/
const AddrReportGdMap = ({ AMap, reportData }) => {

  /** 页面初始化 */
  useEffect(() => {
    map = new AMap.Map('gdAddrReportMap', AMapDefaultConfigObj)
    return () => {  // 页面卸载时，清除地图实例
      map.destroy()
      map = null
    }
  }, [])

  /**
   * props.reportData 项改变时 自动执行
   * @author ChenGuangLong
   * @since 2024/10/10 14:31
   */
  useEffect(() => {
    map.clearMap() // 清除地图所有覆盖物
    if (!reportData || !reportData.LONGITUDE) return

    /** 获取坐标点 */
    const getMarker = (lng, lat, iconNum = 1) => {
      const marker = new AMap.Marker({                   // 创建一个Marker对象
        position: [lng, lat],                                 // 设置Marker的位置
        anchor: 'bottom-center',                              // 设置Marker的锚点
        icon: getStoreIcon(AMap, iconNum),
      })
      // ——————鼠标移入——————
      marker.on('mouseover', () => {
        text = new AMap.Text({
          position: new AMap.LngLat(lng, lat),
          anchor: 'bottom-center',
          text: iconNum === 1 ? `审核坐标：${lng},${lat}` : `当前坐标:${lng},${lat}`,   // 设置文本标注内容
          offset: new AMap.Pixel(0, -31),                                           // 设置文本标注偏移量
        })
        map.add(text)
      })
      // ——————鼠标移出——————
      marker.on('mouseout', () => {
        text && map.remove(text)
      })
      return marker
    }

    (async () => {
      // 设置司机提供要改变的位置
      const changeMarker = getMarker(reportData.LONGITUDE, reportData.LATITUDE, 1)
      map.add(changeMarker)
      // 获取当前店铺信息
      const storeInfo = await getStoreByUUID(reportData.DELIVERYPOINTUUID)
      if (storeInfo?.data?.latitude) {
        const currentMarker = getMarker(storeInfo.data.longitude, storeInfo.data.latitude, 2)

        // 画条两点的改变的指示线
        const polyline = new AMap.Polyline({
          path: [
            [storeInfo.data.longitude, storeInfo.data.latitude],
            [reportData.LONGITUDE, reportData.LATITUDE]
          ],            // 设置线覆盖物路径
          showDir: true,             // 延路径显示白色方向箭头
          strokeColor: '#725898',   // 线颜色
          strokeWeight: 6,          // 线宽
          lineCap: 'round',         // 线端点样式
        })
        map.add([currentMarker, polyline])
      }
      map.setFitView()
    })()
  }, [reportData])

  return <div id="gdAddrReportMap" style={{ height: 'calc(100vh - 180px)' }}/>

}
export default AddrReportGdMap
