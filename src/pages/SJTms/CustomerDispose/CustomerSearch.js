/*
 * @Author: guankongjin
 * @Date: 2023-01-07 16:10:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-09 17:34:14
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DisposePage from './DisposePage';
import { queryAllData } from '@/services/quick/Quick';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  state = { ...this.state, employee: {} };
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
    let queryParams = [
      { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'dispatchCenterUuid', type: 'VarChar', rule: 'like', val: loginOrg().uuid },
      { field: 'state', type: 'Integer', rule: 'eq', val: 1 },
      { field: 'code', type: 'VarChar', rule: 'eq', val: loginUser().code },
    ];
    queryAllData({ quickuuid: 'sj_itms_employee', superQuery: { queryParams } }).then(response => {
      let employee = response.data.records[0];
      this.setState({ employee });
    });
  }
  exSearchFilter = () => {
    const { employee } = this.state;
    let param = [{ field: 'STATUS', type: 'VarChar', rule: 'ne', val: 'Saved' }];
    if (!havePermission('sjtms.customer.service.view')) {
      param.push({
        field: 'DISPOSEDEPT',
        type: 'VarChar',
        rule: 'eq',
        val: employee.DEPARTMENTUUID,
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
