import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, Col } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import WrhSelect from '../../Component/Select/WrhSelect';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { connect } from 'dva';

const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ bin, loading }) => ({
  bin,
  loading: loading.models.bin,
}))
@Form.create()
export default class ZoneCreateModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      entity: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.record && this.props.record.uuid) {
      if (nextProps.bin.zoneEntity
        && nextProps.bin.zoneEntity.uuid === this.props.record.uuid) {
        this.setState({
          entity: nextProps.bin.zoneEntity,
        });
      } else {
        this.setState({
          entity: {}
        });
      }
    }

  }


  handleCancel = () => {
    const { form, handleCreateZoneModalVisible } = this.props;
    this.props.form.resetFields();
    this.setState({
      entity: {}
    })
    handleCreateZoneModalVisible();
  };

  handleAddZone = (e) => {
    e.preventDefault();
    const { form, record, handleSave, upperCode, } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...record,
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      };

      if (!record.uuid)
        values['wrh'] = JSON.parse(values.wrh);

      this.setState({
        entity: {}
      })

      handleSave(values);
    });
  }

  drawFormItems = () => {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    let formItems = [];
    let uuid = this.props.record.uuid;
    if (uuid) {
      formItems.push(
        <FormItem {...baseFormItemLayout} label={commonLocale.codeLocale} key={commonLocale.codeLocale}>
          {getFieldDecorator('code', { initialValue: entity.code })(
            <Col>{entity.code}</Col>
          )}
        </FormItem>
      )
    } else {
      formItems.push(
        <FormItem {...baseFormItemLayout} label={commonLocale.codeLocale} key={commonLocale.codeLocale}>
          {
            getFieldDecorator('code', {
              rules: [{
                required: true, message: notNullLocale(commonLocale.codeLocale)
              }, {
                pattern: /^[0-9]{2}$/,
                message: formatMessage({id: 'bin.validate.zone.code' })
              }]
            })(
              <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
            )}
        </FormItem>)
    }

    formItems.push(
      <FormItem {...baseFormItemLayout} label={commonLocale.nameLocale} key={commonLocale.nameLocale}>
        {
          getFieldDecorator('name', {
            rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) },
              {
                max: 30,
                message: tooLongLocale(commonLocale.nameLocale, 30),
              }],
            initialValue: uuid ? entity.name : undefined
          })(
            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
          )}
      </FormItem>)

    if (uuid) {
      formItems.push(<FormItem {...baseFormItemLayout} label={commonLocale.inWrhLocale} key={commonLocale.inWrhLocale}>
        {getFieldDecorator('wrh', {
          initialValue: entity.wrh
        })(
          <Col>{convertCodeName(entity.wrh)}</Col>
        )}
      </FormItem>)
    } else {
      formItems.push(<FormItem {...baseFormItemLayout} label={commonLocale.inWrhLocale} key={commonLocale.inWrhLocale}>
        {
          getFieldDecorator('wrh', {
            rules: [{ required: true, message: notNullLocale(commonLocale.inWrhLocale) }],
          })(
            <WrhSelect onChange={this.onChange}
                       placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
          )}
      </FormItem>)
    }

    formItems.push(<FormItem {...baseFormItemLayout} label={commonLocale.noteLocale} key={commonLocale.noteLocale}>
      {getFieldDecorator('note', {
        rules: [{
          max: 255, message: tooLongLocale(commonLocale.noteLocale, 255),
        }],
        initialValue: entity.note
      })(
        <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />
      )}
    </FormItem>)

    return formItems;
  }

  render() {
    const { createZoneModalVisible, confirmLoading, record, ModalTitle } = this.props;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAddZone}
        visible={createZoneModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '350px', overflow: 'auto' }}>
          <Form>
            {this.drawFormItems()}
          </Form>
        </div>
      </Modal>
    );
  }
}
