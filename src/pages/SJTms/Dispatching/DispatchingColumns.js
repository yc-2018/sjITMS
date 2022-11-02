import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';

export const OrderColumns = [
  {
    title: '单号',
    dataIndex: 'billNumber',
    sorter: true,
    width: 130,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '作业号',
    dataIndex: 'waveNum',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 60,
    render: val => {
      return val ? <EllipsisCol colValue={val.code} /> : <Empty />;
    },
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    sorter: true,
    width: 60,
    render: val => (val ? <EllipsisCol colValue={OrderType[val].caption} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    sorter: true,
    sorterCode: true,
    width: 150,
    render: val => {
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    sorter: true,
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
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
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
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
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '送货地址',
    dataIndex: 'address',
    width: 150,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 120,
    render: val => {
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 150,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
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
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
];
export const OrderDetailColumns = [
  {
    title: '运输单号',
    dataIndex: 'billNumber',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    sorter: true,
    width: 60,
    render: val => (val ? <EllipsisCol colValue={OrderType[val].caption} /> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillCartonCount',
    width: 60,
    render: val => (val != undefined ? <span>{val}</span> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '备注',
    dataIndex: 'note',
    width: 80,
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
};

export const CreatePageOrderColumns = [
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '订单号',
    dataIndex: 'billNumber',
    width: 140,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '收货方',
    dataIndex: 'deliveryPoint',
    width: 120,
    render: val => {
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '收货方地址',
    width: 120,
    render: (val, record) => {
      return record.deliveryPoint ? (
        <EllipsisCol colValue={record.deliveryPoint.address} />
      ) : (
        <Empty />
      );
    },
  },
  {
    title: '单据类型',
    dataIndex: 'orderType',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={OrderType[val].caption} /> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'stillCartonCount',
    width: 60,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'stillScatteredCount',
    width: 60,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'stillContainerCount',
    width: 60,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 60,
    sorter: true,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 60,
    sorter: true,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
];

export const ScheduleColumns = [
  {
    title: '单号',
    dataIndex: 'billNumber',
    width: 150,
    sorter: true,
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPointCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '车辆信息',
    dataIndex: 'vehicle',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '司机',
    dataIndex: 'carrier',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'cartonCount',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'scatteredCount',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'containerCount',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '创建人',
    dataIndex: 'createInfo',
    width: 80,
    render: val => (val ? <span>{val.operator.fullName}</span> : <Empty />),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 80,
    render: (_, record) =>
      record.createInfo.time ? <span>{record.createInfo.time}</span> : <Empty />,
  },
  {
    title: '最后修改人',
    dataIndex: 'lastModifyInfo',
    width: 80,
    render: val => (val ? <span>{val.operator.fullName}</span> : <Empty />),
  },
  {
    title: '最后修改时间',
    dataIndex: 'lastModifyTime',
    width: 80,
    render: (_, record) =>
      record.lastModifyInfo.time ? <span>{record.lastModifyInfo.time}</span> : <Empty />,
  },
];
export const ScheduleDetailColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNumber',
    width: 150,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    width: 150,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'cartonCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'scatteredCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'containerCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
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
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '送货地址',
    dataIndex: 'address',
    width: 150,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '线路',
    dataIndex: 'archLine',
    sorter: true,
    sorterCode: true,
    width: 120,
    render: val => {
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '货主',
    dataIndex: 'owner',
    sorterCode: true,
    sorter: true,
    width: 150,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '整件数',
    dataIndex: 'cartonCount',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '散件数',
    dataIndex: 'scatteredCount',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'containerCount',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'volume',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    sorter: true,
    width: 80,
    render: val => (val ? <EllipsisCol colValue={(val / 1000).toFixed(3)} /> : <Empty />),
  },
];

export const pagination = {
  defaultPageSize: 20,
  size: 'small',
  showSizeChanger: true,
  pageSizeOptions: ['20', '50', '100', '200', '500'],
  showTotal: total => `共 ${total} 条`,
};
