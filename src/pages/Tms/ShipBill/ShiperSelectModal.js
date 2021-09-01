import { Form, Modal, Button, message } from 'antd';
import { connect } from 'dva';
import { PureComponent } from "react";
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { shipBillLocale } from './ShipBillLocale';

const FormItem = Form.Item;

@Form.create()
export default class ShiperSelectModal extends PureComponent {
    state = {
        shiper: null
    }


    handleOk() {
        if (!this.state.shiper) {
            message.warning('请先选择要刷新的装车员');
            return;
        }

        let shiper = JSON.parse(this.state.shiper)
        this.setState({
            shiper: null
        });
        this.props.handleOk(shiper);
    }

    onChange = (selectValue) => {
        this.setState({
            shiper: selectValue
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const baseFormItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 },
        };

        return (
            <Modal
                title={"选择装车员"}
                visible={this.props.visible}
                destroyOnClose={true}
                onOk={() => this.handleOk()}
                onCancel={() => this.props.handleCancel()}
                okText={commonLocale.confirmLocale}
                cancelText={commonLocale.cancelLocale}
            >
                <Form>
                    <FormItem
                        {...baseFormItemLayout}
                        label={"装车员"}>
                        {getFieldDecorator('shiper')(
                            <UserSelect
                                single={true}
                                onChange={this.onChange}
                                placeholder={placeholderChooseLocale(shipBillLocale.stevedore)}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }

}