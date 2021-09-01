import React, { PureComponent } from 'react';
import { Form, Input, Modal ,Select} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { BillSort } from './BillSortLocal';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
const FormItem = Form.Item;
@Form.create()
class BillSmallSortCreateForm extends PureComponent {

    okHandle = () => {
        const {
            form,
            selectedBigSort,
            saveSmallSort,
            handleCreateModalVisible,
            selectedBigsort,
            smallEntity
        } = this.props;
        const type = smallEntity&&smallEntity.uuid?'billSort/smallSortmodify':'billSort/smallSort'
        form.validateFields((errors, fieldsValue) => {
            if (errors) return;
            let data = {
                bigSortUuid:selectedBigSort.uuid,
                companyUuid: loginCompany().uuid,
                ...fieldsValue,
            };
            if(smallEntity&&smallEntity.uuid){
                data.uuid = smallEntity.uuid
            }

            saveSmallSort(type,data);
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
            selectedBigSort,
            smallEntity
        } = this.props;
        let title = BillSort.addDetail;
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
                                initialValue: smallEntity ? smallEntity.code : null,
                            })(<Input maxLength={30} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
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
                                initialValue: smallEntity ? smallEntity.name : undefined,
                            })(<Input maxLength={30} placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label={'大类'}>
                            {form.getFieldDecorator('bigSort', {
                                rules: [
                                ],
                                initialValue: selectedBigSort ? selectedBigSort.uuid : undefined,
                            })(<span>{convertCodeName(selectedBigSort)}</span>)}
                        </FormItem>
                        {/* <FormItem {...formItemLayout} label={commonLocale.noteLocale}>
                            {form.getFieldDecorator('note', {
                                rules: [
                                    {
                                        max: 255,
                                        message: tooLongLocale(commonLocale.noteLocale, 255),
                                    },
                                ],
                                initialValue: smallEntity ? smallEntity.note : null,
                            })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />)}
                        </FormItem> */}
                    </Form>
                </div>
            </Modal>
        );
    }
};
export default BillSmallSortCreateForm;
