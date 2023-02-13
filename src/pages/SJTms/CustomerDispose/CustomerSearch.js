/*
 * @Author: guankongjin
 * @Date: 2023-01-07 16:10:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-13 14:48:26
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DisposePage from './DisposePage';
import { getDepartments } from '@/services/sjitms/Customer';
import { loginUser } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  state = { ...this.state, departments: [] };
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
    if (!havePermission('sjtms.core.customer.service.view')) {
      getDepartments(loginUser().code).then(response => {
        this.setState({ departments: response.data ? response.data : [] });
      });
    }
    this.queryCoulumns();
    this.getCreateConfig();
  }

  exSearchFilter = () => {
    const { departments } = this.state;
    let param = [];
    if (!havePermission('sjtms.core.customer.service.view')) {
      param.push({
        nestCondition: {
          matchType: 'or',
          queryParams: [
            {
              field: 'DISPOSECODE',
              type: 'VarChar',
              rule: 'like',
              val: loginUser().code,
            },
            {
              field: 'DISPOSEDEPT',
              type: 'VarChar',
              rule: 'in',
              val: departments.join('||'),
            },
          ],
        },
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
