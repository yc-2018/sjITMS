import { PureComponent } from "react";
import { Form, Button, Input, message, Tabs } from 'antd';
import { connect } from 'dva';
import styles from '@/pages/Facility/Config/Config.less';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { printerConfigLocale } from './PrinterConfigLocale';
const TabPane = Tabs.TabPane;
@connect(({ printerConfig,loading }) => ({
  printerConfig,
  loading:loading.models.printerConfig,
}))
@Form.create()
export default class PrinterConfig extends PureComponent {
  state = {
    submitting: false,
    data: {},
    printerList: [],
    tabOneKey: 1
  }
  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.props.dispatch({
      type: 'printerConfig/getByDcUuid'
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.printerConfig.data) {
      this.setState({
        data: nextProps.printerConfig.data
      });
      if (nextProps.printerConfig.data.printerConfigs &&
        nextProps.printerConfig.data.printerConfigs != this.props.printerConfig.data.printerConfigs) {
        this.setState({
          printerList: nextProps.printerConfig.data.printerConfigs.map(printer => printer.name)
        })
      }
    }
  }
  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        tabOneKey: this.state.tabOneKey + 1
      })
    }
  }

  handleSubmit = (e) => {
    const { printerList } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) { return; }
      this.setState({
        submitting: true,
      });
      let printerConfigs = [];
      for (let i = 0; i < printerList.length; i++) {
        if (fieldsValue[i]) {
          let obj = {
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            name: printerList[i],
            shortName: fieldsValue[i]
          };
          printerConfigs.push(obj);
        }
      }
      if (printerConfigs.length < 1) {
        message.error(notNullLocale(commonLocale.printerLocale));
        this.setState({
          submitting: false,
        });
        return;
      }
      let data = {
        printerAddress: fieldsValue.printerAddress,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        printerConfigs: printerConfigs
      }
      this.props.dispatch({
        type: 'printerConfig/saveOrModify',
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

  getPrinter = () => {
    let address = this.props.form.getFieldValue("printerAddress");
    if (address) {
      let that = this;
      $.ajax({
        async: false,//同步请求
        type: "GET",
        url: address + "/printer/getprinters",
        success: function (res) {
          that.setState({
            printerList: res && typeof (res) == 'object' ? res.map(item => item.name).sort() : []
          })
        },
        error: function (res) {
          that.setState({
            printerList: []
          })
        },
      })
    }
  }

  render() {
    const { data, submitting, printerList } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { tabOneKey } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    const formItems = printerList.map((k, index) => {
      let initialValue = undefined;
      if (data.printerConfigs) {
        let a = data.printerConfigs.find(function (obj) {
          return obj.name == k;
        });
        if (a) {
          initialValue = a.shortName
        }
      }
      return <Form.Item
        label={k}
        key={k}
      >
        {getFieldDecorator(index.toString(), {
          validateTrigger: ['onChange', 'onBlur'],
          initialValue: initialValue
        })(<Input placeholder={placeholderLocale(printerConfigLocale.shortName)} />)}
      </Form.Item>
    });
    return (
      <div>
        <div className={styles.topWrapper}>
          <span className={styles.title}>{configLocale.outConfig.printerConfig.name}</span>
        </div>
        <div className={styles.content}>
          <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
            <TabPane tab={commonLocale.congfigLocale} key="1">
              <Form {...formItemLayout}>
              <Form.Item label={printerConfigLocale.printAddress} required={true} style={{ marginBottom: 0 }}>
                <Form.Item style={{ display: 'inline-block', width: 'calc(70% - 6px)' }}>
                    {getFieldDecorator('printerAddress', {
                      initialValue: data.printerAddress,
                      rules: [
                        { required: true, message: notNullLocale(printerConfigLocale.printAddress) },
                        {
                          max: 100, message: tooLongLocale(printerConfigLocale.printAddress, 100),
                        },
                      ],
                    })(
                      <Input
                        placeholder={placeholderLocale(printerConfigLocale.printAddress)}
                        onPressEnter={() => this.getPrinter()}
                        autoFocus
                      />
                    )}
                  </Form.Item>
                  <span style={{ display: 'inline-block', width: '12px', textAlign: 'center' }}></span>
                  <Form.Item style={{ display: 'inline-block', width: 'calc(30% - 6px)' }}>
                    <Button onClick={() => this.getPrinter()}>{printerConfigLocale.getPrinter}</Button>
                  </Form.Item>
                </Form.Item>
                {formItems}
                <Form.Item
                  wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 16, offset: 5 },
                  }}
                >
                  <Button loading={this.state.submitting} type="primary" onClick={this.handleSubmit}>{commonLocale.saveLocale}</Button>
                </Form.Item>
              </Form>

            </TabPane>
            <TabPane tab={commonLocale.operateInfoLocale} key="2" >
              <EntityLogTab entityUuid={`${loginOrg().uuid}PrintConfig`} key={tabOneKey} />
            </TabPane>
          </Tabs>

        </div>
      </div>
    );
  }
}
