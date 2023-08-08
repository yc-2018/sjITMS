/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 09:00:19
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Modal, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { cancellation, audits,recycle, cancelAudits } from '@/services/sjitms/IssueCon';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class IssueconSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  defaultSearchs= () => {
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }
      defaultSearch.push(exSearchFilter);
    }
   
    return defaultSearch;
  };
  audits = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    const reslut = await audits(selectedRows.map(e => e.UUID));
    if (reslut.success) {
      message.success('发放成功！');
   
      this.onSearch();
    }
  };

  //作废
  cancellation = async () => {
    const { selectedRows} = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    const result = await cancellation(selectedRows.map(e => e.UUID));
    if (result.success) {
      message.success('作废成功！');
      this.onSearch();
    }
  };

  recycle = async () => {
      const { selectedRows} = this.state;
      if (selectedRows.length == 0) {
        message.error('请选中一条记录');
        return;
      }
      const result = await recycle(selectedRows.map(e => e.UUID));
      if (result.success) {
        message.success('回收成功！');
        this.onSearch();
      }
    };
  drawToolsButton = () => {
    return (
      <>
        <Popconfirm
          placement="top"
          title={'确认发放？'}
          onConfirm={() => this.audits()}
          okText="是"
          cancelText="否"
        >
          <Button type="primary">发放</Button>
        </Popconfirm>
        <Popconfirm
          placement="top"
          title={'确认作废？'}
          onConfirm={() => this.cancellation()}
          okText="是"
          cancelText="否"
        >
          <Button type="primary">作废</Button>
        </Popconfirm>
        <Popconfirm
          placement="top"
          title={'确认回收？'}
          onConfirm={() => this.recycle()}
          okText="是"
          cancelText="否"
        >
          <Button type="primary">回收</Button>
        </Popconfirm>
       
      </>
    );
  };
  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0 && selectedRows[0].STAT === 'Saved') {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据或该单据状态不是保存状态，不能修改');
    }
  };

  drawcell = e => {};
}
