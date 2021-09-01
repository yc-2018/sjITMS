import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { containerState } from '@/utils/ContainerState';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
const FormItem = Form.Item;
@Form.create()
export default class TargetBinModal extends PureComponent {
    handleCancel = () => {
        const { form, handleBinModalVisible } = this.props;
        this.props.form.resetFields();
        const value = [];
        handleBinModalVisible(value);
    };

    handleAlter = (e) => {
        e.preventDefault();
        const { form, handleRefreshBin } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = {
                ...fieldsValue,
            };

            handleRefreshBin(values);
        });
    }

    render() {
        const baseFormItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        const { visible, ModalTitle } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                onOk={this.handleAlter}
                visible={visible}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <Form>
                        <FormItem {...baseFormItemLayout} label='目标货位'>
                            {
                                getFieldDecorator('bin', {
                                    rules: [{
                                        required: true,
                                        message: '货位不能为空',
                                    }],
                                    initialValue: undefined,

                                })(
                                    <BinSelect
                                        // value={undefined}
                                        states={[binState.FREE.name, binState.USING.name]}
                                        usages={[binUsage.VendorRtnBin.name, binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name]}
                                        getUsage
                                        placeholder={placeholderChooseLocale(commonLocale.bincodeLocale)}
                                    />
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}
