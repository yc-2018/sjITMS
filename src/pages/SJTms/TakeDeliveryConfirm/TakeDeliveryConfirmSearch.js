/*
 * @Author: Liaorongchang
 * @Date: 2022-04-11 17:30:59
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-15 11:44:39
 * @version: 1.0
 */
import React from 'react';
import { Button, InputNumber, message, Popconfirm, Input, Modal, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { saveFormData, updateEntity } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class TakeDeliveryConfirmSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    showUpdateNotePop: false,
    updateRowUuid: '',
    updateNote: '',
  };

  drawActionButton = () => {};

  drawcell = e => {
    if (e.column.fieldName == 'TAKEDELIVERYQTY') {
      const component =
        e.record.STATE == '0' ? (
          <InputNumber
            style={{ width: '90%' }}
            placeholder="请输入实提数量"
            min={0}
            defaultValue={e.record.TAKEDELIVERYQTY}
            onChange={v => (e.record.TAKEDELIVERYQTY = v)}
          />
        ) : (
          <span>{e.val}</span>
        );
      e.component = component;
    } else if (e.column.fieldName == 'REALQTY') {
      const component =
        e.record.STATE == '0' ? (
          <InputNumber
            style={{ width: '90%' }}
            placeholder="请输入收货数量"
            min={0}
            defaultValue={e.record.REALQTY}
            onChange={v => (e.record.REALQTY = v)}
          />
        ) : (
          <span>{e.val}</span>
        );
      e.component = component;
    } else if (e.column.fieldName == 'NOTE') {
      const component =
        e.record.STATE == '0' ? (
          <Input
            style={{ width: '90%' }}
            placeholder="请输入备注"
            min={0}
            defaultValue={e.val == '<空>' ? null : e.val}
            onChange={v => (e.record.NOTE = v.target.value)}
          />
        ) : (
          <div>
            <a
              onClick={() => {
                this.setState({
                  showUpdateNotePop: true,
                  updateRowUuid: e.record.UUID,
                  updateNote: e.record.NOTE,
                });
              }}
            >
              {e.val}
            </a>
          </div>
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
          ORDERDTLUUID: rows.ORDERDTLUUID,
          ORDERNUMBER: rows.ORDERNNUM,
          SOURCENUM: rows.SOURCENUM,
          ARTICLECODE: rows.ARTICLECODE,
          ORDERQTY: rows.QTY,
          TAKEDELIVERYQTY: rows.TAKEDELIVERYQTY,
          SCHEDULEUUID: rows.SCHEDULEUUID,
          REALQTY: rows.REALQTY,
          NOTE: rows.NOTE,
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

  updateNote = async () => {
    const { updateRowUuid, updateNote } = this.state;
    let param = {
      tableName: 'sj_itms_takedeliveryconfirm',
      sets: { NOTE: updateNote },
      condition: {
        params: [
          {
            field: 'UUID',
            rule: 'eq',
            val: [updateRowUuid],
          },
        ],
      },
      updateAll: false,
    };
    await updateEntity(param).then(e => {
      if (e.result > 0) {
        this.setState({ showUpdateNotePop: false });
        this.onSearch();
        message.success('操作成功！');
      }
    });
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { showUpdateNotePop, updateNote, updateRowUuid } = this.state;
    const superQuery = this.state.pageFilters.superQuery;
    let c;
    if (superQuery) {
      const queryParams = superQuery.queryParams;
      const receipted = queryParams.find(x => x.field === 'STATE');
      if (receipted) {
        c = receipted.val;
      }
    }
    if (c === '0') {
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
    } else {
      return (
        <Modal
          title="修改备注"
          key={updateRowUuid}
          visible={showUpdateNotePop}
          onOk={() => this.updateNote()}
          onCancel={() => {
            this.setState({ showUpdateNotePop: false });
          }}
        >
          <Form>
            <Form.Item label="备注" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <Input
                style={{ width: '90%' }}
                placeholder="请输入备注"
                min={0}
                defaultValue={updateNote}
                onChange={v => {
                  this.setState({ updateNote: v.target.value });
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  };
}
