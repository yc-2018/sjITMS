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