import { PureComponent } from 'react';
import { Modal, Form, Col, Input, message } from 'antd'
import { connect } from 'dva';
import { SerialArchLocale } from './SerialArchLocale';
import { commonLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
@Form.create()
export default class SerialArchLineCreateModal extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale,
            archEntity: {},
            lineEntity: {},
            visible: false,
            createLine: true,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.archEntity && nextProps.archEntity.uuid) {
            this.setState({
                archEntity: nextProps.archEntity,
                lineEntity: nextProps.lineEntity,
                visible: nextProps.visible,
                createLine: nextProps.createLine,
            });
        }
    }

    handleOk = (e) => {
        e.preventDefault();

        const { form } = this.props;
        form.validateFields((errors, fieldsValue) => {
            if (errors) return;
            const data = {
                ...this.state.lineEntity,
                ...fieldsValue,
            };
            data.serialArch = {};
            data.serialArch.uuid = this.state.archEntity.uuid;
            data.serialArch.code = this.state.archEntity.code;
            data.serialArch.name = this.state.archEntity.name;
            let type = 'serialArch/addLine';
            if (data.uuid) {
                type = 'serialArch/modifyLine';
            }
            this.props.saveLine(type, { ...data, companyUuid: loginCompany().uuid })
            // this.props.dispatch({
            //     type: type,
            //     payload: {
            //         ...data,
            //         companyUuid: loginCompany().uuid
            //     },
            //     callback: response => {
            //         if (response && response.success) {
            //             message.success(SerialArchLocale.saveLineSuccess);
            //             this.props.form.resetFields();
            //             this.props.dispatch({
            //                 type: 'serialArch/getLinesByArchCode',
            //                 payload: this.state.archEntity
            //             });
            //         } else {
            //             message.error(response.message);
            //         }
            //     }
            // })
        });
    }

    onClick = () => {
        this.props.form.resetFields();
        this.setState({
            visible: !this.state.visible
        })
        this.props.hideModal();
    }

    render() {

        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 },
            colon: false
        };
        const entity = this.state.createLine ? {} : this.state.lineEntity;
        return <Modal
            title={SerialArchLocale.serialArchLine}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.onClick}
        >
            <Form>
                <Col>
                    <Form.Item label={commonLocale.codeLocale + "："} {...formItemLayout}>
                        {
                            getFieldDecorator('code', {
                                initialValue: entity && entity.code ? entity.code : '',
                                rules: [
                                    {
                                        required: true
                                    }, {
                                        pattern: codePattern.pattern,
                                        message: codePattern.message
                                    }]
                            })(
                                <Input disabled={entity.code ? true : false} />
                            )
                        }</Form.Item>
                </Col>
                <Col>
                    <Form.Item label={commonLocale.nameLocale + "："} {...formItemLayout}>
                        {
                            getFieldDecorator('name', {
                                initialValue: entity && entity.name ? entity.name : '',
                                rules: [
                                    {
                                        required: true
                                    }, {
                                        max: 30,
                                        message: '最大长度为30'
                                    }]
                            })(
                                <Input />
                            )
                        }</Form.Item>
                </Col>
                <Col>
                    <Form.Item label={SerialArchLocale.serialArchTitle + "："} {...formItemLayout}>
                        <span>{this.state.archEntity ? convertCodeName(this.state.archEntity) : ''}</span>
                    </Form.Item>
                </Col>
            </Form>
        </Modal>
    }
}
