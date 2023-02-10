/*
 * @Author: guankongjin
 * @Date: 2023-01-07 16:10:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-10 15:44:59
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DisposePage from './DisposePage';
import { getOrders } from '@/services/sjitms/Customer';
import { loginUser } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  state = { ...this.state, orders: [] };
  drawcell = row => {
    if (row.column.fieldName == 'BILLNUMBER') {
      row.component = (
        <a href="##" onClick={() => this.disposePageRef.show(row.record)}>
          {row.record.BILLNUMBER}
        </a>
      );
    }
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    if (!havePermission('sjtms.customer.service.view')) {
      getOrders(loginUser().code).then(response => {
        this.setState({ orders: response.data ? response.data : [] });
      });
    }
  }
  exSearchFilter = () => {
    const { orders } = this.state;
    let param = [];
    if (!havePermission('sjtms.customer.service.view')) {
      param.push({
        field: 'UUID',
        type: 'VarChar',
        rule: 'in',
        val: orders?.map(x => x.uuid).join('||'),
      });
    }
    return param;
  };
  drawToolbarPanel = () => {};

  drawTopButton = () => {
    return (
      <DisposePage
        operation="Dispose"
        ref={page => (this.disposePageRef = page)}
        onSearch={this.onSearch}
      />
    );
  };
}
