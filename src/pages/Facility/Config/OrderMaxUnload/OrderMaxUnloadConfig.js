import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, InputNumber, message, Tabs
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { orderMaxUnloadLocale } from './OrderMaxUnloadLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const { TabPane } = Tabs;
@connect(({ orderMaxUnloadConfig, loading }) => ({
  orderMaxUnloadConfig,
  loading: loading.models.orderMaxUnloadConfig,
}))
@Form.create()
export default class OrderMaxUnloadConfig extends Component {
  state = {
    entity: {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    },
    keyLog: 0
  }

  componentDidMount = () => {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orderMaxUnloadConfig.data) {
      this.setState({
        entity: nextProps.orderMaxUnloadConfig.data
      })
    }
  }

  refresh() {
    this.props.dispatch({
      type: 'orderMaxUnloadConfig/getByCompanyUuidAndDcUuid',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
    });
  }

  handleSubmit = (e) => {
    console.log(e)
    e.preventDefault();
    const { entity } = this.state;

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      let data = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...fieldsValue
      }

      this.props.dispatch({
        type: 'orderMaxUnloadConfig/save',
        payload: data,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.componentDidMount();
          } else {
            message.error(response.message);
          }
        }
      })
      this.refresh();
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
    const {
      orderMaxUnloadConfig: { data },
      loading,
    } = this.props;

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

    const inputNumberProps = {
      min: 1,
    };

    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.bookConfig.orderMaxUnloadConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            {/* <di/> */}
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              <Form.Item
                label={orderMaxUnloadLocale.orderMaxUnloadNumber}
              >
                {getFieldDecorator('maxUnload', {
                  initialValue: data ? data.maxUnload : '',
                  rules: [
                    { required: true, message: notNullLocale(orderMaxUnloadLocale.orderMaxUnloadNumber) }
                  ],
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    {...inputNumberProps} placeholder={orderMaxUnloadLocale.orderMaxUnloadNumber} />
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
            {/* </div> */}
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`${loginOrg().uuid}OrderMaxUnloadConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}