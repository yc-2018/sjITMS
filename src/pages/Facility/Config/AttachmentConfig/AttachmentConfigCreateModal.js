import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message, Checkbox } from 'antd';
import moment from 'moment';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { attachmentConfigLocale } from './AttachmentConfigLocale';
import { codePattern } from '@/utils/PatternContants';

const FormItem = Form.Item;

@Form.create()
export default class AttachmentConfigCreateModal extends PureComponent {
    okHandle = () => {
        const { form } = this.props;

        form.validateFields((errors, fieldsValue) => {
            if (errors) return;

            this.props.handleSaveOrModify(fieldsValue);
        });
    };

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;
        form.resetFields();
        handleCreateModalVisible();
    };

    checkedChange = (e) => {
        const { entity } = this.props;
        if (!entity)
            return;
        if (e.target.id === 'review') {
            entity.review = e.target.checked;
        } else if (e.target.id === 'ship'){
            entity.ship = e.target.checked;
        } else if (e.target.id === 'returned'){
            entity.returned = e.target.checked;
        }
    }

    render() {
        const {
            form,
            modalVisible,
            entity,
            loading,
        } = this.props;

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

        const checkFormItemLayout = {
            labelCol: {
                xs: { span: 2 },
                sm: { span: 2 },
            },
            wrapperCol: {
                xs: { span: 2 },
                sm: { span: 2 },
            },
        };

        let title = entity.uuid ? commonLocale.editLocale : commonLocale.addLocale;

        return (
            <Modal
                title={title}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form {...baseFormItemLayout}>
                    <FormItem
                        key='code'
                        label={commonLocale.codeLocale}>
                        {getFieldDecorator('code', {
                            initialValue: entity ? entity.code : '',
                            rules: [
                                { required: true, message: notNullLocale(commonLocale.codeLocale) },
                                {
                                    pattern: codePattern.pattern,
                                    message: codePattern.message,
                                },
                            ]
                        })(
                            <Input autoFocus disabled={entity.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />
                        )}
                    </FormItem>
                    <FormItem
                        key='name'
                        label={commonLocale.nameLocale}>
                        {getFieldDecorator('name', {
                            initialValue: entity ? entity.name : '',
                            rules: [
                                { required: true, message: notNullLocale(commonLocale.nameLocale) },
                                {
                                    max: 30,
                                    message: tooLongLocale(commonLocale.nameLocale, 30)
                                },
                            ]
                        })(
                            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
                        )}
                    </FormItem>
                    <FormItem label={attachmentConfigLocale.reviewAndShipAndReturn}>
                        <FormItem style={{ display: 'inline-block', width: 'calc(30% - 50px)' }}
                            key='review'>
                            {getFieldDecorator('review', {
                                initialValue: entity ? entity.review : false,
                            })(
                                <Checkbox id='review' checked={entity.review} onChange={this.checkedChange} />
                            )}
                        </FormItem>
                        <FormItem style={{ display: 'inline-block', width: 'calc(30% - 50px)' }} key='ship'>
                            {getFieldDecorator('ship', {
                                initialValue: entity ? entity.ship : false,
                            })(
                                <Checkbox id='ship' checked={entity.ship} onChange={this.checkedChange} />
                            )}
                        </FormItem>
                        <FormItem style={{ display: 'inline-block', width: 'calc(30% - 50px)' }} key='returned'>
                            {getFieldDecorator('returned', {
                                initialValue: entity ? entity.returned : false,
                            })(
                                <Checkbox id='returned' checked={entity.returned} onChange={this.checkedChange} />
                            )}
                        </FormItem>
                    </FormItem>
                    <FormItem
                        key='note'
                        label={commonLocale.noteLocale}>
                        {getFieldDecorator('note', {
                            initialValue: entity ? entity.note : '',
                            rules: [
                                {
                                    max: 255,
                                    message: tooLongLocale(commonLocale.noteLocale, 255)
                                },
                            ]
                        })(
                            <Input.TextArea rows={4} placeholder={placeholderLocale(commonLocale.noteLocale)} />
                        )}
                    </FormItem>

                </Form>
            </Modal>
        );
    }
};
