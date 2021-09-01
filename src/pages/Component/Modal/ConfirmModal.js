import { PureComponent } from "react";
import { Modal } from 'antd';

export default class ConfirmModal extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      confirmLoading: false
    }
  }

  /**
   * 控制弹出框展示
   */
  handlebatchAddVisible = () => {
    this.props.onCancel();
  }
  /**
   * 确认
   */
  handleOk = () => {
    this.setState({
      confirmLoading: true
    })
    this.props.onOk();
    this.setState({
      confirmLoading: false
    })
  }

  stateChange = () => {
    this.setState({
      confirmLoading: false
    })
  }

  render() {
    return (
      <Modal
        title={'确认' + this.props.operate}
        visible={this.props.visible}
        confirmLoading={this.state.confirmLoading}
        onOk={this.handleOk}
        onCancel={this.handlebatchAddVisible}
        centered={true}
        destroyOnClose={true}
        afterClose={this.stateChange}
        maskClosable={false}
      >
        <p>{this.props.content ? this.props.content : `确认${this.props.operate}该${this.props.object}吗?`}</p>
      </Modal>
    );
  }
}
