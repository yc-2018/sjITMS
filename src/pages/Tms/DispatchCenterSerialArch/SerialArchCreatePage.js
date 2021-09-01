import React, { Component, Fragment } from 'react';
import { Form, Button, Input, message, Switch, Col } from 'antd';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { formatMessage } from 'umi/locale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import SerialArchLineCreateForm from './SerialArchLineCreateForm';
import { SerialArchLocale } from './SerialArchLocale';
import { codePattern } from '@/utils/PatternContants';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { State, getStatusCaption } from './SerialArchContants';
import Empty from '@/pages/Component/Form/Empty';

const FormItem = Form.Item;

@connect(({ dispatchSerialArch, user, loading }) => ({
    dispatchSerialArch,
    user,
    loading: loading.models.dispatchSerialArch,
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
      // if (nextProps.selectedSerialArch) {
      //   this.setState({
      //     entity: nextProps.selectedSerialArch,
      //     createModalVisible: nextProps.createModalVisible
      //   })
      // }
        const { form } = this.props;
        if (nextProps.selectedSerialArch !== this.props.selectedSerialArch && nextProps.selectedSerialArch) {
          form.resetFields();
          this.setState({
            originalOrgs: nextProps.originalOrgs,
            entity: nextProps.selectedSerialArch,
            createModalVisible: nextProps.createModalVisible
          })
        }
        if (nextProps.selectedSerialArch == undefined) {
            this.setState({
                entity: {},
              originalOrgs: nextProps.originalOrgs,
            })
        }
        if (nextProps.selectedSerialArch == undefined && this.props.selectedSerialArch != undefined) {
            this.props.form.resetFields();
            this.setState({
              originalOrgs: nextProps.originalOrgs,
            })
        }
    }

    getSerialArch = (defSchemeUuid) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'dispatchSerialArch/getSerialArchByUuid',
        payload: {
          uuid: defSchemeUuid ? defSchemeUuid : ''
        },
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.setState({
                entity: response.data
              })
            }
          }
        }
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
        if (operate === '批准') {
          this.onApprover();
        }
    }

    /**
     * 删除
     */
    handleRemove = (entity) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'dispatchSerialArch/removeSerialArch',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: response => {
                if (response && response.success) {
                  this.getSerialArch(entity.uuid);
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
            type: 'dispatchSerialArch/showPage',
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
        const { entity, originalOrgs } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
              code:fieldsValue.code,
              name:fieldsValue.name,
              companyUuid: loginCompany().uuid,
              dispatchCenter: {
                uuid: originalOrgs.uuid,
                code: originalOrgs.code,
                name: originalOrgs.name
              },
              note:fieldsValue.note
            };
            let type = 'dispatchSerialArch/save';
            if (entity.uuid) {
                type = 'dispatchSerialArch/modifyArch';
                values.uuid = entity.uuid;
                values.version = entity.version;
            }
            dispatch({
                type: type,
                payload: { ...values },
                callback: (response) => {
                    if (response && response.success) {
                      this.getSerialArch(entity.uuid);
                        message.success(formatMessage({ id: 'common.message.success.operate' }));
                        form.resetFields();
                        this.props.reFreshSider();
                        // TODO:留在当前新增的界面
                    }
                },
            });
        });
    }

  /**
   * 修改启用禁用状态
   */
  onChangeState = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;
    dispatch({
      type: 'dispatchSerialArch/changeDispatchState',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.getSerialArch(entity.uuid);
          this.props.reFreshSider();
          message.success('状态修改成功');
        }
      }
    });
  }

  /**
   * 批准
   */
  onApprover = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;
    dispatch({
      type: 'dispatchSerialArch/changeSerialArchState',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.getSerialArch(entity.uuid);
          this.props.reFreshSider();
          message.success(formatMessage({ id: '批准成功' }));
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

    render() {
        const { dispatchSerialArch, loading } = this.props;
        const { entity, createModalVisible, enabled, dispatchState } = this.state;

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
        let confirm = '';
        if(entity.dispatchState === basicState.ONLINE.name) {
          confirm = '禁用'
        }
        if(entity.dispatchState === basicState.OFFLINE.name) {
          confirm = '启用'
        }
        return (
            <div>
                <div className={styles.navigatorPanelWrapper}>
                    <span className={styles.title}>{entity && entity.code ? '[' + entity.code + ']' + entity.name : '新建体系'}</span>&nbsp;&nbsp;
                  {entity && entity.uuid && <IPopconfirm onConfirm={() => this.onChangeState()} operate={confirm}
                                 object={SerialArchLocale.serialArchTitle}>
                      <Switch checked={entity.dispatchState && entity.dispatchState === 'ONLINE' ? true : false} size="small" onChange={this.onChange} />
                    </IPopconfirm>}
                  &emsp; {getStateCaption(entity.dispatchState)}
                </div>
                { entity && entity.uuid ? <div className={styles.rightContentButton}>
                    <Button style={{ marginLeft: '1%', float: 'right' }} type="primary"
                        onClick={() => this.handleCreateModalVisible(true)}>
                        {SerialArchLocale.addSerialArchLine}
                    </Button>
                    <Button style={{ float: 'right' }}
                            onClick={() => this.handleModalVisible('批准')}>
                      {SerialArchLocale.approver}
                    </Button>

                    <Button style={{ marginRight: '1%', float: 'right' }}
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
                              getFieldDecorator('code', {
                                rules: [
                                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                                  {
                                    pattern: codePattern.pattern,
                                    message: codePattern.message
                                  },],
                                initialValue: entity.code,
                              })(
                                <Input disabled={entity.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />
                              )
                            }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={commonLocale.nameLocale}
                        >
                            {
                              getFieldDecorator('name', {
                                rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
                                  max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
                                }],
                                initialValue: entity.name,
                              })(
                                <Input disabled={entity.name ? true : false} placeholder={placeholderLocale(commonLocale.nameLocale)} />
                              )
                            }
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label={SerialArchLocale.state}
                        >
                          {
                            getFieldDecorator('serialArchState')(
                              <Col>{entity.serialArchState ? State[entity.serialArchState].caption : '初始'}</Col>
                            )
                          }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={commonLocale.noteLocale}
                        >
                            {
                              getFieldDecorator('note', {
                                rules: [{
                                  max: 255, message: tooLongLocale(commonLocale.noteLocale, 255),
                                }],
                                initialValue: entity.note,
                              })(
                                <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />
                              )
                            }
                        </FormItem>
                        {
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
                        selectedSerialArch={entity ? entity : null}
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
