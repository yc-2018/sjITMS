/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 09:26:02
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-11 09:58:33
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import ETCSearchPage from './ETCSearchPage';
import { Drawer } from 'antd';
import ETCOperationHistory from './ETCOperationHistory';

export default class DriverFee extends PureComponent {
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
        <ETCSearchPage {...this.props} onClose={this.onClose} />
        <Drawer
          placement="right"
          onClose={() => this.onClose()}
          visible={visible}
          width={'60%'}
          destroyOnClose
        >
          <ETCOperationHistory {...this.props} quickuuid={'sj_itms_etc_record'} record={record} />
        </Drawer>
      </div>
    );
  }
}
