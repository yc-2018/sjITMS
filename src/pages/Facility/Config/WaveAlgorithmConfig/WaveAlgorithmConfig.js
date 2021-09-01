import React, { Component, Fragment } from 'react';
import { Form, Button, Input, message, Tabs, Select,  } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Facility/Config/Config.less';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { Algorithm } from './WaveAlgorithmConfigContants'
const { TabPane } = Tabs;
const Option = Select.Option;

const algorithmOptions = [];
Object.keys(Algorithm).forEach(function (key) {
  if(key === 'Default'){
    algorithmOptions.push(<Option key={Algorithm[key].name} value={Algorithm[key].name} disabled>{Algorithm[key].caption}</Option>);
  }else{
    algorithmOptions.push(<Option key={Algorithm[key].name} value={Algorithm[key].name}>{Algorithm[key].caption}</Option>);
  }
});
@connect(({ waveAlgorithmConfig, loading }) => ({
  waveAlgorithmConfig,
  loading: loading.models.waveAlgorithmConfig,
}))
@Form.create()
export default class WaveAlgorithmConfig extends Component {
  state = {
    submitting: false,
    entity: {},
    keyLog: 0
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'waveAlgorithmConfig/getByDcUuid',
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.waveAlgorithmConfig.data&&nextProps.waveAlgorithmConfig.data!=this.props.waveAlgorithmConfig.data) {
      this.setState({
        entity: nextProps.waveAlgorithmConfig.data
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
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        algorithms:fieldsValue.algorithms
      };

      this.props.dispatch({
        type: 'waveAlgorithmConfig/saveOrModify',
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
    const { loading } = this.props;
    const { entity } = this.state;
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
          <span className={styles.title}>{configLocale.outConfig.waveAlgorithmConfig.name}</span>
        </div>
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          <TabPane tab={commonLocale.congfigLocale} key="1">
            <div>
              <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item
                  label={'配货算法'}
                >
                  {getFieldDecorator('algorithms', {
                    initialValue: entity.algorithms ? entity.algorithms : 'Default',
                    rules: [
                      { required: true, message: notNullLocale('配货算法') },
                    ],
                  })(
                     <Select mode="multiple">
                       {algorithmOptions}
                     </Select>
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
            <EntityLogTab entityUuid={`${loginOrg().uuid}WaveAlgorithmConfig`} key={this.state.keyLog} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}