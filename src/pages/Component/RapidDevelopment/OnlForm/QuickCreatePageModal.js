import React, { Component } from 'react'
import { Button, message, Modal, Form, Layout, Menu, Icon, Tree } from 'antd';
import QuickCreatePageDefault from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';

/**
 * 弹窗式表单页面
 * modal    模态窗口的props
 * page     CreatePage的props
 * customPage   如果自定义CreatePage，把类进行传入
 * onRef    获取本类，可以调用 show 方法弹出窗口
 */
export default class CreatePageModal extends Component {
    state = {
        visible: false
    }

    componentDidMount = () => {
        this.props.onRef && this.props.onRef(this);
    }

    show = () => {
        this.setState({ visible: true });
    }

    render() {
        const { modal, page, customPage } = this.props;
        const CreatePage = customPage ? customPage : QuickCreatePageDefault;

        return (
            <Modal
                visible={this.state.visible}
                onOk={e => this.createPageRef.handleSave(e)}
                onCancel={() => this.createPageRef.handleCancel()}
                confirmLoading={false}
                destroyOnClose
                {...modal}
            >
                <CreatePage
                    noBorder={true}
                    onCancel={() => this.setState({ visible: false })}
                    onRef={node => (this.createPageRef = node)}
                    {...page}
                />
            </Modal>
        )
    }
}

