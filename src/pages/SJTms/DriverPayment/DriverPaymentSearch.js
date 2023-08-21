/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 09:00:19
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Modal, Form,Menu } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { cancellation, audits } from '@/services/sjitms/AddressReport';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';
import SelfTackShipSearchForm from '@/pages/Tms/SelfTackShip/SelfTackShipSearchForm';
import { log } from 'lodash-decorators/utils';
import { Map, Marker, CustomOverlay, DrawingManager, Label } from 'react-bmapgl';
//import whitestyle from '../static/whitestyle'
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class DriverPaymentSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    Mapvisible:false
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
