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
const TabPane = Tabs.TabPane;

@connect(({ printLabelConfig, loading }) => ({
  printLabelConfig,
  loading: loading.models.printLabelConfig,
}))
@Form.create()
export default class PrintLabelConfig extends Component {
  state = {
    entity: {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      continueTime: 0,
      continuePrintNum: 1,
      minLabel: 1
    },
    tabOneKey:1
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.props.dispatch({
      type: 'printLabelConfig/getByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid
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
    if (nextProps.printLabelConfig.data) {
      this.setState({
        entity: nextProps.printLabelConfig.data
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }

      let data = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...this.state.entity,
        ...fieldsValue
      }

      if (!data.uuid) {
        this.props.dispatch({
          type: 'printLabelConfig/insert',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
            }
          }
        })
      } else {
        this.props.dispatch({
          type: 'printLabelConfig/modify',
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
      printLabelConfig: { data },
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
          <span className={styles.title}>{configLocale.outConfig.printLabelConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab='配置信息' key="1">
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label="打印时间间隔"
                >
                  {getFieldDecorator('continueTime', {
                    initialValue: data ? data.continueTime : 0,
                    rules: [{ required: true, message: '请输入' }],
                  })(
                    <InputNumber placeholder='填写打印时间间隔' min={0} autoFocus />
                  )}
                </Form.Item>
                <Form.Item label="连续打印次数" >

                  {getFieldDecorator('continuePrintNum', {
                    initialValue: data ? data.continuePrintNum : 1,
                    rules: [{ required: true, message: '请输入' }],
                  })(
                    <InputNumber placeholder='填写连续打印次数' min={1} />
                  )}
                </Form.Item>
                <Form.Item label="最小打印标签数" >

                  {getFieldDecorator('minLabel', {
                    initialValue: data ? data.minLabel : 1,
                    rules: [{ required: true, message: '请输入' }],
                  })(
                    <InputNumber placeholder='填写最小打印标签数' min={1} />
                  )}
                </Form.Item>

                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.props.loading} type="primary" htmlType="submit">保存</Button>
                </Form.Item>
              </Form>

            </TabPane>
            <TabPane tab='操作日志' key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}PrintLabelConfig `} key={tabOneKey}/>
            </TabPane>
          </Tabs>

        </div>
      </div>
    )
  }
}
