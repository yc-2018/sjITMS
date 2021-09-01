import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message, Checkbox } from 'antd';
import moment from 'moment';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { wholeContainerTypeConfigLocale } from './WholeContainerTypeConfigLocale';
import { codePattern } from '@/utils/PatternContants';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';

const FormItem = Form.Item;

@Form.create()
export default class WholeContainerTypeConfigCreateModal extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            containerTypes: []
        };
    }

    okHandle = () => {
        const { form } = this.props;

        form.validateFields((errors, fieldsValue) => {
            if (errors) return;

            this.props.handleSaveOrModify(this.state.containerTypes);
        });
    };

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;
        form.resetFields();
        handleCreateModalVisible();
    };

    containerTypeChange = (value) => {
        if (!value)
            return;

        let containerTypeUcns = [];
        value.forEach(function (item) {
            containerTypeUcns.push(JSON.parse(item));
        });

        this.setState({
            containerTypes: containerTypeUcns
        });
    }

    render() {
        const {
            form,
            modalVisible,
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

        return (
            <Modal
                title={commonLocale.addLocale}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form>
                    <FormItem
                        {...baseFormItemLayout}
                        label={wholeContainerTypeConfigLocale.containerType}>
                        {getFieldDecorator('containerType', {
                        })(
                            <ContainerTypeSelect
                                autoFocus
                                onChange={this.containerTypeChange}
                                mode="multiple"
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
};
