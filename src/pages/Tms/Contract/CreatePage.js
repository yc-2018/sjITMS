import { PureComponent, Fragment, Component } from "react";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { findDOMNode } from 'react-dom';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ConfirmLeave from '@/pages/Component/Page/inner/ConfirmLeave';
import RouteConfirmLeave from '@/pages/Component/Page/inner/RouteConfirmLeave';
import NotePanel from '@/pages/Component/Form/NotePanel';
import Note from '@/pages/Component/Form/Note';
import { formatMessage } from 'umi/locale';
import { Button, Card, Form, Spin } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';

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

    componentWillUnmount(){
        if(this.props.pathname){
          let pathname = this.props.pathname;
          let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
          if(this.props[namespace]){
            this.props[namespace].showPage = 'query'
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

    render() {
        const comfirmLeaveProps = {
            confirmLeaveVisible: this.state.confirmLeaveVisible,
            action: this.state.currentView ? CONFIRM_LEAVE_ACTION[this.state.currentView] : CONFIRM_LEAVE_ACTION['NEW'],
            handleLeaveConfirmOk: this.handleLeaveConfirmOk,
            handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
        }

        return (
            <PageHeaderWrapper>
                <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading} >
                    <Page>
                        <Card bordered={false}>
                            <Form onChange={this.onChange} autoComplete="off">
                                {this.drawTable && this.drawTable()}
                            </Form>
                        </Card>
                    </Page>
                </Spin>

                <ConfirmLeave {...comfirmLeaveProps} />
                {/* <RouteConfirmLeave /> */}
            </PageHeaderWrapper>
        );
    }
}
