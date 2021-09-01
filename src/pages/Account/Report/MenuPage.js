import React, { Component, Fragment } from 'react';
import { Form, Button, Input, message, Radio } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import ReportPage from './ReportPage';
import { reportLocale } from './ReportLocale';
import { loginOrg } from '@/utils/LoginContext';
import { REPORT_RES } from './ReportPermission';
import { havePermission } from '@/utils/authority';
const FormItem = Form.Item;

@connect(({ report, loading }) => ({
  report,
  loading: loading.models.report,
}))
@Form.create()
export default class MenuPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      entity: {},
      operate: '',
      modalVisible: false, //确认删除提示框
    }
  }
  componentDidMount = () => {
    this.getMenu();
  }

  componentDidUpdate(){
    if(document.getElementById('name')!=null&&(document.activeElement.tagName =='BODY'||document.activeElement.id == 'name')){
      document.getElementById('name').focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.report.entity) {
      this.setState({
        entity: nextProps.report.entity,
      })
    }

    if (this.props.menu != nextProps.menu && nextProps.menu) {
      this.getMenu(nextProps.menu.uuid);
    }
    if (nextProps.menu == undefined) {
      this.setState({
        entity: {}
      });
    }
    if (nextProps.menu == undefined && this.props.menu != undefined) {
      this.props.form.resetFields();
    }
  }

  /**
   * 查询一条方案的信息
   */
  getMenu = (uuid) => {
    const { dispatch, menu, form } = this.props;
    form.resetFields();
    let param = uuid ? uuid : (menu ? menu.uuid : null);
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
   * 新增报表的弹窗显示控制
   */
  handleReportVisible = (flag) => {
    this.props.handleReportVisible();
  };


  /**
   * 保存
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    const { entity } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      let type = 'report/add';
      if (entity.uuid) {
        type = 'report/update';
        fieldsValue.uuid = entity.uuid
      }
      const values = {
        ...fieldsValue,
        folder: true,
        orgUuid: loginOrg().uuid
      };
      dispatch({
        type: type,
        payload: { ...values },
        callback: (response) => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'common.message.success.operate' }));
            form.resetFields();
            this.props.reFreshSider();
          }
        },
      });
    });
  }

  render() {
    const { report: { data }, loading } = this.props;
    const { entity } = this.state
    const { menu } = this.props
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
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{menu ? entity.name : reportLocale.newDirectory}</span>
        </div>
        {menu && entity.orgUuid === loginOrg().uuid ? <div className={styles.rightContentButton}>
          <Button style={{ marginLeft: '1%', float: 'right' }} type="primary" disabled={!havePermission(REPORT_RES.CREATE)}
                  onClick={() => this.handleReportVisible(true)}>
            {reportLocale.newReport}
          </Button>
          <Button style={{ float: 'right' }} disabled={!havePermission(REPORT_RES.REMOVE)}
                  onClick={this.props.that.handleModalVisible.bind(this, commonLocale.deleteLocale, entity, 'menu')}>
            {commonLocale.deleteLocale}
          </Button>
        </div> : null}
        <div className={styles.content}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={reportLocale.directoryName}
            >
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(reportLocale.directoryName) },
                  {
                    max: 30,
                    message: tooLongLocale(reportLocale.directoryName, 30),
                  },
                  { pattern:commonLocale.UnSpacePattern, message: commonLocale.UnSpacePatternMessage },
                ],
                initialValue: entity.name,
              })(<Input placeholder={placeholderLocale(reportLocale.directoryName)} autoFocus/>)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={commonLocale.noteLocale}
            >
              {getFieldDecorator('note', {
                rules: [
                  {
                    max: 100,
                    message: tooLongLocale(commonLocale.noteLocale, 100),
                  },
                ],
                initialValue: entity.note,
              })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />)}
            </FormItem>
            <FormItem
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span: 16, offset: 11 },
              }}
            >
              {(entity.uuid && entity.orgUuid === loginOrg().uuid || !entity.uuid) && <Button style={{ marginLeft: '-24px' }}
                                                                                              loading={this.state.submitting} type="primary" htmlType="submit" disabled={!havePermission(REPORT_RES.CREATE)}>
                {commonLocale.saveLocale}</Button>}
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}
