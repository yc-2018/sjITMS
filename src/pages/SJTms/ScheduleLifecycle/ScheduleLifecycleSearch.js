/*
 * @Author: Liaorongchang
 * @Date: 2022-05-09 11:05:43
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-24 17:13:22
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Checkbox, Select, Input, Button, Popconfirm, message } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { guid } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { saveOfUpdateLifecycle } from '@/services/sjitms/ScheduleBill';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';

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
  };

  drawActionButton = () => {};

  drawToolbarPanel = () => {
    return (
      <div>
        <Popconfirm
          title="你确定要保存所选中的内容吗?"
          onConfirm={() => {
            this.confirm();
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button>保存</Button>
        </Popconfirm>
      </div>
    );
  };

  confirm = () => {
    const { list } = this.state.data;
    const entity = [];
    const find = list.findIndex(x => x.ALLOWSTAT === '' || x.ALLOWSTAT == 'undefined');
    if (find >= 0) {
      message.error('进入状态不能为空');
    }
    list.forEach((row, index) => {
      let b = '';
      if (row.INVALID && row.INVALID.length < 3) {
        b = row.INVALID.join(',');
      } else {
        b = row.INVALID;
      }
      entity.push({
        ALLOWSTAT: row.ALLOWSTAT,
        FLOW: row.FLOW,
        SKIP: row.SKIP,
        SCHEDULETYPE: row.SCHEDULETYPE,
        COMPANYUUID: loginCompany().uuid,
        DISPATCHCENTERUUID: loginOrg().uuid,
        LINE: index + 1,
        INVALID: b,
      });
    });
    this.onSaveData(entity);
  };

  onSaveData = async entity => {
    let params = [];
    entity.forEach(row => {
      let data = {
        allowStat: row.ALLOWSTAT,
        companyUuid: row.COMPANYUUID,
        dispatchcenterUuid: row.DISPATCHCENTERUUID,
        flow: row.FLOW,
        skip: row.SKIP == '0' ? false : true,
        scheduleType: row.SCHEDULETYPE,
        line: row.LINE,
        invalid: row.INVALID,
      };
      params.push(data);
    });
    const response = await saveOfUpdateLifecycle(params);
    if (response && response.success) {
      message.success('保存成功');
      this.refreshTable();
    }
  };

  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
      callback: response => {
        if (response.data) this.initData(response.data, pageFilters);
      },
    });
  };

  initData = (data, pageFilters) => {
    const queryParam = pageFilters.superQuery.queryParams;
    const c = queryParam.find(x => x.field == 'SCHEDULETYPE');
    if (!data?.records) {
      data.records = [
        {
          FLOW: 'Ship',
          FLOW_CN: '装车',
          SCHEDULETYPE: c.val,
          SCHEDULETYPE_CN: c.val == 'Job' ? '作业型' : '任务型',
          SKIP: 0,
          ALLOWSTAT: '',
        },
        {
          FLOW: 'InAndOutFactory',
          FLOW_CN: '出车回车',
          SCHEDULETYPE: c.val,
          SCHEDULETYPE_CN: c.val == 'Job' ? '作业型' : '任务型',
          SKIP: 0,
          ALLOWSTAT: '',
        },
        {
          FLOW: c.val == 'Job' ? 'DeliveredConfirm' : 'TaskConfirm',
          FLOW_CN: c.val == 'Job' ? '送货确认' : '提货确认',
          SCHEDULETYPE: c.val,
          SCHEDULETYPE_CN: c.val == 'Job' ? '作业型' : '任务型',
          SKIP: 0,
          ALLOWSTAT: '',
        },
      ];
    }
    // 海鼎底层需要uuid作为StandardTable的rowkey
    if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
      data.records.forEach(row => (row.uuid = guid()));
    }
    let colTotal = data.columnTotal;
    var data = {
      list: data.records,
      pagination: {
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [], colTotal });
  };

  drawcell = e => {
    if (e.column.fieldName == 'SKIP') {
      e.component = (
        <Checkbox
          checked={e.val == '0' ? false : true}
          key={e.record.UUID}
          onChange={v => (e.record.SKIP = v.target.checked ? '1' : '0')}
          disabled={
            e.record.FLOW == 'DeliveredConfirm' || e.record.FLOW == 'TaskConfirm' ? true : false
          }
        >
          跳过
        </Checkbox>
      );
    } else if (e.column.fieldName == 'ALLOWSTAT') {
      e.component = (
        <SimpleAutoComplete
          style={{ width: 150 }}
          placeholder="请选择"
          dictCode="scheduleStat"
          value={e.val}
          onChange={v => (e.record.ALLOWSTAT = v)}
          noRecord
          allowClear={true}
        />
      );
    } else if (e.column.fieldName == 'INVALID') {
      let a =
        e.val == '<空>' || e.val.length == 0
          ? []
          : e.val.indexOf(',') < 0
            ? e.val
            : e.val.split(',');
      e.component =
        e.record.FLOW == 'Ship' ? (
          <Select
            style={{ width: '100%' }}
            mode="multiple"
            onChange={v => (e.record.INVALID = v)}
            defaultValue={a}
          >
            <Option key={'Shipping'}>装车开始</Option>
            <Option key={'Shiped'}>装车结束</Option>
          </Select>
        ) : (
          <Select
            disabled={
              e.record.FLOW == 'DeliveredConfirm' || e.record.FLOW == 'TaskConfirm' ? true : false
            }
            style={{ width: '100%' }}
            mode="multiple"
            onChange={v => (e.record.INVALID = v)}
            defaultValue={a}
          >
            <Option key={'Delivering'}>已出车</Option>
            <Option key={'Returned'}>已回车</Option>
          </Select>
        );
    }
  };
}
