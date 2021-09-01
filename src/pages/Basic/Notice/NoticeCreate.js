import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Upload, Input, message, DatePicker, Select, Button, Radio, Icon } from 'antd';
import { loginOrg, loginUser, loginCompany, loginKey } from '@/utils/LoginContext';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import configs from '@/utils/config';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import Editor from '@/components/MyComponent/Editor';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import { PRETYPE } from '@/utils/constants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { noticeLocale } from './NoticeLocale';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@connect(({ notice, pretype, loading }) => ({
  notice,
  pretype,
  loading: loading.models.notice,
}))
@Form.create()
export default class NoticeCreate extends PureComponent {
  state = {
    attachments: {},
    confirmLeaveVisible: false,
    data: [],
    confirmLoading: false,
  };

  componentDidMount() {
    window.onbeforeunload = confirmLeaveFunc;

    this.fetchNoticeTypesByCompanyUuid();

    if (loginOrg().type == 'COMPANY') {
      this.setState({
        upperUuid: loginOrg().uuid,
        customOptions: [
          { key: 'allHEADING', caption: noticeLocale.createSelectHEADING },
          { key: 'allSTORE', caption: noticeLocale.createSelectStore },
          { key: 'allDC', caption: noticeLocale.createSelectDC },
          { key: 'allCARRIER', caption: noticeLocale.createSelectCarrier },
          { key: 'allVENDOR', caption: noticeLocale.createSelectVendor }
        ]
      })
    } else if (loginOrg().type == 'HEADING') {
      this.setState({
        customOptions: [
          { key: 'allCOMPANY', caption: noticeLocale.createSelectAllCompany },
          { key: 'allSTORE', caption: noticeLocale.createSelectStore },
          { key: 'allDC', caption: noticeLocale.createSelectDC },
          { key: 'allCARRIER', caption: noticeLocale.createSelectCarrier },
          { key: 'allVENDOR', caption: noticeLocale.createSelectVendor }
        ]
      })
    }else {
      this.setState({
        customOptions: [
          { key: 'COMPANY', caption: noticeLocale.createSelectCompany },
        ]
      })
    }
  }

  fetchNoticeTypesByCompanyUuid = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'pretype/queryType',
      payload: PRETYPE['notice']
    });
  };

  componentWillUnmount() {
    window.onbeforeunload = undefined;
  }

  handleCancel = () => {
    this.setState({
      confirmLeaveVisible: true,
    })
  }

  handleLeaveConfirmOk = () => {
    this.props.dispatch({
      type: 'notice/onShowPage',
      payload: {
        showPage: 'query'
      }
    })
  }

  handleLeaveConfirmCancel = () => {
    this.setState({
      confirmLeaveVisible: false,
    })
  }

  handleSearch = value => {
    this.props.dispatch({
      type: 'notice/queryOrg',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            data: response.data ? response.data : []
          });
        }
      },
    })
  };

  onEditerChange = (html) => {
    this.props.form.setFieldsValue({
      content: html,
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({
        confirmLoading: true
      });
      let selectedOrgs = [];
      values.target.forEach(function (value) {
        if (value.includes('{')) {
          selectedOrgs.push(JSON.parse(value).uuid);
        } else {
          selectedOrgs.push(value);
        }
      })

      const params = {
        title: values.title,
        selectedOrgs: selectedOrgs,
        content: values.content,
        type: values.type,
        publisher: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        },
        publishOrg: {
          uuid: loginOrg().uuid,
          code: loginOrg().code,
          name: loginOrg().name
        },
        attachments: this.state.attachments,
        canReply: values.canReply
      }

      this.props.dispatch({
        type: 'notice/saveNotice',
        payload: params,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.handleLeaveConfirmOk();
          }
          this.setState({
            confirmLoading: false
          })
        },
      })
    });
  };

  render() {
    const typeNames = this.props.pretype.names;

    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { attachments, confirmLeaveVisible } = this.state;

    let typeNamesItems = [];
    if (typeNames && typeNames.length > 0) {
      typeNames.map((result) => typeNamesItems.push(<Select.Option key={`${result}`}>{`${result}`}</Select.Option>));
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 }
      },
    };

    const props = {
      name: 'file',
      action: configs[API_ENV].API_SERVER + "/iwms-common/common/oss/upload",
      headers: {
        iwmsJwt: loginKey()
      },
      withCredentials: true,
      onChange(info) {
        if (info.file.status === 'removed') {
          if (attachments[info.file.name] != undefined) {
            delete attachments[info.file.name];
          }
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name}${noticeLocale.createUploadSuccess}`);
          attachments[info.file.name] = info.file.response.data;
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name}${noticeLocale.createUploadError}`);
        }
      },
    };

    const comfirmLeaveProps = {
      confirmLeaveVisible: confirmLeaveVisible,
      action: CONFIRM_LEAVE_ACTION['NEW'],
      handleLeaveConfirmOk: this.handleLeaveConfirmOk,
      handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
    }

    const actionBtn = (
      <Fragment>
        <Button onClick={this.handleCancel} >
          {commonLocale.cancelLocale}
        </Button>
        <Button type="primary" onClick={this.handleSubmit} loading={this.state.confirmLoading}>
          {commonLocale.confirmLocale}
        </Button>
      </Fragment>
    );
    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={noticeLocale.title} action={actionBtn} />
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout} label={noticeLocale.createTitle}>
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(noticeLocale.createTitle),
                  },
                  {
                    max: 30,
                    message: tooLongLocale(noticeLocale.createTitle, 30),
                  }
                ],
              })(<Input placeholder={placeholderLocale(noticeLocale.createTitle)} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={noticeLocale.type}
            >
              {getFieldDecorator('type', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(noticeLocale.type),
                  },
                ],
              })(<Select placeholder={placeholderChooseLocale(noticeLocale.type)}>{typeNamesItems}</Select>)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={noticeLocale.createReceiver}
            >
              {getFieldDecorator('target', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(noticeLocale.createReceiver),
                  },
                ],
              })(
              <OrgSelect mode="multiple" 
                upperUuid={loginOrg().uuid} 
                customOptions={this.state.customOptions}
                placeholder={placeholderChooseLocale(noticeLocale.createReceiver)}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={noticeLocale.createAnswer}
            >
              {getFieldDecorator('canReply', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(noticeLocale.createAnswer),
                  },
                ],
                initialValue: 1,
              })(<RadioGroup initialValue={1}>
                <Radio value={1}>{commonLocale.yesLocale}</Radio>
                <Radio value={0}>{commonLocale.noLocale}</Radio>
              </RadioGroup>)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label={noticeLocale.createAttachment}
            >
              <Upload {...props} >
                <Button>
                  <Icon type="upload" />{noticeLocale.createUpload}
                </Button>
              </Upload>
              <div style={{ width: '100%' }}> {noticeLocale.createUploadDescribe}</div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={noticeLocale.createText}
            >
              {getFieldDecorator('content', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale(noticeLocale.createText),
                  }
                ],
              })(<div style={{ width: '680px' }}><Editor onEditerChange={this.onEditerChange} /></div>)}
            </FormItem>
          </Form>
        </Page>
        <ConfirmLeave {...comfirmLeaveProps} />
      </PageHeaderWrapper>
    );
  }
}
