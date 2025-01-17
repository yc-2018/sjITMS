/*
 * @Author: Liaorongchang
 * @Date: 2022-03-29 17:25:56
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-25 15:54:59
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import { Layout, Space, Input, Form, message } from 'antd';
import styles from './ChargeLoading.less';
import { getByCarrier, beginloading, finishloading } from '@/services/sjitms/ChargeLoading';
import ChargeLoadingViewPage from './ChargeLoadingViewPage';
import SearchPage from './ChargeLoadingDtlSearchPage';
import { placeholderLocale } from '@/utils/CommonLocale';

const { Content } = Layout;

export default class ChargeLoadingSearch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shipPlanBill: {
        list: [],
        pagination: {},
      },
      responseError: false,
      responseMsg: '',
      selectedRows: '',
    };
  }

  bindRef(ref) {
    this.child = ref;
  }

  ccRef(ref) {
    this.cc = ref;
  }

  onSubmit = e => {
    this.getInfoByCarrier(e.target.value);
  };

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = async driverCode => {
    await getByCarrier(driverCode).then(response => {
      if (response && response.success && response.data) {
        if (response.data.stat === 'Approved') {
          this.getChargeMessageStart(response.data);
        }
        if (response.data.stat === 'Shipping') {
          this.getChargeMessageEnd(response.data);
        }
      } else {
        this.setState({
          shipPlanBill: {},
          responseMsg: response.message ? response.message : '当前没有已批准的排车单或装车单不存在',
          responseError: true,
        });
      }
    });
  };

  //刷卡装车
  getChargeMessageStart = async data => {
    if (!data) return;
    await beginloading(data.uuid, data.version).then(response => {
      if (response && response.success) {
        this.setState({
          responseMsg: '排车单:' + data.billNumber + ',开始装车',
          responseError: false,
          selectedRows: data.uuid,
        });
        this.child.onSearch();
        this.cc.init();
      } else {
        this.setState({
          responseMsg: response.message,
          responseError: true,
        });
      }
    });
  };

  getChargeMessageEnd = async data => {
    if (!data) return;
    await finishloading(data.uuid, data.version).then(response => {
      if (response && response.success) {
        this.setState({
          responseMsg: '排车单:' + data.billNumber + ',结束装车',
          responseError: false,
          selectedRows: data.uuid,
        });
        this.child.onSearch();
        this.cc.init();
      } else {
        this.setState({
          responseMsg: response.message,
          responseError: true,
        });
      }
    });
  };

  render() {
    const { responseError, responseMsg, selectedRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Page>
          <Content className={styles.contentWrapper}>
            <div>
              <div style={{ width: '45%', float: 'left' }}>
                <div style={{ width: '100%' }}>
                  <div className={styles.marginTop}>
                    <span style={{ marginLeft: '13px', width: '15%' }}>{'刷卡人:'}</span>
                    &nbsp;&nbsp;
                    <Input
                      className={styles.right}
                      onPressEnter={this.onSubmit}
                      placeholder={placeholderLocale('刷卡人代码')}
                    />
                  </div>
                  <div className={styles.marginTop}>
                    <span style={{ width: '15%' }}>{'刷卡提示:'}</span>
                    &nbsp;&nbsp;
                    <Input.TextArea
                      style={
                        responseError
                          ? { color: '#F5222D', width: '80%', fontSize: '50px' }
                          : { width: '80%', fontSize: '50px' }
                      }
                      value={responseMsg}
                      rows={4}
                    />
                  </div>
                  <div>
                    <ChargeLoadingViewPage
                      quickuuid={'sj_itms_schedule_loading'}
                      params={{ entityUuid: selectedRows }}
                      pathname={this.props.pathname}
                      onRef={this.ccRef.bind(this)}
                    />
                  </div>
                </div>
              </div>
              <div style={{ width: '55%', float: 'left' }}>
                <SearchPage
                  quickuuid={'v_sj_itms_scheduledtl'}
                  onRef={this.bindRef.bind(this)}
                  selectedRows={selectedRows}
                />
              </div>
            </div>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
