import React, { Component } from 'react';
import { Layout, Input, Select, Row, Button, Switch, message } from 'antd';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { sendMessageTo } from '@/services/quick/Open';
const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

export default class RoutePage extends Component {
  checkMenus = [];
  createRef = {};
  state = {
    sendMessage: {
      userId: '',
      sendTitle: '',
      sendMessage: '',
    },
    isAll: false,
  };

  componentDidMount() {}

  onChange = (e, type) => {
    let { sendMessage } = this.state;
    sendMessage[type] = e.target.value;
    this.setState({ sendMessage });
  };

  onClick = async () => {
    const { sendMessage } = this.state;
    if (!sendMessage.sendTitle || !sendMessage.sendTitle) {
      message.error('标题跟消息体不能为空');
      return;
    }
    await sendMessageTo(sendMessage);
    //TODO 待解决 后端CORS异常待处理 实际调用成功
    message.success('发送成功');
  };

  render() {
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content style={{ marginLeft: '8px', height: '100%', overflow: 'hidden' }}>
            <NavigatorPanel canFullScreen={this.state.canFullScreen} title={'通知发布'} />
            <Row style={{ margin: '8px 8px 8px 11px' }}>
              发送给：
              {/* <Select style={{ width: 240, margin: '8px 8px 8px 11px' }}>
                <Select.Option value="lucy">lucy</Select.Option>
              </Select> */}
              <Input
                style={{
                  width: 240,
                }}
                onChange={e => this.onChange(e, 'userId')}
                disabled={this.state.isAll ? true : false}
                placeholder="为空发送给所有人"
              />
              {/* <Switch
                checked={this.state.isAll}
                onClick={e => {
                  this.setState({ isAll: e });
                }}
              /> */}
            </Row>
            <Row>
              发送标题：
              <Input
                style={{
                  width: 240,
                  margin: '0 8px 8px 0',
                }}
                onChange={e => this.onChange(e, 'sendTitle')}
              />
            </Row>
            <Row>
              <span style={{ float: 'left' }}> 发送内容：</span>
              <TextArea
                rows={4}
                style={{
                  margin: '0 8px 8px 0',
                  width: '500px',
                }}
                onChange={e => this.onChange(e, 'sendMessage')}
              />
            </Row>
            <Row style={{ width: '580px', textAlign: 'center' }}>
              <Button type="primary" onClick={() => this.onClick()}>
                发送
              </Button>
            </Row>
          </Content>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
