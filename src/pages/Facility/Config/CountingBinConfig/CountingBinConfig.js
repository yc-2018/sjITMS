import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import { countingBinConfigLocale } from './CountingBinConfigLocale';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { havePermission } from '@/utils/authority';
import { CONFIG_RES } from '../ConfigPermission';
const { TabPane } = Tabs;

@connect(({ countingBinConfig }) => ({
  countingBinConfig
}))
@Form.create()
export default class CountingBinConfig extends Component {
  state = {
    submitting: false,
    keyLog: 0
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.countingBinConfig.data) {
      this.setState({
        entity: nextProps.countingBinConfig.data
      });
    }
  }

  refresh() {
    this.props.dispatch({
      type: 'countingBinConfig/getByCompamyUuidAndDcUuid'
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      })
      let data = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        binCode: fieldsValue.binCode
      }
      this.props.dispatch({
        type: 'countingBinConfig/saveOrUpdate',
        payload: data,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
          }
          this.setState({
            submitting: false,
          })
        }
      })
    });
  }
  /**
   * 切换tab页
   */
  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        keyLog: this.state.keyLog + 1
      })
    }
  }
  render() {
    const { entity, submitting } = this.state;

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{countingBinConfigLocale.title}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label={countingBinConfigLocale.binScope}>
                  {getFieldDecorator('binCode', {
                    initialValue: entity && entity.binCode ? entity.binCode : undefined,
                    rules: [{ required: true, message: notNullLocale('固定货位') }],
                  })(
                    <Input autoFocus placeholder={placeholderLocale('固定货位')}/>
                  )}
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={submitting} type="primary" htmlType="submit">
                    {commonLocale.saveLocale}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key='2'>
            <EntityLogTab entityUuid={`${loginOrg().uuid}RtnCountConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
