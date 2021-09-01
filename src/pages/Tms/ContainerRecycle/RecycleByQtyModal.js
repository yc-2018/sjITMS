import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, InputNumber } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { containerRecycleLocale } from './ContainerRecycleLocale';
import { ContainerRecycleType } from './ContainerRecycleContants';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany } from '@/utils/LoginContext';
import CFormItem from '@/pages/Component/Form/CFormItem';

const FormItem = Form.Item;
@Form.create()
export default class RecycleByQtyModal extends PureComponent {
    state = {
        containerTypeUuid: ''
    }

    handleCancel = () => {
        const { form, handleAuditModalVisible } = this.props;
        this.props.form.resetFields();
        this.setState({
            containerTypeUuid: ''
        })
        handleAuditModalVisible();
    };

    handleAlter = (e) => {
        e.preventDefault();
        const { form, handleSave, } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = { ...fieldsValue };
            this.setState({
                containerTypeUuid: ''
            })
            handleSave(values);
        });
    }

    handleChangeType = (e) => {
        if (!e)
            return;
        this.setState({
            containerTypeUuid: JSON.parse(e).uuid
        })
    }

    render() {
        const baseFormItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
            colon: false,
        };
        const { visible, confirmLoading, ModalTitle, store, items } = this.props;
        const { getFieldDecorator } = this.props.form;

        const containerTypes = [];
        const typeUuids = [];
        const containerTypeMap = [];
        Array.isArray(items) && items.forEach(function (item) {
            if (ContainerRecycleType.ByQty.name === ContainerRecycleType[item.type].name) {
                if (item.containerType && item.containerType.uuid
                    && typeUuids.indexOf(item.containerType.uuid) === -1) {
                    containerTypes.push(item.containerType);
                    typeUuids.push(item.containerType.uuid);
                    containerTypeMap[item.containerType.uuid] = 0;
                }
                containerTypeMap[item.containerType.uuid] = containerTypeMap[item.containerType.uuid] + 1;
            }
        })

        const typeOptions = [];
        Array.isArray(containerTypes) && containerTypes.forEach(function (type) {
            typeOptions.push(
                <Option key={type.uuid} value={JSON.stringify({
                    uuid: type.uuid,
                    code: type.code,
                    name: type.name
                })}>{convertCodeName(type)}</Option>
            )
        })

        return (
            <Modal
                title={ModalTitle}
                visible={visible}
                onOk={this.handleAlter}
                onCancel={this.handleCancel}
                confirmLoading={confirmLoading}
                destroyOnClose={true}>
                <Form {...baseFormItemLayout}>
                    <FormItem key='store' label={commonLocale.inStoreLocale}>
                        {getFieldDecorator('store')(<span>{convertCodeName(store)}</span>)}
                    </FormItem>
                    <FormItem key='containerType' label={containerRecycleLocale.containerType}>
                        {
                            getFieldDecorator('containerType', {
                                initialValue: undefined,
                                rules: [{
                                    required: true, message: notNullLocale(containerRecycleLocale.containerType)
                                }],
                            })(
                                <Select
                                    onChange={e => this.handleChangeType(e)}
                                    placeholder={placeholderChooseLocale(containerRecycleLocale.containerType)}
                                >{typeOptions}</Select>
                            )
                        }
                    </FormItem>
                    <FormItem label={containerRecycleLocale.unRecycleQty} key='unRecycleQty'>
                        {getFieldDecorator('unRecycleQty')
                            (<span>{containerTypeMap[this.state.containerTypeUuid]}</span>)}
                    </FormItem>
                    <FormItem key='qty' label={containerRecycleLocale.qty}>
                        {getFieldDecorator('qty'
                            , {
                                rules: [{
                                    required: true, message: notNullLocale(containerRecycleLocale.qty)
                                }]
                            })(
                                <InputNumber
                                    precision={0}
                                    min={1}
                                    max={containerTypeMap[this.state.containerTypeUuid]}
                                    style={{ width: '100%' }}
                                    placeholder={placeholderLocale(containerRecycleLocale.qty)}
                                />
                            )}
                    </FormItem>
                </Form >
            </Modal>
        );
    }
}
