import React, { Component, Fragment } from 'react';
import { Form, Button, Input, message } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import styles from './SerialArch.less';
import SerialArchLineCreateForm from './SerialArchLineCreateForm';
import { SerialArchLocale } from './SerialArchLocale';
import { codePattern } from '@/utils/PatternContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';

const FormItem = Form.Item;

@connect(({ serialArch, loading }) => ({
    serialArch,
    loading: loading.models.serialArch,
}))
@Form.create()
export default class SerialArchCreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submitting: false,
            entity: {},
            operate: '',
            modalVisible: false, //确认删除提示框
            createModalVisible: false, //新增 编辑顺序的modal
        }
    }
    componentDidMount = () => {
        this.getSerialArch();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedSerialArch) {
            this.setState({
                entity: nextProps.selectedSerialArch,
                createModalVisible: nextProps.createModalVisible
            })
        }
        if (this.props.serialArch != nextProps.selectedSerialArch && nextProps.selectedSerialArch) {
            if (this.props.serialArch && this.props.serialArch.archEntity &&
                nextProps.selectedSerialArch && nextProps.selectedSerialArch.uuid
                && this.props.serialArch.archEntity.uuid !== nextProps.selectedSerialArch.uuid)
                this.getSerialArch(nextProps.selectedSerialArch.uuid);
        }
        if (nextProps.selectedSerialArch == undefined) {
            this.setState({
                entity: {}
            })
        }
        if (nextProps.selectedSerialArch == undefined && this.props.selectedSerialArch != undefined) {
            this.props.form.resetFields();
        }
    }

    /**
     * 查询一条方案的信息
     */
    getSerialArch = (uuid) => {
        const { dispatch, serialArch, form } = this.props;
        form.resetFields();
        dispatch({
            type: 'serialArch/getSerialArch',
            payload: {
                archUuid: uuid ? uuid : (serialArch ? serialArch.uuid : null)
            },
        });
    }

    /**
     * 新增拣货顺序的弹窗显示控制
     */
    handleCreateModalVisible = (flag) => {
        if (!this.state.entity || !this.state.entity.uuid) {
            message.warning(SerialArchLocale.pleaseSelectOrCreateSerialArch);
            return;
        }
        this.setState({
            createModalVisible: !!flag,
        });
    };

    /**
    * 模态框显示/隐藏
    */
    handleModalVisible = (operate) => {
        if (operate === commonLocale.deleteLocale) {
            const { entity } = this.state;
            if (!entity || !entity.uuid) {
                message.warning("请先选择要删除的数据");
                return;
            }
        }
        if (operate) {
            this.setState({
                operate: operate
            })
        }
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }
    /**
    * 模态框确认操作
    */
    handleOk = () => {
        const { operate, entity } = this.state;
        if (operate === commonLocale.deleteLocale) {
            this.handleRemove(entity);
        }
    }

    /**
     * 删除
     */
    handleRemove = (entity) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'serialArch/removeArch',
            payload: {
                archUuid: entity.uuid,
                version: entity.version
            },
            callback: response => {
                if (response && response.success) {
                    message.success(formatMessage({ id: 'common.message.success.delete' }));
                    this.props.reFreshSider();
                }
            },
        });
        this.setState({
            modalVisible: !this.state.modalVisible
        })
    }

    handleShowExcelImportPage = () => {
        this.props.dispatch({
            type: 'serialArch/showPage',
            payload: {
                showPage: 'import',
            }
        });
    }



    /**
     * 保存
     */
    handleSubmit = (e) => {
        e.preventDefault();
        const { form, dispatch } = this.props;
        const { entity } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            let type = 'serialArch/save';
            if (entity.uuid) {
                type = 'serialArch/modifySerialArch';
                fieldsValue.uuid = entity.uuid
            }
            const values = {
                ...fieldsValue,
                companyUuid: loginCompany().uuid,
                version: entity.version
            };
            dispatch({
                type: type,
                payload: { ...values },
                callback: (response) => {
                    if (response && response.success) {
                        message.success(formatMessage({ id: 'common.message.success.operate' }));
                        form.resetFields();
                        this.props.reFreshSider();
                        // TODO:留在当前新增的界面
                    }
                },
            });
        });
    }

    render() {
        const { serialArch: { data, archEntity }, loading } = this.props;
        const { entity, createModalVisible } = this.state

        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
        };

        const createParentMethods = {
            handleSaveLine: this.props.handleSaveLine,
            handleCreateModalVisible: this.handleCreateModalVisible,
        };
        return (
            <div>
                <div style={{ marginTop: '0px' }} className={styles.navigatorPanelWrapper}>
                    <span className={styles.title}>{entity && entity.code ? '[' + entity.code + ']' + entity.name : '新建体系'}</span>
                </div>
                {(loginOrg().type === 'COMPANY' && archEntity) ? <div className={styles.rightContentButton}>
                    <Button style={{ marginLeft: '1%', float: 'right' }} type="primary"
                        onClick={() => this.handleCreateModalVisible(true)}>
                        {SerialArchLocale.addSerialArchLine}
                    </Button>
                    <Button style={{ float: 'right' }}
                        onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
                        {commonLocale.deleteLocale}
                    </Button>
                    <Button
                        style={{ marginRight: '1%', float: 'right' }}
                        onClick={() => this.handleShowExcelImportPage()}>
                        {commonLocale.importStore}
                    </Button>
                </div> : null}
                <div className={styles.content}>
                    <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label={commonLocale.codeLocale}
                        >
                            {
                                loginOrg().type === 'COMPANY' ?
                                    getFieldDecorator('code', {
                                        rules: [
                                            { required: true, message: notNullLocale(commonLocale.codeLocale) },
                                            {
                                                pattern: codePattern.pattern,
                                                message: codePattern.message
                                            },],
                                        initialValue: entity.code,
                                    })(
                                        <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
                                    ) : (<span>{entity.code ? entity.code : <Empty />}</span>)
                            }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={commonLocale.nameLocale}
                        >
                            {
                                loginOrg().type === 'COMPANY' ?
                                    getFieldDecorator('name', {
                                        rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
                                            max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
                                        }],
                                        initialValue: entity.name,
                                    })(
                                        <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
                                    ) : (<span>{entity.name ? entity.name : <Empty />}</span>)
                            }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={commonLocale.noteLocale}
                        >
                            {
                                loginOrg().type === 'COMPANY' ?
                                    getFieldDecorator('note', {
                                        rules: [{
                                            max: 255, message: tooLongLocale(commonLocale.noteLocale, 255),
                                        }],
                                        initialValue: entity.note,
                                    })(
                                        <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />
                                    ) : (<span>{entity.note ? entity.note : <Empty />}</span>)
                            }
                        </FormItem>
                        {loginOrg().type === 'COMPANY' &&
                            <FormItem
                                wrapperCol={{
                                    xs: { span: 24, offset: 0 },
                                    sm: { span: 16, offset: 11 },
                                }}
                            >
                                <Button style={{ marginLeft: '-24px' }} loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
                            </FormItem>
                        }

                    </Form>
                </div>
                <div>
                    <SerialArchLineCreateForm
                        {...createParentMethods}
                        createModalVisible={createModalVisible}
                        confirmLoading={false}
                        selectedSerialArch={archEntity}
                    />
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={SerialArchLocale.serialArchTitle + ':' + '[' + entity.code + ']' + entity.name}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                </div>
            </div>
        )
    }
}
