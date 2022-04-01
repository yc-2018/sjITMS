/*
 * @Author: Liaorongchang
 * @Date: 2022-03-29 17:25:56
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-01 14:20:11
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import { Layout, Space, Input, Form, message } from 'antd';
import styles from './ChargeLoading.less';
import { getByCarrier, beginloading } from '@/services/sjitms/ChargeLoading';
import ChargeLoadingViewPage from './ChargeLoadingViewPage';
import SearchPage from './ChargeLoadingDtlSearchPage';

const { Content } = Layout;

export default class ChargeLoadingSearch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      shipPlanBill: {
        list: [],
        pagination: {},
      },
      shipBill: {},
      responseError: false,
      responseMsg: '',
      selectedRows: '',
    };
  }

  onSubmit = e => {
    this.getInfoByCarrier(e.target.value);
  };

  //根据司机代码查排车单装车单信息
  getInfoByCarrier = async driverCode => {
    console.log('driverCode', driverCode);
    await getByCarrier(driverCode).then(response => {
      if (response && response.success && response.data) {
        if (response.data.stat === 'Approved') {
          this.getChargeMessageStart(response.data.uuid, response.data);
        }
        if (response.data.stat === 'Shipping') {
          this.getChargeMessageEnd(response.data.uuid, response.data);
        }
      } else {
        this.setState({
          shipBill: {},
          shipPlanBill: {},
          responseMsg: response.message ? response.message : '当前没有已批准的排车单或装车单不存在',
          responseError: true,
        });
      }
    });
  };

  //刷卡装车
  getChargeMessageStart = async (uuid, data) => {
    if (!uuid) return;
    console.log('开始装车', uuid);
    await beginloading(uuid).then(response => {
      console.log('response', response);
      if (response && response.success) {
        this.setState({
          responseMsg: '开始装车',
          responseError: false,
          selectedRows: uuid,
        });
      }
    });
  };

  getChargeMessageEnd = (uuid, data) => {
    if (!uuid) return;
    console.log('结束装车');
  };

  render() {
    const { responseError, responseMsg, selectedRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Page>
          <Content className={styles.contentWrapper}>
            <div>
              <div style={{ width: '30%', float: 'left' }}>
                <div style={{ width: '100%' }}>
                  <div className={styles.marginTop}>
                    <span style={{ marginLeft: '13px', width: '15%' }}>{'刷卡人:'}</span>
                    &nbsp;&nbsp;
                    <Input
                      className={styles.right}
                      onPressEnter={this.onSubmit}
                      // placeholder={placeholderLocale('刷卡人代码')}
                    />
                  </div>
                  <div className={styles.marginTop}>
                    <span style={{ width: '15%' }}>{'刷卡提示:'}</span>
                    &nbsp;&nbsp;
                    <Input.TextArea
                      style={responseError ? { color: '#F5222D', width: '80%' } : { width: '80%' }}
                      value={responseMsg}
                      rows={4}
                    />
                  </div>
                  <div>
                    {/* <div>测试</div> */}
                    <ChargeLoadingViewPage
                      quickuuid={'v_sj_itms_schedule_loading'}
                      params={{ entityUuid: '1507171023747653633' }}
                      pathname={this.props.pathname}
                    />
                  </div>
                </div>
              </div>
              <div style={{ width: '70%', float: 'left', margin: '24px 0 0 0' }}>
                <SearchPage quickuuid={'v_sj_itms_scheduledtl'} selectedRows={selectedRows} />
              </div>
            </div>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
