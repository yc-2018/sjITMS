import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';

export const OrderColumns = [
  {
    title: '线路',
    dataIndex: 'archLineCode',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    width: 150,
    render: val => {
      return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
    },
  },
  {
    title: '整件数(估/实)',
    dataIndex: 'realCartonCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.cartonCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '散件数(估/实)',
    dataIndex: 'realScatteredCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.scatteredCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '周转箱(估/实)',
    dataIndex: 'realContainerCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.containerCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '体积',
    dataIndex: 'volume',
    width: 80,
    render: (val, record) => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'weight',
    width: 80,
    render: (val, record) => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
];
export const OrderDetailColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNumber',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    width: 60,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '整件数(估/实)',
    dataIndex: 'realCartonCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.cartonCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '散件数(估/实)',
    dataIndex: 'realScatteredCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.scatteredCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '周转箱(估/实)',
    dataIndex: 'realContainerCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.containerCount + '/' + val}</span> : <Empty />,
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
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
];

export const CreatePageOrderColumns = [
  {
    title: '订单号',
    dataIndex: 'billNumber',
    width: 150,
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
    width: 150,
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
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '整箱数',
    dataIndex: 'realCartonCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '零散数',
    dataIndex: 'realScatteredCount',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'realContainerCount',
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
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
];

export const ScheduleColumns = [
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
    title: '整件数(估/实)',
    dataIndex: 'realCartonCount',
    width: 100,
    render: (val, record) =>
      val != undefined ? <span>{record.cartonCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '散件数(估/实)',
    dataIndex: 'realScatteredCount',
    width: 100,
    render: (val, record) =>
      val != undefined ? <span>{record.scatteredCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '周转箱(估/实)',
    dataIndex: 'realContainerCount',
    width: 100,
    render: (val, record) =>
      val != undefined ? <span>{record.containerCount + '/' + val}</span> : <Empty />,
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
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '总金额',
    dataIndex: 'totalAmount',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
];
export const ScheduleDetailColumns = [
  {
    title: '来源单号',
    dataIndex: 'sourceNum',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'deliveryPoint',
    width: 150,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
  {
    title: '整件数(估/实)',
    dataIndex: 'realCartonCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.cartonCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '散件数(估/实)',
    dataIndex: 'realScatteredCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.scatteredCount + '/' + val}</span> : <Empty />,
  },
  {
    title: '周转箱(估/实)',
    dataIndex: 'realContainerCount',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.containerCount + '/' + val}</span> : <Empty />,
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
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 80,
    render: val => (val ? <span>{val}</span> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'owner',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />),
  },
];