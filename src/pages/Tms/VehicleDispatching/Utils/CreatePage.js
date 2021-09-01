import { PureComponent, Fragment, Component } from "react";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { findDOMNode } from 'react-dom';
import Page from '@/pages/Component/Page/inner/Page';
// import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ConfirmLeave from '@/pages/Component/Page/inner/ConfirmLeave';
import RouteConfirmLeave from '@/pages/Component/Page/inner/RouteConfirmLeave';
import NotePanel from '@/pages/Component/Form/NotePanel';
import Note from '@/pages/Component/Form/Note';
import { formatMessage } from 'umi/locale';
import { Button, Card, Form, Spin } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import NavigatorPanel from './NavigatorPanel';

/**
 * 新建页面基类，子类加标注@Form.create()
 * 标题：状态中提供title，用于显示标题
 * 按钮：默认提供确认、确认并新建、取消三个按钮，子类需提供对应的回调方法onSave，onSaveAndCreate，onCancel
 * 表单内容：父类负责表单的校验，如果校验失败将不会执行子类的回调函数，调用onSave和onSaveAndCreate时会将表单数据传入；
 * 表单内容的绘制需子类提供方法
 * 备注：页面默认带有备注信息块，如果子类状态中定义noNote属性为true，则不渲染备注字段
 * 事件：子类如果要捕捉Form表单change事件，可在子类定义onFormChange方法，当Form表单发生变化，将调研子类该方法
 */
export default class CreatePage extends Component {

    shouldComponentUpdate() {
        if (this.props.pathname && this.props.pathname !== window.location.pathname) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(){
        
        if(this.drawFormItems){
            let tableCols = []
            // 有表格明细
            if(this.drawTable){
                if(this.drawTable&&document.getElementsByClassName('ant-table-row')[0]!=null)
                    return;
            }

            if(document.activeElement.tagName === 'INPUT'){
                return;
            }

            let cols=[];
            if(this.drawFormItems() instanceof Array){
                cols = this.drawFormItems()[0].props.cols;
            }else{
                cols = this.drawFormItems().props.cols;
            }

            let id = '';
            for(let i =0;i<cols.length;i++){
                if(cols[i]==null)
                    continue;
                id = cols[i].key;

                if(document.activeElement.tagName =='BODY'||document.activeElement.id == id){
                    if(document.getElementById(id)!=null&&document.getElementById(id).tagName=='INPUT'){
                        document.getElementById(id).focus();
                        break;
                    }else if(document.getElementById(id)!=null&&document.getElementById(id).tagName=='DIV'){
                        if(document.getElementById(id).classList.contains('ant-select-selection')){
                            document.querySelector('.ant-select-selection').focus();
                            break;
                        }else{
                            if(document.getElementById(id).firstChild!=null){
                                if(document.querySelector('.ant-select-selection')===document.getElementById(id).firstChild){
                                    document.querySelector('.ant-select-selection').focus();
                                    break;
                                }
                            }
                        }
                    }
                }
            }  
        }
    }

    onChange = (e) => {
        this.setState({
            hasChanged: true,
        });
        if (this.onFormChange) {
            this.onFormChange(e);
        }
    }

    handleCancel = () => {
        if (this.state.hasChanged) {
            this.setState({
                confirmLeaveVisible: true
            });
        } else {
            if (this.onCancel)
                this.onCancel();
        }
    }

    handleSave = (continueCreate, e) => {
        e.preventDefault();

        const { form } = this.props;
        form.validateFields((errors, fieldsValue) => {
            if (errors) return;
            const data = {
                ...fieldsValue
            };
            if (continueCreate) {
                this.onSaveAndCreate(data);
            }
            else {
                this.onSave(data);
            }
        });
    }

    handleLeaveConfirmOk = () => {
        this.props.form.resetFields();
        if (this.onCancel)
            this.onCancel();
    }

    handleLeaveConfirmCancel = () => {
        this.setState({
            confirmLeaveVisible: false,
        });
    }

    drawCreateButtons = () => {

        return (
            <Fragment>
                <Button key="cancel" onClick={this.handleCancel}>
                    {formatMessage({ id: 'company.create.button.cancel' })}
                </Button>
                <Button key="save" type="primary" onClick={this.handleSave.bind(this, false)}>
                    {formatMessage({ id: 'company.create.button.confirm' })}
                </Button>
                {!this.state.entity.uuid && <Button key="saveAndCreate" type="primary" onClick={this.handleSave.bind(this, true)}>
                    {formatMessage({ id: 'company.create.button.confirmCreate' })}
                </Button>}
            </Fragment>
        );
    }

    drawAuditButtons = () => {

        return (
            <Fragment>
                {/* <Button key="cancel" onClick={this.handleCancel}>
                    {formatMessage({ id: 'company.create.button.cancel' })}
                </Button> */}
                <Button key="save" type="primary" onClick={this.handleSave.bind(this, false)}>
                    {formatMessage({ id: 'company.create.button.save' })}
                </Button>
            </Fragment>
        );
    }

    drawNotePanel = () => {
        const { form } = this.props;
        return (
            <NotePanel>
                {form.getFieldDecorator('note', {
                    initialValue: this.state.entity.note,
                    rules: [
                        {
                            max: 255,
                            message: '备注最大长度为255',
                        },
                    ]
                })(<Note />)}
            </NotePanel>
        );
    }

    render() {
        const comfirmLeaveProps = {
            confirmLeaveVisible: this.state.confirmLeaveVisible,
            action: this.state.currentView ? CONFIRM_LEAVE_ACTION[this.state.currentView] : CONFIRM_LEAVE_ACTION['NEW'],
            handleLeaveConfirmOk: this.handleLeaveConfirmOk,
            handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
        }

        const {auditButton,hasActionButton} = this.state;

        return (
              <div style={{marginTop:'17px'}}>
                <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading} >

                  <NavigatorPanel title={this.state.title} action={this.drawActionButton&&this.drawActionButton()} />
                  <Card bordered={false} >
                      <Form onChange={this.onChange} autoComplete="off">
                          {this.drawFormItems&&this.drawFormItems()}
                          {this.drawBussiness&&this.drawBussiness()}
                          {this.drawTable && this.drawTable()}
                      </Form>
                  </Card>
                </Spin>
                <ConfirmLeave {...comfirmLeaveProps} />

              </div>
        );
    }
}
