/**
 * 获取高德智能排单排线结果
 * @author ChenGuangLong
 * @since 2024/11/7 上午9:59
 */
export const getSmartScheduling = (params) => {
  return fetch('https://tsapi.amap.com/v1/logistics/route/scheduling?key=611ab0c89bacd00518782d150aa0123f', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
  .then(response => response.json())
}

