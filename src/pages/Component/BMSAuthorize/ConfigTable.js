/*
 * @Author: Liaorongchang
 * @Date: 2023-09-20 09:54:03
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-20 10:03:10
 * @version: 1.0
 */
import React, { Component } from 'react';
import { Table, Checkbox, Input, InputNumber, message } from 'antd';
import { getConfigInfo, updateConfigInfo } from '@/services/bms/CostPlan';

export default class ConfigTable extends Component {
  state = {
    configInfo: [],
  };

  componentDidMount = () => {
    const { selectedKeys } = this.props;
    this.configInfo(selectedKeys);
  };

  configInfo = async selectedKeys => {
    await getConfigInfo(selectedKeys).then(response => {
      if (response.success && response.data) {
        this.setState({ configInfo: response.data });
      } else {
        this.setState({ configInfo: [] });
      }
    });
  };

  saveConfig = async (record, column, value) => {
    record[column] = value;
    const response = await updateConfigInfo(record);
    if (response && response.success) {
      message.success('修改成功');
    }
  };

  render() {
    const { configInfo } = this.state;
    const columns = [
      {
        title: '节点',
        dataIndex: 'typeName',
        key: 'typeName',
      },
      {
        title: '跳过',
        dataIndex: 'skip',
        key: 'skip',
        render: (text, record) => {
          return (
            <Checkbox
              defaultChecked={text}
              onChange={e => {
                this.saveConfig(record, 'skip', e.target.checked);
              }}
            />
          );
        },
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator',
        render: (text, record) => {
          return (
            <Input
              defaultValue={text}
              onBlur={e => this.saveConfig(record, 'operator', e.target.value)}
            />
          );
        },
      },
      {
        title: '每月提醒时间',
        dataIndex: 'warnTime',
        key: 'warnTime',
        render: (text, record) => {
          return (
            <InputNumber
              min={0}
              max={31}
              defaultValue={text}
              onBlur={e => this.saveConfig(record, 'warnTime', e.target.value)}
            />
          );
        },
      },
    ];
    return <Table dataSource={configInfo} columns={columns} />;
  }
}
