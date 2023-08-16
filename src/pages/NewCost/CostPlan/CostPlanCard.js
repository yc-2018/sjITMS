/*
 * @Author: Liaorongchang
 * @Date: 2023-07-14 15:44:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-07 11:27:22
 * @version: 1.0
 */
import React, { Component } from 'react';
import {
  Button,
  Card,
  Col,
  Steps,
  message,
  Row,
  List,
  Tag,
  Switch,
  Dropdown,
  Icon,
  Menu,
  Empty,
  Descriptions,
} from 'antd';
import { copyPlan } from '@/services/cost/Cost';
import { updateEntity } from '@/services/quick/Quick';

const { Step } = Steps;

export default class CostPlanCard extends Component {
  state = {
    current: this.props.e.current,
  };

  drawBody = costPlan => {
    const { current } = this.state;
    let status = this.props.e.current;
    console.log('e', this.props.e);
    const stepStyle = {
      marginBottom: 15,
      boxShadow: '0px -1px 0 0 #e8e8e8 inset',
    };
    return (
      <div>
        <div style={{ color: '#8c8c8c' }}>当前月流程：</div>
        <Steps
          type="navigation"
          current={current}
          onChange={current => this.onCurrentChange(current)}
          style={stepStyle}
          size="small"
          key={costPlan.uuid}
        >
          <Step status={status > 0 ? 'finish' : 'process'} title="数据确认" />
          <Step status={status > 1 ? 'finish' : status < 1 ? 'wait' : 'process'} title="费用计算" />
          <Step status={status > 2 ? 'finish' : status < 2 ? 'wait' : 'process'} title="费用对账" />
          <Step status={status > 3 ? 'finish' : status < 3 ? 'wait' : 'process'} title="费用核销" />
        </Steps>
        <div
          style={{
            marginBottom: 10,
            height: '10rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {this.drawDtl()}
        </div>
      </div>
    );
  };

  drawDtl = () => {
    const { current } = this.state;
    const { sourceConfirmData, costCalculation, costConfirm, costConsumed } = this.props.e;
    console.log('ccc', costCalculation, costConfirm, costConsumed);
    if (current == 0) {
      return (
        <div
          style={{
            borderRadius: '4px',
            overflow: 'scroll',
            height: '10rem',
            width: '100%',
          }}
        >
          <List
            bordered
            dataSource={sourceConfirmData}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <a>
                      {item.sourceName}
                      <Tag
                        color={item.state == '已确认' ? 'green' : 'red'}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        {item.state}
                      </Tag>
                    </a>
                  }
                  description="cc"
                />
                {item.state != '已确认' ? <div style={{ color: 'blue' }}>提醒</div> : ''}
              </List.Item>
            )}
          />
        </div>
      );
    } else if (current == 1) {
      return costCalculation != undefined ? this.drawCardBody(costCalculation) : <Empty />;
    } else if (current == 2) {
      return costConfirm != undefined ? this.drawCardBody(costConfirm) : <Empty />;
    } else if (current == 3) {
      return costConsumed != undefined ? this.drawCardBody(costConsumed) : <Empty />;
    }
  };

  drawCardBody = cost => {
    console.log('cost', cost);
    return (
      <Descriptions style={{ width: '100%' }} layout="vertical" bordered>
        <Descriptions.Item label="所属月份">{cost.month}</Descriptions.Item>
        <Descriptions.Item label="操作人">{cost.operatorcode}</Descriptions.Item>
        <Descriptions.Item label="操作时间">{cost.operatedate}</Descriptions.Item>
      </Descriptions>
    );
  };

  drawButton = e => {
    return (
      <div style={{ float: 'right' }}>
        <Button
          style={{ marginRight: '10px' }}
          onClick={() => {
            this.props.onClickCalculation(e);
          }}
        >
          计算
        </Button>
        <Button onClick={() => {
            this.props.onClickSelectBill(e);
          }}>查看台账</Button>
      </div>
    );
  };

  onCurrentChange = current => {
    this.setState({ current });
  };

  copyPlan = data => {
    copyPlan(data.uuid).then(e => {
      if (e.success) {
        this.props.handleSarch();
        message.success('复制成功');
      }
    });
  };

  isEnable = costPlan => {
    let param = {
      tableName: 'COST_PLAN',
      sets: { NOT_ENABLE: costPlan.notEnable ? 0 : 1 },
      condition: {
        params: [
          {
            field: 'UUID',
            rule: 'eq',
            val: [costPlan.uuid],
          },
        ],
      },
      updateAll: false,
    };
    const result = updateEntity(param).then(e => {
      if (e.result > 0) {
        this.props.handleSarch();
        message.success('操作成功！');
      }
    });
  };

  menuClick = (val, costPlan) => {
    if (val.key == '1') {
      this.props.onClickPlan(costPlan.uuid);
    } else {
      this.copyPlan(costPlan);
    }
  };

  render() {
    const { costPlan } = this.props.e;
    const menu = (
      <Menu
        onClick={val => {
          this.menuClick(val, costPlan);
        }}
      >
        <Menu.Item key="1">编辑</Menu.Item>
        <Menu.Item key="2">复制</Menu.Item>
      </Menu>
    );

    return (
      <Col style={{ paddingBottom: 20 }} span={8}>
        <Card
          hoverable
          key={costPlan.uuid}
          headStyle={{
            fontWeight: 'bolder',
            fontSize: '18px',
            padding: '0 10px',
          }}
          bodyStyle={{ padding: '10px 10px 10px' }}
          extra={
            <Row type="flex" justify="space-around" align="middle">
              <Col>
                <Switch
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                  defaultChecked={!costPlan.notEnable}
                  style={{ marginRight: '0.3rem' }}
                  onChange={() => this.isEnable(costPlan)}
                />
              </Col>
              <Col>
                <Dropdown overlay={menu}>
                  <Button type="link">
                    更多
                    <Icon type="down" />
                  </Button>
                </Dropdown>
              </Col>
            </Row>
          }
          title={costPlan.schemeName}
          style={{ width: '95%', border: '0.5px solid #3B77E3' }}
        >
          {this.drawBody(costPlan)}
          {this.drawButton(costPlan)}
        </Card>
      </Col>
    );
  }
}
