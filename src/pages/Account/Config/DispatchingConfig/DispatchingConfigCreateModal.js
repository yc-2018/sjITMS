import React, { PureComponent } from 'react';
import { Form, Modal, Select, Input } from 'antd';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { DispatchingConfigLocale } from './DispatchingConfigLocale';

const FormItem = Form.Item;

@Form.create()
export default class DispatchingConfigCreateModal extends PureComponent {
  okHandle = () => {
    const { form } = this.props;
    const { entity } = this.props;
    form.validateFields((errors, data) => {
      entity.isCommendEmp = data.isCommendEmp;
      entity.isCommendVeh = data.isCommendVeh;
      entity.isShowSum = data.isShowSum;
      entity.isStuckEmpType = data.isStuckEmpType;
      entity.isSumOrder = data.isSumOrder;
      const dispatchcenter = JSON.parse(data.dispatchcenteruuid);
      entity.dispatchCenterUuid = dispatchcenter.uuid;
      entity.dispatchCenterName = dispatchcenter.name;
      entity.dispatchCenterCode = dispatchcenter.code;
      entity.companyUuid = dispatchcenter.companyUuid;
      if (errors) return;

      this.props.handleSave();
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    form.resetFields();
    handleCreateModalVisible();
  };

  onDcChange = value => {
    const { entity } = this.props;
    if (!entity) return;
    entity.dc = JSON.parse(value);
  };

  onDispatcherChange = value => {
    const { entity } = this.props;
    if (!entity) return;
    entity.dispatcher = JSON.parse(value);
  };

  render() {
    const { form, modalVisible, loading, dispatchData } = this.props;

    const { getFieldDecorator } = form;

    const baseFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Modal
        title={commonLocale.addLocale}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form {...baseFormItemLayout}>
          <FormItem label={'调度中心'}>
            {getFieldDecorator('dispatchcenteruuid', {
              rules: [{ required: true, message: notNullLocale(DispatchingConfigLocale.dc) }],
            })(
              <Select>
                {dispatchData?.map(e => {
                  return (
                    <Select.Option value={JSON.stringify(e)} key={e.uuid}>
                      {'[' + e.code + ']' + e.name}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label={'合并订单'}>
            {getFieldDecorator('isSumOrder', {
              initialValue: 0,
            })(
              <Select>
                <Select.Option value={0}>{'否'}</Select.Option>
                <Select.Option value={1}>{'是'}</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={'推荐车辆'}>
            {getFieldDecorator('isCommendVeh', {
              initialValue: 0,
            })(
              <Select>
                <Select.Option value={0}>{'否'}</Select.Option>
                <Select.Option value={1}>{'是'}</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={'推荐人员'}>
            {getFieldDecorator('isCommendEmp', {
              initialValue: 0,
            })(
              <Select>
                <Select.Option value={0}>{'否'}</Select.Option>
                <Select.Option value={1}>{'是'}</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={'更换排车人员类型'}>
            {getFieldDecorator('isStuckEmpType', {
              initialValue: 0,
            })(
              <Select>
                <Select.Option value={0}>{'否'}</Select.Option>
                <Select.Option value={1}>{'是'}</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem label={'订单池合计'}>
            {getFieldDecorator('isShowSum', {
              initialValue: 0,
            })(
              <Select>
                <Select.Option value={0}>{'否'}</Select.Option>
                <Select.Option value={1}>{'是'}</Select.Option>
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
