/*
 * @Author: Liaorongchang
 * @Date: 2023-07-14 15:44:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-23 15:28:40
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
  Dropdown,
  Icon,
  Menu,
  Empty,
  Descriptions,
  Modal,
  Form,
  Input,
} from 'antd';
import { copyPlan } from '@/services/cost/Cost';
import { apply } from '@/services/cost/CostPlan';
import { updateEntity } from '@/services/quick/Quick';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';

const { Step } = Steps;
const { confirm } = Modal;
@Form.create()
export default class CostPlanCard extends Component {
  state = {
    current: this.props.e.current,
    isModalOpen: false,
    changeStat: '',
    reason: '',
  };

  drawBody = costPlan => {
    const { current } = this.state;
    let status = this.props.e.current;
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
            if (e.stat != 'Use') {
              message.error('方案当前状态不可计算');
              return;
            }
            this.props.onClickCalculation(e);
          }}
        >
          计算
        </Button>
        <Button
          onClick={() => {
            this.props.onClickSelectBill(e);
          }}
        >
          查看台账
        </Button>
      </div>
    );
  };

  onCurrentChange = current => {
    this.setState({ current });
  };

  copyPlan = (data, resolve) => {
    copyPlan(data.uuid).then(e => {
      resolve();
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
      this.props.onClickDefView(costPlan.uuid);
    } else if (val.key == '2') {
      if (costPlan.stat == 'Use') {
        message.error('方案当前状态不可编辑');
        return;
      }
      this.props.onClickPlan(costPlan.uuid);
    } else if (val.key == '3') {
      this.showConfirm(costPlan);
    } else if (val.key == '4') {
      this.setState({ isModalOpen: true });
    }
  };

  showConfirm = costPlan => {
    const _this = this;
    confirm({
      title: costPlan.schemeName,
      content: '是否确定复制该方案？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve, reject) => {
          const res = _this.copyPlan(costPlan, resolve);
          return res;
        }).catch(() => console.log('出错!'));
      },
      onCancel() {},
    });
  };

  //保存申请条件
  handleApply = costPlanUuid => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await apply(costPlanUuid, values).then(response => {
          if (response.success) {
            this.setState({ isModalOpen: false });
            message.success('申请成功');
          }
        });
      }
    });
  };

  render() {
    const { e, costPlanStat } = this.props;
    const { costPlan } = e;
    const { isModalOpen, changeStat, reason } = this.state;
    const { getFieldDecorator } = this.props.form;
    let stat = costPlanStat.filter(x => x.itemValue == costPlan.stat);
    const menu = (
      <Menu
        onClick={val => {
          this.menuClick(val, costPlan);
        }}
      >
        <Menu.Item key="1">查看</Menu.Item>
        <Menu.Item key="2">编辑</Menu.Item>
        <Menu.Item key="3">复制</Menu.Item>
        <Menu.Item key="4">申请</Menu.Item>
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
                <Tag color={stat[0].textColor}>{stat[0].itemText}</Tag>
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
        <Modal
          visible={isModalOpen}
          title={costPlan.schemeName || '申请'}
          onOk={() => {
            this.handleApply(costPlan.uuid);
            // this.setState({ isModalOpen: false });
          }}
          onCancel={() => {
            this.setState({ isModalOpen: false });
          }}
        >
          <Form>
            <Form.Item label="当前状态" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span style={{ color: stat[0].textColor }}>{stat[0].itemText}</span>
            </Form.Item>
            <Form.Item label="目标状态" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('costPlanStat', {
                rules: [{ required: true, message: '目标状态不能为空' }],
              })(
                <SimpleAutoComplete
                  placeholder={'请选择目标状态'}
                  dictCode="costPlanStat"
                  value={changeStat}
                  onChange={e => {
                    this.setState({ changeStat: e });
                  }}
                  allowClear
                  noRecord
                />
              )}
            </Form.Item>
            <Form.Item label="申请原因" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('applyReason')(<Input placeholder="请输入申请原因" />)}
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    );
  }
}
