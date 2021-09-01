import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';

const { TabPane } = Tabs;

@connect(({ storeRtnAuditConfig }) => ({
  storeRtnAuditConfig
}))
@Form.create()
export default class StoreRtnAuditConfig extends Component {
  state = {
    submitting: false,
    keyLog: 0,
    entity:{}
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.storeRtnAuditConfig.data) {
      this.setState({
        entity: nextProps.storeRtnAuditConfig.data
      });
    }
  }

  refresh() {
    let data = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid
    }
    this.props.dispatch({
      type: 'storeRtnAuditConfig/getBillState',
      payload: data,
    });
  }

  handleSubmit(e){
    e.preventDefault();
    const { entity } = this.state;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      });
      const data = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        state: fieldsValue.state,
        uuid: entity.uuid ? entity.uuid : '',
        version: entity.version ? entity.version : 0
      }

      console.log(data)
      this.props.dispatch({
        type: 'storeRtnAuditConfig/save',
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
          <span className={styles.title}>{'退仓单审核生成单据状态设置'}</span>
        </div>
        <Tabs defaultActiveKey='1' onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key='1'>
            <div>
              <Form {...formItemLayout} onSubmit={(e)=>this.handleSubmit(e)}>
                <Form.Item label={'状态'}>
                  {getFieldDecorator('state', {
                    initialValue: entity && entity.state && entity.state === 'AUDITED' ? 'AUDITED' : 'SAVED',
                    rules: [{ required: true, message: notNullLocale('状态') }],
                  })(
                    <Select placeholder={placeholderChooseLocale('状态')} autoFocus>
                      <Select.Option key={'SAVED'} value={'SAVED'}>保存</Select.Option>
                      <Select.Option key={'AUDITED'} value={'AUDITED'}>审核</Select.Option>
                    </Select>
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}RtnGenBillStateConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
