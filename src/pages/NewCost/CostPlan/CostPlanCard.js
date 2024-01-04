/*
 * @Author: Liaorongchang
 * @Date: 2023-07-14 15:44:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-01-03 09:06:46
 * @version: 1.0
 */
import React, { Component } from 'react';
import {
  Button,
  DatePicker,
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
  Divider,
} from 'antd';
import { copyPlan } from '@/services/bms/Cost';
import { apply, getPlanOperateByMonth } from '@/services/bms/CostPlan';
import { sourceAbnormal, remind } from '@/services/bms/BasicSource';
import { updateEntity } from '@/services/quick/Quick';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import style from './CostPlanCard.less';
import moment from 'moment';

const { Step } = Steps;
const { confirm } = Modal;
const { MonthPicker } = DatePicker;
@Form.create()
export default class CostPlanCard extends Component {
  state = {
    e: this.props.e,
    isModalOpen: false,
    dataSourceModal: false,
    changeStat: '',
    reason: '',
    month:
      new Date().getMonth() == 0
        ? new Date().getFullYear() - 1 + '-12'
        : new Date().getFullYear() + '-' + new Date().getMonth(),
  };

  componentWillReceiveProps(newProps) {
    this.setState({ e: newProps.e });
  }

  drawBody = (costPlan, current, month, e) => {
    const monthFormat = 'YYYY-MM';
    const stepStyle = {
      // marginBottom: 15,
      boxShadow: '0px -1px 0 0 #e8e8e8 inset',
      height: '2.5rem',
    };
    return (
      <div>
        <div style={{ fontSize: '0.8rem' }}>
          当前月流程：
          <MonthPicker
            size="small"
            defaultValue={moment(month, monthFormat)}
            format={monthFormat}
            onChange={(date, dateString) => {
              this.handleChangeMonth(costPlan.uuid, dateString);
            }}
          />
        </div>
        <Steps
          type="navigation"
          current={current}
          onChange={current => this.onCurrentChange(current)}
          style={stepStyle}
          size="small"
          key={costPlan.uuid}
        >
          <Step status={current > 0 ? 'finish' : 'process'} title="数据确认" />
          <Step
            status={current > 1 ? 'finish' : current < 1 ? 'wait' : 'process'}
            title="费用计算"
          />
          <Step
            status={current > 2 ? 'finish' : current < 2 ? 'wait' : 'process'}
            title="费用对账"
          />
          <Step
            status={current > 3 ? 'finish' : current < 3 ? 'wait' : 'process'}
            title="费用核销"
          />
        </Steps>
        <div
          style={{
            marginBottom: 10,
            // height: '7.7rem',
          }}
        >
          {this.drawDtl(e, current)}
        </div>
      </div>
    );
  };

  handleChangeMonth = async (uuid, dateString) => {
    this.setState({ month: dateString });
    const response = await getPlanOperateByMonth(uuid, dateString);
    if (response && response.success) {
      this.setState({ e: response.data });
    }
  };

