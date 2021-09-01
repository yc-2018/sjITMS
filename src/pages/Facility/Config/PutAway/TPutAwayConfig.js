import React, { Component } from 'react';
import {
  Form, Button, Input, message, Select, InputNumber, Tabs, Table
} from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { tPutAwayLocale } from './TPutAwayLocale';
const TabPane = Tabs.TabPane;

@connect(({ tPutAwayConfig, loading }) => ({
  tPutAwayConfig,
  loading: loading.models.tPutAwayConfig,
}))
@Form.create()
export default class TPutAwayConfig extends Component {
  state = {
    entity: {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      decline: 0,
      amplitude: 0,
      lowLevel: 0,
      highLevel: 0
    },
    tabOneKey:1
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.props.dispatch({
      type: 'tPutAwayConfig/getByCompanyUuidAndDcUuid',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
    });
  }

  handleChangeTab =(key)=>{
    if(key == "2"){
      this.setState({
        tabOneKey:this.state.tabOneKey+1
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tPutAwayConfig.data&&nextProps.tPutAwayConfig.data.companyUuid) {
      this.setState({
        entity: nextProps.tPutAwayConfig.data
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }

      let data = {
        ...this.state.entity,
        ...fieldsValue
      }

      if (!data.uuid) {
        this.props.dispatch({
          type: 'tPutAwayConfig/insert',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        })
      } else {
        this.props.dispatch({
          type: 'tPutAwayConfig/modify',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.modifySuccessLocale);
            }
          }
        })
      }
      this.refresh();
    });
  }
  render() {
    const {
      tPutAwayConfig: { data },
      loading,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { tabOneKey } = this.state;
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
          <span className={styles.title}>{configLocale.putawayConfig.t_putawayConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab= {commonLocale.congfigLocale} key="1">
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label = {tPutAwayLocale.decline}>
                  {getFieldDecorator('decline', {
                    initialValue: data ? data.decline : 0,
                    rules: [{ required: true, message: tPutAwayLocale.input }],
                  })(
                    <InputNumber placeholder = {tPutAwayLocale.input + tPutAwayLocale.decline} min={0} autoFocus/>
                  )}
                </Form.Item>
                <Form.Item label = {tPutAwayLocale.amplitude}>
                  {getFieldDecorator('amplitude', {
                    initialValue: data ? data.amplitude : 1,
                    rules: [{ required: true, message: tPutAwayLocale.input }],
                  })(
                    <InputNumber placeholder = {tPutAwayLocale.input + tPutAwayLocale.amplitude} min={1} />
                  )}
                </Form.Item>
                <Form.Item label = {tPutAwayLocale.lowLevel}>
                  {getFieldDecorator('lowLevel', {
                    initialValue: data ? data.lowLevel : 0,
                    rules: [{ required: true, message: tPutAwayLocale.input }],
                  })(
                    <InputNumber placeholder = {tPutAwayLocale.input + tPutAwayLocale.lowLevel} min={0} autoFocus/>
                  )}
                </Form.Item>
                <Form.Item label = {tPutAwayLocale.highLevel}>
                  {getFieldDecorator('highLevel', {
                    initialValue: data ? data.highLevel : 0,
                    rules: [{ required: true, message: tPutAwayLocale.input }],
                  })(
                    <InputNumber placeholder = {tPutAwayLocale.input + tPutAwayLocale.highLevel} min={0} autoFocus/>
                  )}
                </Form.Item>

                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.props.loading} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>

            </TabPane>
            <TabPane tab = {commonLocale.operateInfoLocale} key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}PutaWayConfig`} key={tabOneKey}/>
            </TabPane>
          </Tabs>

        </div>
      </div>
    )
  }
}
