/*
 * @Author: guankongjin
 * @Date: 2022-04-02 08:59:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-11 15:57:25
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingColumns.js
 */
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
    title: '波次',
    dataIndex: 'WAVENUM',
    width: 80,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '送货点',
    dataIndex: 'DELIVERYPOINTCODE',
    width: 120,
    render: (val, record) => {
      let data = {
        code: record.DELIVERYPOINTCODE,
        name: record.DELIVERYPOINTNAME,
      };
      return val ? <EllipsisCol colValue={convertCodeName(data)} /> : <Empty />;
    },
  },
  {
    title: '整件数(估/实)',
    dataIndex: 'REALCARTONCOUNT',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.CARTONCOUNT + '/' + val}</span> : <Empty />,
  },
  {
    title: '散件数(估/实)',
    dataIndex: 'REALSCATTEREDCOUNT',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.SCATTEREDCOUNT + '/' + val}</span> : <Empty />,
  },
  {
    title: '周转箱(估/实)',
    dataIndex: 'REALCONTAINERCOUNT',
    width: 80,
    render: (val, record) =>
      val != undefined ? <span>{record.CONTAINERCOUNT + '/' + val}</span> : <Empty />,
  },
  {
    title: '重量(估/实)',
    dataIndex: 'REALWEIGHT',
    width: 100,
    render: (val, record) => (val ? <span>{record.FORECASTWEIGHT + '/' + val}</span> : <Empty />),
  },
  {
    title: '体积(估/实)',
    dataIndex: 'REALVOLUME',
    width: 100,
    render: (val, record) => (val ? <span>{record.FORECASTVOLUME + '/' + val}</span> : <Empty />),
  },
  {
    title: '货主',
    dataIndex: 'OWNER',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
];

export const CreatePageOrderColumns = [
  {
    title: '订单号',
    dataIndex: 'BILLNUMBER',
    width: 100,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '收货方',
    dataIndex: 'DELIVERYPOINTCODE',
    width: 100,
    render: (val, record) => {
      let data = {
        code: record.DELIVERYPOINTCODE,
        name: record.DELIVERYPOINTNAME,
      };
      return val ? <EllipsisCol colValue={convertCodeName(data)} /> : <Empty />;
    },
  },
  {
    title: '收货方地址',
    dataIndex: 'DELIVERYPOINTADDRESS',
    width: 120,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '订单类型',
    dataIndex: 'ORDERTYPE_CN',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '整箱数',
    dataIndex: 'REALCARTONCOUNT',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '零散数',
    dataIndex: 'REALSCATTEREDCOUNT',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '周转箱',
    dataIndex: 'REALCONTAINERCOUNT',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '体积',
    dataIndex: 'REALVOLUME',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
  {
    title: '重量',
    dataIndex: 'REALWEIGHT',
    width: 50,
    render: val => (val ? <EllipsisCol colValue={val} /> : <Empty />),
  },
];