  drawDtl = (data, current) => {
    const { sourceConfirmData, costCalculation, costConfirm, costConsumed } = data;
    if (current == 0) {
      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              borderRadius: '4px',
              overflow: 'scroll',
              height: '7.7rem',
              width: '100%',
            }}
          >
            {this.createList(sourceConfirmData)}
          </div>
          {current == 0 && sourceConfirmData.length > 3 ? (
            <a
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                fontSize: '0.9rem',
                textDecoration: 'underline',
              }}
              onClick={() => {
                this.setState({ dataSourceModal: true });
              }}
            >
              全部展开
            </a>
          ) : (
            ''
          )}
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

  createList = sourceConfirmData => {
    return (
      <List
        bordered
        dataSource={sourceConfirmData}
        renderItem={item => (
          <List.Item style={{ padding: '5px 20px' }}>
            <List.Item.Meta
              title={
                <span>
                  {item.sourceName}
                  <span style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '0.5rem' }}>
                    {item.confirmer}
                  </span>
                  <Tag
                    color={
                      item.state == '已确认' ? 'green' : item.state == '未确认' ? 'red' : 'gold'
                    }
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {item.state}
                  </Tag>
                </span>
              }
            />
            {item.state == '已确认' ? (
              <a
                onClick={() => {
                  this.showAbnormalConfirm(item);
                }}
              >
                异常
              </a>
            ) : (
              <a
                onClick={() => {
                  this.remind(item);
                }}
              >
                提醒
              </a>
            )}
          </List.Item>
        )}
      />
    );
  };

  showAbnormalConfirm = item => {
    const _this = this;
    confirm({
      title: item.sourceName,
      content: '确定当前数据源异常？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve, reject) => {
          const res = _this.abnormal(item, resolve);
          return res;
        }).catch(() => console.log('出错!'));
      },
      onCancel() {},
    });
  };

  abnormal = (data, resolve) => {
    const { e, month } = this.state;
    sourceAbnormal(data.sourceUuid, e.costPlan.uuid, month).then(response => {
      resolve();
      if (response.success) {
        this.handleChangeMonth(e.costPlan.uuid, month);
        message.success('操作成功');
      }
    });
  };

  remind = async item => {
    await remind(item.sourceUuid);
    message.success('提醒成功!');
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
    const { e } = this.state;
    const newE = {
      ...e,
      current: current,
    };
    this.setState({ e: newE });
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
    updateEntity(param).then(e => {
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
        if (values.costPlanStat == 'Expired') {
          message.error('目标状态不可为：过期！');
          return;
        }
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
    const { costPlanStat } = this.props;
    const { isModalOpen, changeStat, dataSourceModal, e, month } = this.state;
    const { current, costPlan, sourceConfirmData } = e;
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
      <Col className={style.card} span={8}>
        <div style={{ margin: '0.2rem 0.2rem 0 0.2rem' }}>
          {/* 头 */}
          <Row type="flex" justify="space-around" align="middle">
            <Col
              span={17}
              style={{
                fontWeight: 'bolder',
                fontSize: '18px',
              }}
            >
              {costPlan.schemeName}
              <Tag
                // color="#3B77E3"
                color="blue"
                style={{
                  textAlign: 'right',
                  fontWeight: 'normal',
                  fontSize: '0.8rem',
                  marginLeft: '0.3rem',
                }}
              >
                {costPlan.organizationname}
              </Tag>
            </Col>
            <Col span={6}>
              <Tag color={stat[0].textColor} style={{ marginRight: '-0.2rem' }}>
                {stat[0].itemText}
              </Tag>
              <Dropdown overlay={menu}>
                <Button type="link">
                  更多
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </Col>
          </Row>
          <Row
            type="flex"
            justify="start"
            align="middle"
            style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.3rem' }}
          >
            <Col span={4} style={{ textAlign: 'right' }}>
              生效期：
            </Col>
            <Col span={8}>{costPlan.effectivedate}</Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              到效期：
            </Col>
            <Col span={8}>{costPlan.expiringdate}</Col>
          </Row>
          <Row
            type="flex"
            justify="start"
            align="middle"
            style={{ fontSize: '0.8rem', fontWeight: 'normal' }}
          >
            <Col span={4} style={{ textAlign: 'right' }}>
              备注：
            </Col>
            <Col span={8}>{costPlan.note}</Col>
          </Row>
          <Divider style={{ margin: '0.3rem 0' }} />
          {/* body */}
          <div>
            {this.drawBody(costPlan, current, month, e)}
            {this.drawButton(costPlan)}
          </div>
        </div>
        <Modal
          visible={isModalOpen}
          title={costPlan.schemeName + '申请'}
          onOk={() => {
            this.handleApply(costPlan.uuid);
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
        <Modal
          visible={dataSourceModal}
          title={costPlan.schemeName}
          onOk={() => {
            this.setState({ dataSourceModal: false });
          }}
          onCancel={() => {
            this.setState({ dataSourceModal: false });
          }}
        >
          {this.createList(sourceConfirmData)}
        </Modal>
      </Col>
    );
  }
}
