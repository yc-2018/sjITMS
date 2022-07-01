import React, { Component } from 'react'
import { Modal } from 'antd';
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
        saving: false,
        visible: false
    }

    componentDidMount = () => {
        this.props.onRef && this.props.onRef(this);
    }

    show = () => {
        this.setState({ visible: true });
    }

    hide = () => {
        this.setState({ visible: false });
    }

    render() {
        const { modal, page, customPage } = this.props;
        const CreatePage = customPage ? customPage : QuickCreatePageDefault;
        return (
            <Modal
                bodyStyle={{ overflowY: "scroll", maxHeight: "70vh" }}
                visible={this.state.visible}
                onOk={e => this.createPageRef.handleSave(e)}
                onCancel={() => this.createPageRef.handleCancel()}
                confirmLoading={this.state.saving}
                destroyOnClose
                {...modal}
            >
                <CreatePage
                    noBorder={true}
                    onSaving={() => this.setState({ saving: true })}
                    onSaved={(data) => {
                        this.setState({ saving: false });
                        if (this.props.onSaved) {
                            this.props.onSaved(data);
                        } else if (data.response.success) {
                            this.hide();
                        }
                    }}
                    onCancel={() => this.hide()}
                    onRef={node => (this.createPageRef = node)}
                    {...page}
                />
            </Modal>
        )
    }
}

