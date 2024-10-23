import MyjBlueIcon from '@/assets/common/24.png'
import MyjGreenIcon from '@/assets/common/23.png'
import MyjRedIcon from '@/assets/common/MyjRedMin.png'
import ShopsIcon from '@/assets/common/shops.png'

export const AMAP_KEY = '0adda227efca2b24d25df3213c87cca2'

/**
 * 高德地图默认加载器对象    需要其他的在调用处解构添加
 * @author ChenGuangLong
 * @since 2024/10/5 9:19
*/
export const AMapDefaultLoaderObj = {
  key: AMAP_KEY, // 需要设置您申请的key
  version: '2.0',
  plugins: ['AMap.ToolBar', 'AMap.Driving', 'AMap.MouseTool'],
  AMapUI: { version: '1.1', plugins: [], },
  Loca: { version: '2.0.0' },
}
export const AMapDefaultConfigObj = {
  viewMode: '2D',
  zoom: 9,
  zooms: [2, 22],
  center: [113.802834, 23.061303],
}


const X_PI = (Math.PI * 3000.0) / 180.0;

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02) 的转换
 * 即 百度 转 谷歌、高德
 * @param lng 经度
 * @param lat 纬度
 * @returns {*[]}
 */
export const bd09togcj02 = (lng, lat) => {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  const gcjLon = z * Math.cos(theta);
  const gcjLat = z * Math.sin(theta);
  return [gcjLon, gcjLat];
};

/**
 * 给一个带坐标（longitude，latitude）对象，这个坐标从百度转高德
 * @author ChenGuangLong
 * @since 2024/9/23 10:22
*/
export const bdToGd = (obj) => {
  if (!obj || !obj.longitude || !obj.latitude) return obj
  try {
    const [longitude, latitude] = bd09togcj02(obj.longitude, obj.latitude)
    return { ...obj, longitude, latitude }
  } catch (e) {
    console.error('转高德失败:', obj, e)
    return obj
  }
}


/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即 谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
export const gcj02tobd09 = (lng, lat) => {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return [bdLng, bdLat]
};


/**
 * 给一个带坐标（lng，lat）对象，这个坐标从高德转百度
 * @author ChenGuangLong
 * @since 2024/10/7 11:51
 */
export const gdToBd = (obj) => {
  if (!obj || !obj.lng || !obj.lat) return obj
  try {
    const [lng, lat] = gcj02tobd09(obj.lng, obj.lat)
    return { ...obj, lng, lat }
  } catch (e) {
    console.error('转百度失败:', obj, e)
    return obj
  }
}

// ——————————————————————高德地图工具——————————————————————————
/**
 * 获取美宜佳图标
 * @param AMap      {obj}                  地图对象
 * @param [colour]  {'red'|'green'|'blue'} 颜色
 * @param [size]    {number}               尺寸
 * @author ChenGuangLong
 * @since 2024/10/5 9:42
 */
export const getMyjIcon = (AMap, colour = 'red', size = 20) => {
  const icon = {
    'red': MyjRedIcon,
    'green': MyjGreenIcon,
    'blue': MyjBlueIcon
  }[colour]
  return new AMap.Icon({
    size: new AMap.Size(size, size),          // 图标尺寸
    image: icon,                              // 图标的取图地址
    imageSize: new AMap.Size(size, size),     // 图标所用图片大小
  })
}

/**
 * 生成门店图标 num是几就是第几个 最小1(默认) 最大20
 * @param AMap {obj}         地图对象
 * @param [num] {number}     门店图标序号
 * @author ChenGuangLong
 * @since 2024/10/10 15:14
*/
export const getStoreIcon = (AMap, num = 1) => {
  return new AMap.Icon({
    size: new AMap.Size(150 / 5, 120 / 4),                         // 图标尺寸
    image: ShopsIcon,                                              // 图标的取图地址
    imageSize: new AMap.Size(150, 120),                            // 图标所用图片大小
    imageOffset: new AMap.Pixel(-(150 / 5) * ((num % 21) - 1), 0)  // 图标取图偏移量  取余防止值超过20
  })
}















