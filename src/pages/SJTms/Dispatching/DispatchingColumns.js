import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';

export const OrderColumns = [
  {
    title: '单号',
    dataIndex: 'billNumber',
    sorter: true,
    width: 130,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '作业号',
    dataIndex: 'waveNum',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 100,
    render: val => {
      return val ? <span>{val.code}</span> : <Empty />;
    },
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{OrderType[val].caption}</span> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    sorter: true,
    sorterCode: true,
    width: 150,
    render: val => {
      return val ? <span>{convertCodeName(val)}</span> : <Empty />;
    },
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 100,
    render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    sorter: true,
    width: 120,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillContainerCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
  {
    title: '到货类型',
    dataIndex: 'arrivalType',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '到效日期',
    dataIndex: 'expiryDate',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '配送区域',
    dataIndex: 'shipAreaName',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '班组',
    dataIndex: 'contact',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '班次',
    dataIndex: 'shiftType',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '备注',
    dataIndex: 'note',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
];
export const OrderCollectColumns = [
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    sorter: true,
    sorterCode: true,
    width: 150,
    render: val => {
      return val ? <span>{convertCodeName(val)}</span> : <Empty />;
    },
  },
  {
    title: '送货地址',
    dataIndex: 'address',
    width: 150,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 120,
    render: val => {
      return val ? <span>{val.code}</span> : <Empty />;
    },
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 150,
    render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillContainerCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
];
export const OrderDetailColumns = [
  {
    title: '运输单号',
    dataIndex: 'billNumber',
    sorter: true,
    width: 120,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    sorter: true,
    width: 120,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{OrderType[val].caption}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillCartonCount',
    sorter: true,
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '到效日期',
    dataIndex: 'expiryDate',
    width: 80,
    sorter: true,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '备注',
    dataIndex: 'note',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
];

export const VehicleColumns = [
  {
    title: '车辆代码',
    dataIndex: 'CODE',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '车牌号',
    dataIndex: 'PLATENUMBER',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '司机',
    dataIndex: 'DRIVERNAME',
    sorter: true,
    width: 80,
    render: val => {
      return val ? <span>{val}</span> : <Empty />;
    },
  },
  {
    title: '送货员',
    dataIndex: 'DELIVERYMAN',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '限载重量',
    dataIndex: 'BEARWEIGHT',
    sorter: true,
    width: 80,
    render: val => {
      return val ? <span>{val}</span> : <Empty />;
    },
  },
  {
    title: '限载体积',
    dataIndex: 'BEARVOLUME',
    sorter: true,
    width: 80,
    render: (val, record) =>
      val ? <span>{Math.round(val * record.BEARVOLUMERATE) / 100}</span> : <Empty />,
  },
  {
    title: '当前任务数',
    dataIndex: 'BILLCOUNTS',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '当前门店数',
    dataIndex: 'DELIVERYPOINTS',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '组队',
    dataIndex: 'VEHICLEGROUP',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '配送区域',
    dataIndex: 'SHIPAREANAME',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
];

const OrderType = {
  Delivery: {
    name: 'Delivery',
    caption: '门店配送',
  },
  OnlyBill: {
    name: 'OnlyBill',
    caption: '单据过账',
  },
  TakeDelivery: {
    name: 'TakeDelivery',
    caption: '提货',
  },
  DeliveryAgain: {
    name: 'DeliveryAgain',
    caption: '门店配送（重送）',
  },
  Transshipment: {
    name: 'Transshipment',
    caption: '转运',
  },
  Returnable: {
    name: 'Returnable',
    caption: '门店退货',
  },
  AdjustWarehouse: {
    name: 'AdjustWarehouse',
    caption: '调仓',
  },
};

export const CreatePageOrderColumns = [
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 100,
    render: val => {
      return val ? <span>{val.code}</span> : <Empty />;
    },
  },
  {
    title: '订单号',
    dataIndex: 'billNumber',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '收货方',
    dataIndex: 'deliveryPoint',
    sorter: true,
    width: 180,
    render: val => {
      return val ? <span>{convertCodeName(val)}</span> : <Empty />;
    },
  },
  {
    title: '收货方地址',
    sorter: true,
    width: 180,
    render: record => {
      return record.deliveryPoint ? <span>{record.deliveryPoint.address}</span> : <Empty />;
    },
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{OrderType[val].caption}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillContainerCount',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 60,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 60,
    sorter: true,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
];

export const ScheduleColumns = [
  {
    title: '单号',
    dataIndex: 'BILLNUMBER',
    sorter: true,
    width: 150,
  },
  {
    title: '送货点',
    dataIndex: 'DELIVERYPOINTCOUNT',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '车辆信息',
    dataIndex: 'VEHICLECODE',
    sorter: true,
    width: 120,
    render: (val, record) =>
      val ? <span>{`[${val}]${record.VEHICLEPLATENUMBER}`}</span> : <Empty />,
  },
  {
    title: '司机',
    dataIndex: 'CARRIERCODE',
    sorter: true,
    width: 100,
    render: (val, record) =>
      val ? (
        <span>{`[${val}]${record.CARRIERNAME.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}`}</span>
      ) : (
        <Empty />
      ),
  },
  {
    title: '整件数',
    dataIndex: 'CARTONCOUNT',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{Math.round(val * 100) / 100}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'SCATTEREDCOUNT',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'CONTAINERCOUNT',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'VOLUME',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{Math.round(val * 100) / 100}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'WEIGHT',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{Math.round(val * 1000) / 1000}</span> : <Empty />),
  },
  {
    title: '总金额',
    dataIndex: 'TOTALAMOUNT',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '总件数',
    dataIndex: 'TOTALCARTONCOUNT',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '承重',
    dataIndex: 'BEARWEIGHT',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量装载率',
    dataIndex: 'VEHICLEWEIGHT',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val + '%'}</span> : <Empty />),
  },
  {
    title: '体积装载率',
    dataIndex: 'VEHICLEVOLUME',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val + '%'}</span> : <Empty />),
  },
  {
    title: '车辆容积',
    dataIndex: 'BEARVOLUME',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '班组',
    dataIndex: 'CONTACT',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '创建人',
    dataIndex: 'CREATORNAME',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '创建时间',
    dataIndex: 'CREATED',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '最后修改人',
    dataIndex: 'LASTMODIFIERNAME',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '最后修改时间',
    dataIndex: 'LASTMODIFIED',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
];
export const ScheduleDetailColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNumber',
    sorter: true,
    width: 150,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 120,
    render: val => {
      return val ? <span>{val.code}</span> : <Empty />;
    },
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    sorter: true,
    width: 120,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    sorter: true,
    width: 150,
    render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'cartonCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{Math.round(val * 100) / 100}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'scatteredCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'containerCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorter: true,
    width: 100,
    render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty />),
  },
  {
    title: '到效日期',
    dataIndex: 'expiryDate',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '备注',
    dataIndex: 'note',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
];
export const ScheduleDetailCollectColumns = [
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    sorter: true,
    sorterCode: true,
    width: 150,
    render: val => {
      return val ? <span>{convertCodeName(val)}</span> : <Empty />;
    },
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 120,
    render: val => {
      return val ? <span>{val.code}</span> : <Empty />;
    },
  },
  {
    title: '送货地址',
    dataIndex: 'address',
    sorter: true,
    width: 150,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 150,
    render: val => (val ? <span>{convertCodeName(val)}</span> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'cartonCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{Math.round(val * 100) / 100}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'scatteredCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'containerCount',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <span>{(val / 1000).toFixed(3)}</span> : <Empty />),
  },
];

export const pagination = {
  defaultPageSize: 100,
  size: 'small',
  showSizeChanger: true,
  pageSizeOptions: ['20', '50', '100', '200', '500', '1000'],
  showTotal: total => `共 ${total} 条`,
};
