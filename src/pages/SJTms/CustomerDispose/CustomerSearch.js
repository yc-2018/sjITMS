/*
 * @Author: guankongjin
 * @Date: 2023-01-07 16:10:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-07 09:20:13
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
  state = { ...this.state, isRadio: true, departments: [] };

  editColumns = queryConfig => {
    const { departments } = this.state;
    let creatorCol = queryConfig.columns.find(x => x.fieldName == 'DISPOSEDEPT');
    creatorCol.searchDefVal = departments[0];
    return queryConfig;
  };

  drawcell = row => {
    if (row.column.fieldName == 'BILLNUMBER') {
      row.component = (
        <a href="##" onClick={() => this.disposePageRef.show(row.record)}>
          {row.record.BILLNUMBER}
        </a>
      );
    }
  };

  onView = record => {
    this.disposePageRef.show(record);
  };

  componentDidMount() {
    if (!havePermission('customer.service.view')) {
      getDepartments(loginUser().code).then(response => {
        this.setState({ departments: response.data ? response.data : [] });
      });
    }
    this.queryCoulumns();
    this.getCreateConfig();
  }

  exSearchFilter = () => {
    const { departments } = this.state;
    ///let param = [{ field: 'STATUS', type: 'VarChar', rule: 'ne', val: 'Saved' }];
    let param =[];
    if (!havePermission('customer.service.view')) {
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
