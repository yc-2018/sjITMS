/*
 * @Author: guankongjin
 * @Date: 2022-03-17 14:59:31
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-19 14:43:41
 * @Description: 穿梭框
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\TableTransfer.js
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Transfer, Table } from 'antd';
import difference from 'lodash/difference';
import uniqBy from 'lodash/uniqBy';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class TableTransfer extends Component {
  state = {
    dataSource: [],
    totalDataSource: [],
    pagination: {
      total: 0,
      current: 1,
      pageSize: 10,
      superQuery:{matchType:"and",queryParams:[{field: "COMPANYUUID", rule: "eq", val: loginCompany().uuid, type: "VarChar"},{field: "DISPATCHCENTERUUID", rule: "eq", val: loginOrg().uuid, type: "VarChar"}]}
    },
  };

  componentDidMount() {
    this.queryCoulumns()

  }


  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.props.quickuuid,
        sysCode: 'tms',
      },
      callback: response => {
        this.fetch();
      }})
    }

  fetch = (params = this.state.pagination) => {
    const { dispatch, quickuuid, handleFetch } = this.props;
    const pageFilters = { ...params, page: params.current, quickuuid, order: 'CODE,ascend' };
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
      callback: response => {
        const pagination = { ...this.state.pagination };
        pagination.total = response.data.recordCount;
        if (response.data.recordCount > 0) {
          const dataSource = uniqBy(response.data.records, 'UUID');
          const totalDataSource = uniqBy(
            this.state.totalDataSource.concat(response.data.records),
            'UUID'
          );
          handleFetch(totalDataSource);
          this.setState({ dataSource, totalDataSource, pagination });
        } else {
          this.setState({ dataSource: [], pagination });
        }
      },
    });
  };

  filterData = searchValue => {
    const { pagination } = this.state;
    const queryParams = [
      { field: 'CODE', rule: 'like', type: 'VarChar', val: searchValue },
      { field: 'NAME', rule: 'like', type: 'VarChar', val: searchValue },
    ];
    const superQuery = { matchType: 'or', queryParams };
    this.fetch({ ...pagination, superQuery });
  };

  render() {
    const { targetKeys, columnsTitle, loading } = this.props;
    const { dataSource, pagination, totalDataSource } = this.state;
    const columns = [
      {
        dataIndex: 'UUID',
        title: columnsTitle,
        render: (_, record) => {
          return `[${record.CODE}]${record.NAME}`;
        },
      },
    ];
    return (
      <Transfer
        {...this.props}
        showSearch={true}
        onSearch={(direction, value) => {
          if (direction === 'left') this.filterData(value);
        }}
        filterOption={() => {}}
        dataSource={dataSource}
        rowKey={record => record.UUID}
      >
        {({
          direction,
          onItemSelectAll,
          onItemSelect,
          selectedKeys: listSelectedKeys,
          disabled: listDisabled,
        }) => {
          const rowSelection = {
            getCheckboxProps: item => ({
              disabled: listDisabled || item.disabled,
            }),
            onSelectAll(selected, selectedRows) {
              const treeSelectedKeys = selectedRows
                .filter(item => !item.disabled)
                .map(({ UUID }) => UUID);
              const diffKeys = selected
                ? difference(treeSelectedKeys, listSelectedKeys)
                : difference(listSelectedKeys, treeSelectedKeys);
              onItemSelectAll(diffKeys, selected);
            },
            onSelect({ UUID }, selected) {
              onItemSelect(UUID, selected);
            },
            selectedRowKeys: listSelectedKeys,
          };

          const handleTableChange = paginationObj => {
            if (direction === 'left') {
              const pager = { ...this.state.pagination };
              pager.current = paginationObj.current;
              this.setState({
                pagination: pager,
              });
              this.fetch(paginationObj);
            }
          };

          const rightDataSource = totalDataSource.filter(item => targetKeys.includes(item.UUID));

          const leftDataSource = dataSource.map(item => ({
            ...item,
            disabled: targetKeys.includes(item.UUID),
          }));

          return (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              style={{ minHeight: 400 }}
              loading={direction === 'left' && loading}
              dataSource={direction === 'left' ? leftDataSource : rightDataSource}
              size="small"
              rowKey="UUID"
              onRow={({ UUID, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled) return;
                  onItemSelect(UUID, !listSelectedKeys.includes(UUID));
                },
              })}
              onChange={handleTableChange}
              pagination={direction === 'left' ? pagination : true}
            />
          );
        }}
      </Transfer>
    );
  }
}
