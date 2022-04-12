/*
 * @Author: Liaorongchang
 * @Date: 2022-04-11 17:30:59
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-12 15:20:39
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Modal, Input, message, Popconfirm, Row } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { saveFormData } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class TakeDeliveryConfirmSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    isShow: false,
    scroll: {
      x: 3600,
      y: 'calc(60vh)',
    },
  };

  drawActionButton = () => {};

  //该方法用于更改State
  changeState = () => {
    this.setState({ title: '' });
  };

  drawExColumns = e => {
    console.log('e', e);
    if (e.column.fieldName == 'SOURCENUM') {
      const c = {
        title: '确认数量',
        dataIndex: 'TDQTY',
        key: 'TDQTY',
        sorter: true,
        width: colWidth.codeColWidth,
        render: (val, record) => {
          return (
            <Input placeholder="请输入提货数量" onChange={v => (record.TDQTY = v.target.value)} />
          );
        },
      };
      return c;
    }
  };

  comfirm = () => {
    const { selectedRows, reportCode } = this.state;
    console.log('reportCode', reportCode);
    const deliveryList = [];
    let isReturn = 0;
    if (selectedRows.length !== 0) {
      selectedRows.forEach((rows, index) => {
        if (typeof rows.TDQTY == 'undefined') {
          message.error('第' + (index + 1) + '行提货数量不能为空');
          isReturn = 1;
        }
        deliveryList.push({
          ORDERDELUUID: rows.UUID,
          ORDERNUMBER: rows.ORDERNNUM,
          SOURCENUM: rows.SOURCENUM,
          ARTICLECODE: rows.ARTICLECODE,
          ORDERQTY: rows.QTY,
          TAKEDELIVERYQTY: rows.TDQTY,
        });
      });
      if (isReturn == 1) {
        return;
      }
      console.log('deliveryList', deliveryList);
      this.onSaveData(deliveryList).then(result => {
        console.log('result', result);
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  onSaveData = async deliveryList => {
    const { reportCode } = this.state;
    const param = {
      code: reportCode,
      entity: { SJ_ITMS_TAKEDELIVERYCONFIRM: deliveryList },
    };
    console.log('param', param);
    return await saveFormData(param);
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    return (
      <span>
        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          onConfirm={() => this.comfirm()}
          okText="确定"
          cancelText="取消"
        >
          <Button>确认</Button>
        </Popconfirm>
      </span>
    );
  };
}
