import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Radio, Button, message, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { reportLocale } from './ReportLocale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { REPORT_RES } from './ReportPermission';
import { havePermission } from '@/utils/authority';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const orgTypeOptions = [];
Object.keys(orgType).forEach(function (key) {
  if (orgType.heading.name !== orgType[key].name)
    orgTypeOptions.push(<Option value={orgType[key].name} key={orgType[key].name}>{orgType[key].caption}</Option>);
});
@connect(({ report, loading }) => ({
  report,
  loading: loading.models.report,
}))
@Form.create()
class ReportPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      operate: '',
      modalVisible: false, //确认删除提示框
    }
  }

  componentDidMount = () => {
    this.getReport();
  }

  componentDidUpdate() {
    if (document.getElementById('name') != null && (document.activeElement.tagName == 'BODY' || document.activeElement.id == 'name')) {
      document.getElementById('name').focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.report.entity) {
      this.setState({
        entity: nextProps.report.entity
      })
    }
    if (this.props.selectedReport != nextProps.selectedReport && nextProps.selectedReport) {
      this.getReport(nextProps.selectedReport.uuid);
    }
    if (nextProps.selectedReport == undefined) {
      this.setState({
        entity: {}
      });
    }
    if (nextProps.selectedReport == undefined && this.props.selectedReport != undefined) {
      this.props.form.resetFields();
    }
  }
  /**
   * 查询一条方案的信息
   */
  getReport = (uuid) => {
    const { dispatch, selectedReport, form } = this.props;
    form.resetFields();
    let param = uuid ? uuid : (selectedReport ? selectedReport.uuid : null);
    if (param) {
      dispatch({
        type: 'report/get',
        payload: {
          uuid: param
        },
      });
    }
  }

  /**
   * 保存
   */
  handleSave = e => {
    e.preventDefault();
    const { form, selectedMenu } = this.props;
    const { entity } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      let data = {};
      if (entity.uuid) {
        data = {
          ...fieldsValue,
          uuid: entity.uuid,
          upperUuid: entity.upperUuid
        };
      } else {
        data = {
          ...fieldsValue,
          upperUuid: selectedMenu.uuid
        };
      }
      data.orgUuid = loginOrg().uuid;
      this.props.handleAdd(data);
    });
  };

  render() {
    const { form, selectedReport } = this.props;
    const { entity } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 7 },
    };
    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{selectedReport ? entity.name : reportLocale.newReport}</span>
        </div>
        {selectedReport && entity.orgUuid === loginOrg().uuid ? <div className={styles.rightContentButton}>
          <Button style={{ marginLeft: '1%' , float: 'right' }} type="primary"
                  onClick={()=>this.props.showFolderModal()}>
            移动
          </Button>
          <Button style={{ float: 'right' }} disabled={!havePermission(REPORT_RES.REMOVE)}
                  onClick={this.props.that.handleModalVisible.bind(this, commonLocale.deleteLocale, entity, 'report')}>
            {commonLocale.deleteLocale}
          </Button>
        </div> : null}
        <div className={styles.content}>
          <Form onSubmit={this.handleSave} {...formItemLayout}>
            <FormItem label={reportLocale.reportName}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(reportLocale.reportName) },
                  {
                    max: 30,
                    message: tooLongLocale(reportLocale.reportName, 30),
                  },
                  { pattern:commonLocale.UnSpacePattern, message: commonLocale.UnSpacePatternMessage },

                ],
                initialValue: entity.name,
              })(<Input placeholder={placeholderLocale(reportLocale.reportName)} />)}
            </FormItem>
            <FormItem label={reportLocale.path}>
              {form.getFieldDecorator('path', {
                rules: [
                  { required: true, message: notNullLocale(reportLocale.path) },
                  {
                    max: 30,
                    message: tooLongLocale(reportLocale.path, 30),
                  },
                  { pattern:commonLocale.UnSpacePattern, message: commonLocale.UnSpacePatternMessage },
                ],
                initialValue: entity.path,
              })(<Input placeholder={placeholderLocale(reportLocale.path)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={reportLocale.orgTypes}>
              {form.getFieldDecorator('orgTypes', {
                rules: [{ required: true, message: notNullLocale(reportLocale.orgTypes) }],
                initialValue: entity.orgTypes ? entity.orgTypes : [],
              })(
                <Select mode={"multiple"} style={{ width: '100%' }}
                        placeholder={placeholderChooseLocale(reportLocale.orgTypes)}>
                  {orgTypeOptions}
                </Select>
              )}
            </FormItem>
            <FormItem
              label={reportLocale.display}
            >
              {form.getFieldDecorator('display', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(reportLocale.display),
                  },
                ],
                initialValue: entity.display ? entity.display : 'WEB',
              })(<RadioGroup>
                  <Radio value={'WEB'}>WEB</Radio>
                  <Radio value={'APP'}>APP</Radio>
                </RadioGroup>
              )
              }
            </FormItem>
            {loginOrg().type !== orgType.company.name && <FormItem
              label={reportLocale.headingReport}
            >
              {form.getFieldDecorator('headingReport', {
                initialValue: entity.headingReport,
              })(<RadioGroup>
                <Radio value={true}>{commonLocale.yesLocale}</Radio>
                <Radio value={false}>{commonLocale.noLocale}</Radio>
              </RadioGroup>)}
            </FormItem>}
            <FormItem label={commonLocale.noteLocale}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 100,
                    message: tooLongLocale(commonLocale.note, 100),
                  },
                ],
                initialValue: entity.note,
              })(<TextArea placeholder={placeholderLocale(commonLocale.note, 100)} />)}
            </FormItem>
            <FormItem
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span: 16, offset: 11 },
              }}
            >
              {(entity.uuid && entity.orgUuid === loginOrg().uuid || !entity.uuid) &&
              <Button style={{ marginLeft: '-60px' }} loading={this.state.submitting} type="primary"
                      htmlType="submit" disabled={!havePermission(REPORT_RES.CREATE)}>{commonLocale.saveLocale}</Button>}
            </FormItem>
          </Form>
        </div>
      </div>

    );
  }
};
export default ReportPage;
