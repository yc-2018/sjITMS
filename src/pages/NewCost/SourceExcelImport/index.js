import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { Steps, Button, message, Modal, Select, Form } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PageDetail from '@/components/MyComponent/PageDetail';
import SelectIndex from './Select';
import Result from './Result';
import { DatePicker } from 'antd';
import { Radio } from 'antd';
import moment from 'moment';
import { dynamicQuery } from '@/services/quick/Quick';
import { loginUser } from '@/utils/LoginContext';

const Step = Steps.Step;
const { MonthPicker } = DatePicker;
const defaultMonth = moment().subtract(1, 'months');
const FormItem = Form.Item;
/**
 * title{string}:提供页眉标题
 * templateType{string}:提供下载模板
 * uploadType{string}:提供model定义上传接口类型
 * uploadParams{object}:上传接口参数
 * cancelCallback{func}:取消按钮回调
 * dispatch{func}:提供调用的上传接口
 */

/**
 * 分步Excel导入组件
 */
@Form.create()
class ExcelImport extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    templateType: PropTypes.string,
    uploadType: PropTypes.string,
    uploadParams: PropTypes.object,
    cancelCallback: PropTypes.func,
    dispatch: PropTypes.func,
  };

  state = {
    current: 0,
    fileKey: '',
    fileName: '',
    isModalOpen: false,
    importType: '1',
    //导入数据的月份
    importMonth: defaultMonth,
    //是否为周期计费表
    disabledBoolean: this.props.costForm.datatype !== 'Periodicity',
    //数据源的列数组
    columns: [],
    queryByOrg: this.props.queryByOrg,
    portOrg: loginUser().rolesOrg[0],
  };

  componentDidMount() {
    this.queryColumns();
  }

  //获取列配置
  queryColumns = async () => {
    const { costForm } = this.props;
    let param = {
      tableName: 'cost_form_field',
      orderBy: ['LINE+'],
      condition: {
        params: [{ field: 'FORMUUID', rule: 'eq', val: [this.props.selectedRows] }],
      },
    };
    const columnsData = await dynamicQuery(param, costForm.system);
    if (columnsData && columnsData.success && columnsData.result.records.length > 0) {
      this.initConfig(columnsData.result.records);
    }
  };

  initConfig = queryConfig => {
    let quickColumns = new Array();
    queryConfig.filter(data => data.SHOW).forEach(data => {
      const qiuckcolumn = {
        title: data.DB_FIELD_TXT,
        dataIndex: data.DB_FIELD_NAME,
        key: data.DB_FIELD_NAME,
        sorter: true,
        width: data.DB_LENGTH,
        fieldType: data.DB_TYPE,
        allowUpdate: data.ALLOWUPDATE,
        render: (val, record) => this.getRender(val, data, record),
      };
      quickColumns.push(qiuckcolumn);
    });
    if (quickColumns.length == 0) {
      message.error(this.state.title + '数据源展示列为空');
      return;
    }

    this.setState({
      columns: quickColumns,
    });
  };

  drawOption = () => {
    const { dict } = this.props;
    let org = loginUser().rolesOrg[0].split(',');
    const options = dict.filter(x => org.includes(x.itemValue));
    return options.map(option => {
      return <Option value={option.itemValue + ',' + option.itemText}>{option.itemText}</Option>;
    });
  };

  /**
   * 下一步
   */
  next = () => {
    this.setState({ isModalOpen: true });
    // const current = this.state.current + 1;
    // this.setState({ current });
    this.setState({ importType: '1' });
    this.setState({ importMonth: defaultMonth });
    if (this.state.disabledBoolean) {
      this.setState({ importMonth: null });
    }
  };

  /**
   * 上一步
   */
  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  setFileKey = fileKey => {
    this.setState({
      fileKey: fileKey,
    });
  };

  setFileName = fileName => {
    this.setState({
      fileName: fileName,
    });
  };

  //适配后端 20230406
  downloadFile = (key, isDataBase) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'imTemplate/getPath',
      payload: {
        type: key,
        isDataBase: isDataBase,
      },
    });
  };

  importCallback = result => {
    this.setState({
      successData: result,
    });
  };

  //禁止点击后面的月份
  disabledFutureMonths = current => {
    // 获取当前月的开始时间（1号的凌晨）
    const currentMonthStart = new Date(current.year(), current.month(), 1);
    // 获取当前时间
    const currentDate = new Date();

    // 如果当前月的开始时间在当前时间之后，禁用该月
    return currentMonthStart > currentDate;
  };
  selectMonth = (date, dateString) => {
    this.setState({ importMonth: date });
  };

  render() {
    const {
      title,
      uploadType,
      uploadParams,
      cancelCallback,
      dispatch,
      templateType,
      form,
    } = this.props;

    const {
      current,
      fileKey,
      fileName,
      isModalOpen,
      importType,
      importMonth,
      disabledBoolean,
      columns,
      queryByOrg,
      portOrg,
    } = this.state;

    const pageTitle = formatMessage({ id: 'common.excelImport.title' }) + title;

    const selectProps = {
      templateType: templateType,
      setFileKey: this.setFileKey,
      setFileName: this.setFileName,
      next: this.next,
      downloadFile: this.downloadFile,
    };

    const resultProps = {
      fileKey: fileKey,
      fileName: fileName,
      uploadType: uploadType,
      uploadParams: uploadParams,
      prev: this.prev,
      dispatch: dispatch,
      downloadFile: this.downloadFile,
      callback: this.importCallback,
    };

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    //导出空白模板所需要的变量
    const exportEmptyTemplate = {
      title: title,
      columns: columns,
    };

    const actionBtn = (
      <Fragment>
        <Button onClick={() => cancelCallback(this.state.successData)}>
          {formatMessage({ id: 'common.button.back' })}
        </Button>
      </Fragment>
    );

    const pageDetailProps = {
      title: pageTitle,
      action: actionBtn,
    };
    if (this.props.styleType === 'config') {
      return (
        <PageDetail {...pageDetailProps}>
          <div className={styles.excelImport}>
            <Steps current={current}>
              <Step key="1" title={formatMessage({ id: 'common.excelImport.step1.tips' })} />
              <Step key="2" title={formatMessage({ id: 'common.excelImport.step2.tips' })} />
            </Steps>
            <div className="steps-content">
              {current === 0 && <SelectIndex {...selectProps} />}
              {current === 1 && <Result {...resultProps} />}
            </div>
          </div>
        </PageDetail>
      );
    } else {
      return (
        <PageHeaderWrapper>
          <Modal
            title="导入选项"
            visible={isModalOpen}
            onOk={() => {
              const current = this.state.current + 1;
              this.setState({ current, isModalOpen: false });
            }}
            onCancel={() => {
              this.setState({ isModalOpen: false });
            }}
          >
            <Form>
              <FormItem {...formItemLayout} label="导入模式">
                {form.getFieldDecorator('importType')(
                  <Radio.Group
                    style={{ marginLeft: 30 }}
                    value={importType}
                    buttonStyle="solid"
                    onChange={value => {
                      this.setState({ importType: value.target.value });
                    }}
                  >
                    <Radio value="1">覆盖导入</Radio>
                    <Radio value="2">增量更新模式</Radio>
                  </Radio.Group>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="数据月份">
                {form.getFieldDecorator('importMonth')(
                  <MonthPicker
                    renderExtraFooter={() => '请选择月份'}
                    value={importMonth}
                    disabledDate={this.disabledFutureMonths}
                    placeholder="请选择导入数据的月份"
                    // style={{ marginLeft: 50 }}
                    width={'100%'}
                    onChange={this.selectMonth}
                    allowClear={false}
                    disabled={disabledBoolean}
                  />
                )}
              </FormItem>
              {loginUser().rolesOrg.length > 0 && queryByOrg ? (
                <FormItem {...formItemLayout} label="所属组织">
                  {form.getFieldDecorator('portOrg', {
                    rules: [{ required: true, message: `字段不能为空` }],
                  })(
                    <Select
                      width={'100%'}
                      placeholder="请选择所属组织"
                      onSelect={val => {
                        this.setState({ portOrg: val });
                      }}
                    >
                      {this.drawOption()}
                    </Select>
                  )}
                </FormItem>
              ) : (
                ''
              )}
            </Form>
          </Modal>
          <PageDetail {...pageDetailProps}>
            <div className={styles.excelImport}>
              <Steps current={current}>
                <Step key="1" title={formatMessage({ id: 'common.excelImport.step1.tips' })} />
                <Step key="2" title={formatMessage({ id: 'common.excelImport.step2.tips' })} />
              </Steps>
              <div className="steps-content">
                {current === 0 && <SelectIndex {...selectProps} {...exportEmptyTemplate} />}
                {current === 1 && (
                  <Result
                    {...resultProps}
                    importType={importType}
                    importMonth={disabledBoolean ? null : importMonth.format('YYYY-MM')}
                    portOrg={portOrg}
                    getFunc={this.props.refDataSource}
                  />
                )}
              </div>
            </div>
          </PageDetail>
        </PageHeaderWrapper>
      );
    }
  }
}

export default ExcelImport;
