import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Radio, Form, Col, Row, Button, message } from 'antd';
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
    if (!nextProps.orgInfos || nextProps.orgInfos.length <= 1) {
      message.error('无可切换的组织 !!');
      return;
    }
    this.setState({
      switchOrgModalVisible: nextProps.switchOrgModalVisible,
    });
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
      // display: 'block',
      width: '200px',
      height: '30px',
      lineHeight: '30px',
      marginTop: '7.5px',
      marginLeft: '2.5px',
    };
    //分组
    let childGroup = {};
    const children = [];
    let i = 0;
    if (orgInfos) {
      let orgInfosFilter =
        loginOrg().type == 'COMPANY'
          ? orgInfos
          : orgInfos.filter(e => e.orgType == loginOrg().type || e.orgType == 'COMPANY');
      for (const orgInfo of orderBy(orgInfosFilter, x => x.orgUuid)) {
        if (orgInfo.enable === true && orgInfo.orgState === 'ONLINE') {
          if (!childGroup[orgInfo.orgType]) {
            childGroup[orgInfo.orgType] = [];
          }
          childGroup[orgInfo.orgType].push(orgInfo);
        }
      }
      for (let c in childGroup) {
        let e = (
          <Col span={11} style={{ marginLeft: '10px', marginTop: '5px' }}>
            <div>
              <Button style={{ backgroundColor: '#dee1e6', color: 'black', width: '205px' }}>
                {getOrgCaption(childGroup[c][0].orgType)}
              </Button>
            </div>
            {childGroup[c].map(e => {
              return (
                <Radio.Button
                  key={e.orgUuid}
                  style={radioStyle}
                  value={e.orgUuid}
                  onClick={() => {
                    //单击直接选中
                    const value = e.orgUuid;
                    const userUuid = loginUser().uuid;
                    this.props.switchOrg(value, userUuid);
                  }}
                >
                  {`[${e.orgCode}]${e.orgName}`}
                </Radio.Button>
              );
            })}
          </Col>
        );
        children.push(e);
        i++;
      }
    }

    // const children = [];
    // if (orgInfos) {
    //   for (const orgInfo of orderBy(orgInfos, x => x.orgUuid)) {
    //     if (orgInfo.enable === true && orgInfo.orgState === 'ONLINE') {
    //       children.push(
    //         <div>
    //           <div>111</div>
    //           <Radio key={orgInfo.orgUuid} style={radioStyle} value={orgInfo.orgUuid}>
    //             {`${getOrgCaption(orgInfo.orgType)}: [${orgInfo.orgCode}]${orgInfo.orgName}`}
    //           </Radio>
    //         </div>
    //       );
    //     }
    //   }
    // }

    return (
      <Modal
        title={formatMessage({ id: 'menu.account.switch' })}
        visible={switchOrgModalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancle}
        confirmLoading={confirmLoading}
        footer={null}
        width={i > 1 ? '520px' : '260px'}
      >
        <RadioGroup
          onChange={this.onChange}
          defaultValue={currentOrgUuid}
          value={this.state.value}
          buttonStyle="solid"
        >
          <Row>{children}</Row>
        </RadioGroup>
      </Modal>
    );
  }
}
