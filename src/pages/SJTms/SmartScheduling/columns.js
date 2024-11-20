import React from 'react'
import Empty from '@/pages/Component/Form/Empty'
import { convertCodeName } from '@/utils/utils'

/**
 * 智能调度选择的订单简单显示
 * @author ChenGuangLong
 * @since 2024/11/5 下午3:39
 */
export const mergeOrdersColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 50,
    align: 'center',
    render: (_text, _record, index) => `${index + 1}`,
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    width: 270,
    render: val => {
      return val ? <span>{convertCodeName(val)}</span> : <Empty/>
    },
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty/>),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 80,
    render: val => (val ? <span>{val.toFixed(4)}</span> : <Empty/>),
  },
  // {
  //   title: '配送区域',
  //   dataIndex: 'shipAreaName',
  //   width: 90,
  //   render: val => (val ? <span>{val}</span> : <Empty/>),
  // },
  // {
  //   title: '线路',
  //   dataIndex: 'archLine',
  //   width: 100,
  //   render: val => {
  //     return val ? <span>{val.code}</span> : <Empty/>
  //   },
  // },
  // {
  //   title: '货主',
  //   dataIndex: 'owner',
  //   width: 110,
  //   render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty/>),
  // },
  // {
  //   title: '配送备注',
  //   dataIndex: 'tmsNote',
  //   width: 80,
  //   render: val => (val ? <span>{val}</span> : <Empty/>),
  // },
]

/**
 * 智能调度选择的车辆合并数据显示
 * @author ChenGuangLong
 * @since 2024/11/6 上午9:14
 */
export const mergeVehicleColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 50,
    align: 'center',
    render: (_text, _record, index) => `${index + 1}`,
  },
  // {
  //   title: '组队',
  //   dataIndex: 'vehicleGroup',
  //   width: 100,
  //   render: val => (val ? <span>{val}</span> : <Empty/>),
  // },
  {
    title: '限载重量',
    dataIndex: 'weight',
    width: 100,
  },
  {
    title: '限载体积',
    dataIndex: 'volume',
    width: 100,
  },
]

/** 运力池显示列 */
export const vehicleColumns = [
  {
    title: '限载重量',
    dataIndex: 'BEARWEIGHT',
    sorter: true,
    width: 80,
    render: val => {
      return val ? <span>{val}</span> : <Empty/>
    },
  },
  {
    title: '限载体积',
    dataIndex: 'BEARVOLUME',
    sorter: true,
    width: 80,
    render: (val, record) =>
      val ? <span>{Math.round(val * record.BEARVOLUMERATE) / 100}</span> : <Empty/>,
  },
]