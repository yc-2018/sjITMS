import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { SerialArchLocale } from './SerialArchLocale';

const FormItem = Form.Item;
@Form.create()
class SerialArchLineCreateForm extends PureComponent {

    okHandle = () => {
        const {
            form,
            serialArchLine,
            handleSaveLine,
            handleCreateModalVisible,
            selectedSerialArch
        } = this.props;
        form.validateFields((errors, fieldsValue) => {
            if (errors) return;
            fieldsValue.serialArch = {
                uuid: selectedSerialArch.uuid,
                code: selectedSerialArch.code,
                name: selectedSerialArch.name
            }
            const data = {
                ...serialArchLine,
                ...fieldsValue,
            };

            handleSaveLine(data);
            handleCreateModalVisible();

        });
    };

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;

        handleCreateModalVisible();
        form.resetFields();
    };

    render() {
        const {
            form,
            createModalVisible,
            handleCreateModalVisible,
            confirmLoading,
            serialArchLine,
            selectedSerialArch
        } = this.props;
        let title = SerialArchLocale.serialArchLine;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        return (
            <Modal
                title={title}
                visible={createModalVisible}
                onOk={this.okHandle}
                confirmLoading={confirmLoading}
                onCancel={() => this.handleCancel()}
                destroyOnClose
            >
                <div>
                    <Form>
                        <FormItem {...formItemLayout} label={commonLocale.codeLocale}>
                            {form.getFieldDecorator('code', {
                                rules: [
                                    { required: true, message: notNullLocale(commonLocale.codeLocale) },
                                    {
                                        pattern: codePattern.pattern,
                                        message: codePattern.message
                                    },
                                ],
                                initialValue: serialArchLine ? serialArchLine.code : null,
                            })(<Input disabled={serialArchLine && serialArchLine.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label={commonLocale.nameLocale}>
                            {form.getFieldDecorator('name', {
                                rules: [
                                    { required: true, message: notNullLocale(commonLocale.nameLocale) },
                                    {
                                        max: 30,
                                        message: tooLongLocale(commonLocale.nameLocale, 30),
                                    },
                                ],
                                initialValue: serialArchLine ? serialArchLine.name : null,
                            })(<Input disabled={serialArchLine && serialArchLine.name ? true : false} placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label={SerialArchLocale.serialArchTitle}>
                            {
                                selectedSerialArch ? ('[' + selectedSerialArch.code + ']' + selectedSerialArch.name) : undefined
                            }
                        </FormItem>
                        <FormItem {...formItemLayout} label={commonLocale.noteLocale}>
                            {form.getFieldDecorator('note', {
                                rules: [
                                    {
                                        max: 255,
                                        message: tooLongLocale(commonLocale.noteLocale, 255),
                                    },
                                ],
                                initialValue: serialArchLine ? serialArchLine.note : null,
                            })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />)}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
};
export default SerialArchLineCreateForm;
