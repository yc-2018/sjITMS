/*
 * @Author: guankongjin
 * @Date: 2023-01-07 16:10:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-06 17:59:29
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DisposePage from './DisposePage';
import { loginUser } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  drawcell = row => {
    if (row.column.fieldName == 'BILLNUMBER') {
      row.component = (
        <a href="##" onClick={() => this.disposePageRef.show(row.record)}>
          {row.record.BILLNUMBER}
        </a>
      );
    }
  };
  exSearchFilter = () => {
    return [
      { field: 'STATUS', type: 'VarChar', rule: 'ne', val: 'Saved' },
      { field: 'DISPOSECODE', type: 'VarChar', rule: 'eq', val: loginUser().code },
    ];
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
