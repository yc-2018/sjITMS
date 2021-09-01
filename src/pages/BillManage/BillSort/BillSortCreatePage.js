import React, { Component, Fragment } from 'react';
import { Form, Button, Input, message,Select,Modal } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import styles from './BillSort.less';
import BillSmallSortCreateForm from './BillSortCreateForm';
import { BillSort } from './BillSortLocal';
import { codePattern } from '@/utils/PatternContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import {ObjectType} from './BillSortLocal';
import SmallSortObjectCreateModal from './SmallSortObjectCreateModal';
import { convertCodeName } from '@/utils/utils';


const SelectOption =Select.Option;
const Options = ObjectType.map(item=>{
    return <SelectOption value={item.name}>{item.caption}</SelectOption>
})

const FormItem = Form.Item;

@connect(({ billSort, loading }) => ({
    billSort,
    loading: loading.models.billSort,
}))
@Form.create()
export default class BillSortCreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submitting: false,
            entity: this.props.selectedBigSort?this.props.selectedBigSort:{},
            operate: '',
            modalVisible: false, //确认删除提示框
            createModalVisible: false, //新增 小类
            objectModalVisble:false,//小类对象弹框

        }
    }
    componentDidMount = () => {
        // if(this.state.entity.uuid)
        // this.getBigSort();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedBigSort) {
            this.setState({
                entity: nextProps.selectedBigSort,
                createModalVisible: nextProps.createModalVisible
            })
        }else{
            this.setState({
                entity: {}
            })
        }
        if (nextProps.selectedBigSort == undefined && this.props.selectedBigSort != undefined) {
            this.props.form.resetFields();
        }
    }

    /**
     * 查询一条方案的信息
     */
    getBigSort = (uuid) => {
        const { dispatch, billSort, form } = this.props;
        form.resetFields();
        dispatch({
            type: 'billSort/queryByCodeOrName',
            payload: {
                codeOrName: uuid 
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
            type: 'billSort/remove',
            payload: {
                uuid: entity.uuid,
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
// 添加小类对象
    handleShowExcelImportPage = () => {
        if(!this.state.entity.uuid){
            message.warning("请先选择或者新建大类");
            return
        }
        this.setState({
            objectModalVisble: true,
        });
    }

    //小类对象保存
    saveSmallSortObject = (type,data) => {
         this.props.dispatch({
            type: type,
            payload: data,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.setState({
                        objectModalVisble: false,
                    });
                }
            },
        })
    }

    handleObjectModalVisible = ()=>{
        this.setState({
            objectModalVisble:false
        })
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

            let type = 'billSort/bigSort';
            if (entity.uuid) {
                type = 'billSort/modify';
                fieldsValue.uuid = entity.uuid
            }
            const values = {
                ...fieldsValue,
                companyUuid: loginCompany().uuid,
                version: entity.version
            };
            this.setState({
                submitting:true
            })
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
                    this.setState({
                        submitting:false
                    })
                },
            });
        });
    }

    render() {
        const { billSort: { data, bigEntity }, loading } = this.props;
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
            saveSmallSort: this.props.saveSmallSort,
            handleCreateModalVisible: this.handleCreateModalVisible,
        };
        const ObjectModalMethods = {
            saveSmallSortObject:this.saveSmallSortObject,
            handleCreateModalVisible:this.handleObjectModalVisible
        }
        return (
            <div>
                <div style={{ marginTop: '-30px' }} className={styles.navigatorPanelWrapper}>
                    <span className={styles.title}>{entity && entity.code ? '[' + entity.code + ']' + entity.name : '新建大类'}</span>
                </div>
                {(loginOrg().type === 'COMPANY' && this.state.entity.uuid) ? <div className={styles.rightContentButton}>
                    <Button style={{ marginLeft: '1%', float: 'right' }} type="primary"
                        onClick={() => this.handleCreateModalVisible(true)}>
                        {BillSort.addDetail}
                    </Button>
                    <Button style={{ float: 'right' }}
                        onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
                        {commonLocale.deleteLocale}
                    </Button>
                    <Button
                        style={{ marginRight: '1%', float: 'right' }} type="primary"
                        onClick={this.handleShowExcelImportPage.bind(this)}>
                        {BillSort.addObject}
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
                                        <Input placeholder={placeholderLocale(commonLocale.codeLocale)} maxLength={30}/>
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
                                        <Input placeholder={placeholderLocale(commonLocale.nameLocale)} maxLength={30} />
                                    ) : (<span>{entity.name ? entity.name : <Empty />}</span>)
                            }
                        </FormItem>
                        <FormItem {...formItemLayout} label={'对象类型'}>
                            {getFieldDecorator('type', {
                                rules: [{ required: true, message: notNullLocale('对象类型') }, ],
                                initialValue: entity ? entity.type : undefined,
                            })(<Select placeholder={placeholderLocale('对象类型')} >
                               {Options}
                            </Select>)}
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
                    <BillSmallSortCreateForm
                        {...createParentMethods}
                        createModalVisible={createModalVisible}
                        confirmLoading={false}
                        selectedBigSort={this.state.entity}
                    />
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={BillSort.bigSortTitle + ':' + '[' + entity.code + ']' + entity.name}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                    <SmallSortObjectCreateModal 
                    // smallSortUuid={this.state.smallSortUuid}
                    createModalVisible={this.state.objectModalVisble} 
                    selectedBigSort={this.state.entity}
                    {...ObjectModalMethods} />
                </div>
            </div>
        )
    }
}
