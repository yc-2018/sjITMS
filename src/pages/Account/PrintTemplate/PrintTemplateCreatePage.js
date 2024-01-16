import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, message, Icon, Radio, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import configs from '@/utils/config';
import { printTemplateLocale } from './PrintTemplateLocale';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale,
} from '@/utils/CommonLocale';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import { PrintTemplateType } from './PrintTemplateContants';
import { loginOrg } from '@/utils/LoginContext';
import { PRINT_RES } from './PrintTemplatePermission';
import { havePermission } from '@/utils/authority';
import { orgType } from '@/utils/OrgType';

const FormItem = Form.Item;
const Option = Select.Option;

const orgTypeOptions = [];
Object.keys(orgType).forEach(function(key) {
  if (orgType.sjwl.name !== orgType[key].name)
    orgTypeOptions.push(
      <Option value={orgType[key].name} key={orgType[key].name}>
        {orgType[key].caption}
      </Option>
    );
});
@connect(({ template, loading }) => ({
  template,
  loading: loading.models.template,
}))
@Form.create()
class PrintTemplateCreatePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      currentTemplateUuid: '',
      operate: '',
      path: '',
      modalVisible: false, //确认删除提示框
    };
  }

  componentDidUpdate() {
    if (
      document.getElementById('name') != null &&
      (document.activeElement.tagName == 'BODY' || document.activeElement.id == 'name')
    ) {
      document.getElementById('name').focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPrintTemplate && nextProps.selectedPrintTemplate.length == 0) {
      this.setState({
        entity: {},
      });
    }
    if (
      nextProps.selectedPrintTemplate &&
      nextProps.selectedPrintTemplate != this.props.selectedPrintTemplate
    ) {
      this.props.form.resetFields();
      if (nextProps.selectedPrintTemplate[0] && nextProps.selectedPrintTemplate.length == 1) {
        this.get(
          nextProps.selectedPrintTemplate[0] ? nextProps.selectedPrintTemplate[0].uuid : undefined
        );
      } else {
        this.get(
          nextProps.currentTemplateUuid != ''
            ? nextProps.currentTemplateUuid
            : nextProps.selectedPrintTemplate[0]
              ? nextProps.selectedPrintTemplate[0].uuid
              : undefined
        );
      }
    }
    if (nextProps.selectedPrintTemplate == undefined) {
      this.setState({
        entity: {},
      });
    }
    if (nextProps.template.entity && nextProps.template.entity != this.props.template.entity) {
      this.setState({
        entity: nextProps.template.entity,
      });
    }
    if (nextProps.currentTemplateUuid != this.props.currentTemplateUuid) {
      this.setState({
        currentTemplateUuid: nextProps.currentTemplateUuid,
      });
    }
  }

  /**
   * 查询当前模板信息
   */
  get = uuid => {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'template/get',
      payload: {
        uuid: uuid,
      },
    });
  };
  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = operate => {
    if (operate) {
      this.setState({
        operate: operate,
      });
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate, entity } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.props.handleRemove(entity);
    }
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  /**
   * 保存
   */
  handleSave = e => {
    e.preventDefault();
    const { form, selectedType } = this.props;
    const { entity } = this.state;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      let data = {};

      if (entity.uuid) {
        data = {
          uuid: entity.uuid,
          name: fieldsValue.name,
          def: fieldsValue.def,
          type: entity.type,
          orgUuid: loginOrg().uuid,
          path: fieldsValue.path,
          note: fieldsValue.note,
          orgTypes: fieldsValue.orgTypes,
          version: entity.version,
        };
      } else {
        data = {
          ...fieldsValue,
          type: selectedType.name,
          orgUuid: loginOrg().uuid,
        };
      }
      this.props.handleSave(data);
    });
  };

  render() {
    const { form, selectedPrintTemplate, selectedType } = this.props;
    const { entity, attachments } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 7 },
    };

    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>
            {selectedPrintTemplate && selectedPrintTemplate.length != 0 && entity
              ? entity.name
              : printTemplateLocale.temp}
          </span>
        </div>
        {selectedPrintTemplate &&
        selectedPrintTemplate.length != 0 &&
        entity.orgUuid === loginOrg().uuid ? (
          <div className={styles.rightContentButton}>
            <Button
              style={{ float: 'right' }}
              disabled={!havePermission(PRINT_RES.REMOVE)}
              onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
            >
              {commonLocale.deleteLocale}
            </Button>
          </div>
        ) : null}
        <div className={styles.content}>
          <Form onSubmit={this.handleSave} {...formItemLayout}>
            <FormItem label={printTemplateLocale.tempName}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(printTemplateLocale.tempName) },
                  {
                    max: 30,
                    message: tooLongLocale(printTemplateLocale.tempName, 30),
                  },
                ],
                initialValue: entity ? entity.name : null,
              })(<Input placeholder={placeholderLocale(printTemplateLocale.tempName)} />)}
            </FormItem>
            <FormItem label={printTemplateLocale.tempType}>
              {form.getFieldDecorator('type')(
                <span>
                  {entity
                    ? entity.type
                      ? PrintTemplateType[entity.type].caption
                      : selectedType.caption
                    : selectedType.caption}
                </span>
              )}
            </FormItem>
            <FormItem label={printTemplateLocale.tempPath}>
              {form.getFieldDecorator('path', {
                rules: [
                  { required: true, message: notNullLocale(printTemplateLocale.tempPath) },
                  {
                    max: 100,
                    message: tooLongLocale(printTemplateLocale.tempPath, 100),
                  },
                ],
                initialValue: entity ? entity.path : null,
              })(<Input placeholder={placeholderLocale(printTemplateLocale.tempPath)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={printTemplateLocale.orgTypes}>
              {form.getFieldDecorator('orgTypes', {
                rules: [{ required: true, message: notNullLocale(printTemplateLocale.orgTypes) }],
                initialValue: entity.orgTypes ? entity.orgTypes : [],
              })(
                <Select
                  mode={'multiple'}
                  style={{ width: '100%' }}
                  placeholder={placeholderChooseLocale(printTemplateLocale.orgTypes)}
                >
                  {orgTypeOptions}
                </Select>
              )}
            </FormItem>
            <FormItem label={'是否设为默认'}>
              {form.getFieldDecorator('def', {
                initialValue: entity ? entity.def : null,
              })(
                <Radio.Group>
                  <Radio value={true}>{'是'}</Radio>
                  <Radio value={false}>{'否'}</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem label={commonLocale.noteLocale}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 255,
                    message: tooLongLocale(commonLocale.noteLocale, 255),
                  },
                ],
                initialValue: entity ? entity.note : null,
              })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />)}
            </FormItem>
            <FormItem
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span: 16, offset: 11 },
              }}
            >
              {(entity.orgUuid === loginOrg().uuid || !entity.uuid) && (
                <Button
                  style={{ marginLeft: '-60px' }}
                  loading={this.state.submitting}
                  type="primary"
                  htmlType="submit"
                  disabled={!havePermission(PRINT_RES.CREATE)}
                >
                  {commonLocale.saveLocale}
                </Button>
              )}
            </FormItem>
          </Form>
        </div>
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={
            '打印模板' + ':' + entity != undefined ? (entity.name ? entity.name : null) : null
          }
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </div>
    );
  }
}
export default PrintTemplateCreatePage;
