import { PureComponent } from "react";
import { Form, Button, Input, message, Tabs, Select, Icon } from 'antd';
import { connect } from 'dva';
import styles from '@/pages/Facility/Config/Config.less';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { taskScopeConfigLocale } from '@/pages/Facility/Config/TaskScope/TaskScopeConfigLocale';
import ConfigPrinterSelect from '@/pages/Component/Select/ConfigPrinterSelect';
import { binScopePattern } from '@/utils/PatternContants';
const TabPane = Tabs.TabPane;
let id = 0;
@connect(({ binScopePrinterConfig,loading }) => ({
  binScopePrinterConfig,
  loading:loading.models.binScopePrinterConfig,
}))
@Form.create()
export default class BinScopePrinterConfig extends PureComponent {
  state = {
    submitting: false,
    data: [],
    tabOneKey: 1
  }
  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.props.dispatch({
      type: 'binScopePrinterConfig/getByDcUuid'
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.binScopePrinterConfig.data != this.props.binScopePrinterConfig.data) {
      this.setState({
        data: nextProps.binScopePrinterConfig.data
      })
    }
  }
  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        tabOneKey: this.state.tabOneKey + 1
      })
    }
  }

  remove = index => {
    let { data } = this.state;
    if (data.length === 1) {
      return;
    }
    data.splice(index, 1);
    this.setState({
      data: [...data]
    }, () => { this.props.form.resetFields() });
  };

  handleChangeField = (e, index, fieldName) => {
    let { data } = this.state;
    let key = data[`${index}`];
    if (e.target) {
      key[`${fieldName}`] = e.target.value;
    } else {
      key[`${fieldName}`] = e;
    }
    this.setState({
      data: [...data]
    })
  }

  add = () => {
    const nextKeys = this.state.data.concat({ binScope: undefined, printerName: undefined });
    this.setState({
      data: [...nextKeys],
    });
  };
  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if(this.state.data.length==0){
        message.error('数据不能为空');
        return ;
      }
      if (err) { return; }
      this.setState({
        submitting: true,
      });
      this.state.data.map(item => {
        item.companyUuid = loginCompany().uuid;
        item.dcUuid = loginOrg().uuid;
        delete item.uuid;
      })
      this.props.dispatch({
        type: 'binScopePrinterConfig/saveOrModify',
        payload: this.state.data,
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
    })
  }
  render() {
    const { data, submitting } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { tabOneKey } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 3 },
      },
    };
    const formItems = data.map((k, index) => {
      return <Form.Item
        label={taskScopeConfigLocale.binRange + '及' + commonLocale.printerLocale}
        required={true}
        key={index}
      >
        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
        >
          {
            getFieldDecorator(`binScope[${index}]`, {
              initialValue: k.binScope,
              rules: [
                { required: true, message: notNullLocale(taskScopeConfigLocale.binRange) },
                {
                  pattern: binScopePattern.pattern, message: binScopePattern.message,
                }
              ],
            })(
              <Input placeholder={placeholderLocale(taskScopeConfigLocale.binRange)} onChange={(e) => this.handleChangeField(e, index, 'binScope')} autoFocus/>
            )
          }
        </Form.Item>
        <span style={{ display: 'inline-block', width: '8px', textAlign: 'center' }}></span>
        <Form.Item style={{ display: 'inline-block', width: 'calc(40% - 12px)', marginRight: 8 }}>
          {
            getFieldDecorator(`printerName[${index}]`, {
              initialValue: k.printerName,
              rules: [
                { required: true, message: notNullLocale(commonLocale.printerLocale) }
              ],
            })(
              <ConfigPrinterSelect onChange={(e) => this.handleChangeField(e, index, 'printerName')} />
            )
          }
        </Form.Item>
        {data.length > 1 && <Icon
          className={styles.dynamicDeleteButton}
          type="minus-circle-o"
          onClick={() => this.remove(index)}
        />
        }
      </Form.Item>
    });
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.outConfig.binScopePrinterConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab={commonLocale.congfigLocale} key="1">
              <Form {...formItemLayout}>
                {formItems}
                <Form.Item label='' {...formItemLayoutWithOutLabel}>
                  <Button type="dashed" onClick={this.add} style={{ width: '88%' }}
                  >
                    <Icon type="plus" /> 添加
                  </Button>
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 3 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" onClick={this.handleSubmit}>{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>

            </TabPane>
            {/* <TabPane tab={commonLocale.operateInfoLocale} key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}BinScopePrinter`} key={tabOneKey} />
            </TabPane> */}
          </Tabs>

        </div>
      </div>
    );
  }
}
