/*
 * @Author: Liaorongchang
 * @Date: 2022-04-11 17:30:59
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-06 14:17:35
 * @version: 1.0
 */
import React from 'react';
import { Button, InputNumber, message, Popconfirm } from 'antd';
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

  drawcell = e => {
    if (e.column.fieldName == 'TAKEDELIVERYQTY') {
      const component =
        e.record.STATE == '0' ? (
          <InputNumber
            placeholder="请输入提货数量"
            min={0}
            onChange={v => (e.record.TAKEDELIVERYQTY = v)}
          />
        ) : (
          <span>{e.val}</span>
        );
      e.component = component;
    }
  };

  comfirm = () => {
    const { selectedRows } = this.state;
    const deliveryList = [];
    let isReturn = 0;
    if (selectedRows.length !== 0) {
      selectedRows.forEach((rows, index) => {
        if (typeof rows.TAKEDELIVERYQTY == 'undefined') {
          message.error('第' + (index + 1) + '行提货数量不能为空');
          isReturn = 1;
        }
        deliveryList.push({
          ORDERDELUUID: rows.UUID,
          ORDERNUMBER: rows.ORDERNNUM,
          SOURCENUM: rows.SOURCENUM,
          ARTICLECODE: rows.ARTICLECODE,
          ORDERQTY: rows.QTY,
          TAKEDELIVERYQTY: rows.TAKEDELIVERYQTY,
          SCHEDULEUUID: rows.SCHEDULEUUID,
        });
      });
      if (isReturn == 1) {
        return;
      }
      this.onSaveData(deliveryList);
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
    const response = await saveFormData(param);
    if (response && response.success) {
      message.success('保存成功');
      this.refreshTable();
    }
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
