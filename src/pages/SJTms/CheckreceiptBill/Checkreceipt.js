/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 09:26:02
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-20 11:30:13
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import CheckreceiptbillSearch from './CheckreceiptBillSearch';
import { Drawer } from 'antd';
import CheckreceiptHistorySearch from './CheckreceiptHistorySearch';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Checkreceipt extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { visible: false, record: {} };
  }

  onClose = record => {
    if (record) {
      this.setState({ record });
    }
    this.setState({ visible: !this.state.visible });
  };

  render() {
    const { visible, record } = this.state;
    return (
      <div>
        <CheckreceiptbillSearch {...this.props} onClose={this.onClose} />
        <Drawer
          placement="right"
          onClose={() => this.onClose()}
          visible={visible}
          width={'77%'}
          destroyOnClose
        >
          <CheckreceiptHistorySearch
            {...this.props}
            quickuuid={'sj_itms_receiptbillhistory'}
            record={record}
          />
        </Drawer>
      </div>
    );
  }
}
