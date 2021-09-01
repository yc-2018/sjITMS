import React, { Component } from 'react';
import {
  Form, Button, Input, message, Select, InputNumber, Tabs, Table
} from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderLocale,placeholderChooseLocale} from '@/utils/CommonLocale';
import { configLocale } from '@/pages/Account/Config/ConfigLocale';
import styles from '@/pages/Account/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { stockBatchConfigLocale } from './StockBatchConfigLocale';

const TabPane = Tabs.TabPane;
const { Option } = Select;

@connect(({ stockBatchConfig, loading }) => ({
  stockBatchConfig,
  loading: loading.models.stockBatchConfig,
}))
@Form.create()
export default class StockBatchConfig extends Component {
  state = {
    entity: {
      companyUuid: loginCompany().uuid,
      dateLength: 0, // 日期长度
      flowLength: 0 // 流水号长度
    },
    tabOneKey:1
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.props.dispatch({
      type: 'stockBatchConfig/getByCompanyUuid',
      payload: {
        companyUuid: loginCompany().uuid,
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
    if (nextProps.stockBatchConfig.data&&nextProps.stockBatchConfig.data.companyUuid) {
      this.setState({
        entity: nextProps.stockBatchConfig.data
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }

      let data = {
        ...this.state.entity,
        ...fieldsValue,
      }
      this.props.dispatch({
        type: 'stockBatchConfig/saveOrUpdate',
        payload: data,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      })
      
      this.refresh();
    });
  }
  render() {
    const {
      stockBatchConfig: { data },
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
          <span className={styles.title}>{configLocale.stockBatchConfig.stockBatchConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab={stockBatchConfigLocale.configInfo} key="1">
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={stockBatchConfigLocale.dateLength}
                >
                  {getFieldDecorator('dateLength', {
                    initialValue: data ? data.dateLength : 0,
                    rules: [{ required: true, message:notNullLocale(stockBatchConfigLocale.dateLength) }],
                  })(
                    <Select placeholder={placeholderChooseLocale(stockBatchConfigLocale.dateLength)} style={{ width: 150 }}>
                      <Option value ={6}>6</Option>
                      <Option value ={8}>8</Option>
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label={stockBatchConfigLocale.flowLength} >
                  {getFieldDecorator('flowLength', {
                    initialValue: data ? data.flowLength : 0,
                    rules: [{ required: true, message: notNullLocale(stockBatchConfigLocale.flowLength) }],
                  })(
                    <InputNumber placeholder={placeholderLocale(stockBatchConfigLocale.flowLength)} 
                      min={4}
                      max={18}
                      precision={0}
                      style={{ width: 150 }}/>
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
            <TabPane tab={stockBatchConfigLocale.operateInfo} key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}StockBatchConfig`} key={tabOneKey}/>
            </TabPane>
          </Tabs>

        </div>
      </div>
    )
  }
}
