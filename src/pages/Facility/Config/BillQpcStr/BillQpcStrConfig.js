import React, { Component } from 'react';
import { Form, Button, Input, message, Select, InputNumber, Tabs } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Facility/Config/Config.less';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { billType, qpcStrFrom } from './BillQpcStrConfigContans';
const TabPane = Tabs.TabPane;
const qpcStrFromOptions = [];
Object.keys(qpcStrFrom).forEach(function (key) {
  qpcStrFromOptions.push(<Select.Option value={qpcStrFrom[key].name} key={qpcStrFrom[key].name}>{qpcStrFrom[key].caption}</Select.Option>);
});
@connect(({ billQpcStrConfig, loading }) => ({
  billQpcStrConfig,
  loading: loading.models.billQpcStrConfig,
}))
@Form.create()
export default class BillQpcStrConfig extends Component {
  state = {
    submitting: false,
    data: [],
    tabOneKey: 1
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.billQpcStrConfig.data
    });
  }

  refresh() {
    this.props.dispatch({
      type: 'billQpcStrConfig/getByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
      }
    });
  }

  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        tabOneKey: this.state.tabOneKey + 1
      })
    }
  }

  handleSubmit = (e) => {
    const { data } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      })
      /**第一种思路，循环数据库数据。如果是已经存在的配送中心，可能会出现页面不显示数据的问题。(适用于目前的后端接口)*/
      //  data.forEach(function (config) {
      //    config.qpcStrFrom = fieldsValue[config.billType];
      //  })

      // 第二种思路，循环单据类型，适用于数据库没数据时仍然可在页面显示，用户可直接新增或修改。
      let newData = [];
      Object.keys(billType).map(function (k) {
        newData.push({
          companyUuid:loginCompany().uuid,
          dcUuid:loginOrg().uuid,
          billType: k,
          qpcStrFrom: fieldsValue[k],
        });
      });
      this.props.dispatch({
        type: 'billQpcStrConfig/modify',
        payload: newData,
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

  render() {
    const { entity, submitting, data } = this.state;
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
    /**第一种思路，循环数据库数据*/
    // const formItems = data.map((k, index) => {
    //   let initialValue = k.qpcStrFrom ? k.qpcStrFrom : qpcStrFrom.FROMBILL.name;
    //   return <Form.Item
    //     label={billType[k.billType].caption}
    //     key={k.billType}
    //   >
    //     {getFieldDecorator(k.billType, {
    //       validateTrigger: ['onChange', 'onBlur'],
    //       initialValue: initialValue
    //     })(<Select>{qpcStrFromOptions}</Select>)}
    //   </Form.Item>
    // });

    //第二种思路，循环单据类型
    const formItems = Object.keys(billType).map(function (k) {
      let config = data.find(function (value) {
        return value.billType == k;
      })
      let initialValue = config ? config.qpcStrFrom : undefined;
      return <Form.Item
        label={billType[k].caption}
        key={k}
      >
        {getFieldDecorator(k, {
          rules: [{
            required: true,
            message: '取值不能为空',
          }],
          validateTrigger: ['onChange', 'onBlur'],
          initialValue: initialValue
        })(<Select placeholder={placeholderChooseLocale('')}>{qpcStrFromOptions}</Select>)}
      </Form.Item>
    });

    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.innerConfig.billQpcstrCongig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab={commonLocale.congfigLocale} key="1">
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                {formItems}
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 4 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>

            </TabPane>
            <TabPane tab='操作日志' key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}BillQpcStr`} key={tabOneKey} />
            </TabPane>
          </Tabs>

        </div>
      </div>
    );
  }
}
