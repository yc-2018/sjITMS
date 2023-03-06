import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Radio, Form } from 'antd';
import { loginOrg, loginUser } from '@/utils/LoginContext';
import { formatMessage } from 'umi/locale';
import { getOrgCaption } from '@/utils/OrgType';
import { orderBy } from 'lodash';
const RadioGroup = Radio.Group;

@connect(state => ({
  login: state.login,
}))
@Form.create()
export default class SwitchOrg extends Component {
  state = {
    ...this.props,
    value: loginOrg() ? loginOrg().uuid : null,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ switchOrgModalVisible: nextProps.switchOrgModalVisible });
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSubmit = () => {
    const { value } = this.state;
    const userUuid = loginUser().uuid;
    this.props.switchOrg(value, userUuid);
    // this.props.dispatch(routerRedux.push({
    //   pathname: window.location.origin,
    // }));
  };

  handleCancle = () => {
    this.props.hideOrgModal();
    this.setState({
      value: loginOrg() ? loginOrg().uuid : null,
    });
  };

  render() {
    const { switchOrgModalVisible } = this.state;
    const { orgInfos, confirmLoading } = this.props;
    const currentOrgUuid = loginOrg() ? loginOrg().uuid : null;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const children = [];
    if (orgInfos) {
      for (const orgInfo of orderBy(orgInfos, x => x.orgUuid)) {
        if (orgInfo.enable === true && orgInfo.orgState === 'ONLINE') {
          children.push(
            <Radio key={orgInfo.orgUuid} style={radioStyle} value={orgInfo.orgUuid}>
              {`${getOrgCaption(orgInfo.orgType)}: [${orgInfo.orgCode}]${orgInfo.orgName}`}
            </Radio>
          );
        }
      }
    }
    return (
      <Modal
        title={formatMessage({ id: 'menu.account.switch' })}
        visible={switchOrgModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancle}
        confirmLoading={confirmLoading}
      >
        <RadioGroup onChange={this.onChange} defaultValue={currentOrgUuid} value={this.state.value}>
          {children}
        </RadioGroup>
      </Modal>
    );
  }
}
