import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, message, Tabs
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { binViewLocale } from './BinViewLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
const { TabPane } = Tabs;
@connect(({ rfBinViewConfig, loading }) => ({
  rfBinViewConfig,
  loading: loading.models.rfBinViewConfig,
}))
@Form.create()
export default class BinViewConfig extends Component {
  state = {
    submitting: false,
    entity: {},
    keyLog: 0
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'rfBinViewConfig/getByCompanyUuidAndDcUuid',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rfBinViewConfig.data.entity) {
      this.setState({
        entity: nextProps.rfBinViewConfig.data.entity
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { entity } = this.state;

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({
        submitting: true,
      })
      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        version: entity ? entity.version : 0
      };

      this.props.dispatch({
        type: 'rfBinViewConfig/save',
        payload: values,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.componentDidMount();
          } else {
            message.error(response.message);
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
    const {
      rfBinViewConfig: { data },
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
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.innerConfig.binViewConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={binViewLocale.rfbinviewBinFormat}
                >
                  {getFieldDecorator('binFormat', {
                    initialValue: data.entity ? data.entity.binFormat : '',
                    rules: [
                      { required: true, message: notNullLocale(binViewLocale.rfbinviewBinFormat) },
                      {
                        pattern: binViewPattern.pattern,
                        message: binViewPattern.message,
                      }
                    ],
                  })(
                    <Input placeholder={binViewLocale.rfbinviewBinFormatAdd} autoFocus/>
                  )}
                </Form.Item>

                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
          <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
            <EntityLogTab entityUuid={`${loginOrg().uuid}RfBinViewConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}