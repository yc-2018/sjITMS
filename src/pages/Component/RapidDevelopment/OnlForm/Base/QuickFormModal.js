import React, { PureComponent } from 'react';
import QuickFormDefault from '../QuickFormDefault';
import { Modal } from 'antd';

export default class QuickFormModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  show = () => {
    this.setState({ visible: true });
  };

  hide = () => {
    this.setState({ visible: false });
  };
  render() {
    let formProps = {
      quickuuid: this.props.quickuuid,
      location: { pathname: window.location.pathname },
      isModal: true,
    };
    let Component = this.props.component ? this.props.component : QuickFormDefault;
    return (
      <Modal
        title={this.props.title ? this.props.title : ''}
        visible={this.state.visible}
        onOk={this.hide}
        onCancel={this.hide}
        // destroyOnClose={true}
        width={1000}
        {...this.props.ModalProps}
      >
        <Component {...formProps} />
      </Modal>
    );
  }
}
