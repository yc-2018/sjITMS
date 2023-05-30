/*
 * @Author: Liaorongchang
 * @Date: 2022-04-18 09:26:02
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-09 10:10:36
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DriverFeeSearchPage from './DriverFeeSearchPage';
import { Drawer } from 'antd';
import StorePakingFeeSearch from './StorePakingFeeSearch';

// @connect(({ quick, loading }) => ({
//   quick,
//   loading: loading.models.quick,
// }))
export default class DriverFee extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { visible: false, record: {},Logvisible:false };
  }

  onClose = record => {
    if (record) {
      this.setState({ record });
    }
    this.setState({ visible: !this.state.visible });
  };
  onCloseLog = record => {
    if (record) {
      this.setState({ record });
    }
    this.setState({ Logvisible: !this.state.Logvisible });
  };

  render() {
    const { visible, Logvisible,record } = this.state;
    return (
      <div>
        <DriverFeeSearchPage {...this.props} onClose={this.onClose}  onLogClose = {this.onCloseLog}/>
        <Drawer
          placement="right"
          onClose={() => this.onClose()}
          visible={visible}
          width={'50%'}
          destroyOnClose
        >
          <StorePakingFeeSearch
            {...this.props}
            quickuuid={'v_sj_itms_schedule_store_fee'}
            record={record}
          />
          
        </Drawer>
        <Drawer
         placement="right"
         onClose={() => this.onCloseLog()}
         visible={Logvisible}
         width={'50%'}
         destroyOnClose
        >
          <StorePakingFeeSearch
              {...this.props}
              quickuuid={'v_sj_itms_tollfee_log'}
              record={record}
            />
        </Drawer>
      </div>
    );
  }
}
