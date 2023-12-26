/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-12-15 16:58:34
 * @version: 1.0
 */
import React from 'react';
import { Form, Button, Modal, Popconfirm, message, Spin, Input, Row, Col, Drawer, Tabs } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CostBillViewForm from '@/pages/NewCost/CostBill/CostBillViewForm';
const TabPane = Tabs.TabPane;
import {
  createChildBill,
  billConfirm,
  reconciliation,
  invoice,
  verification,
  payment,
  completed,
  checklistConfirm,
  portChildBill,
  pushBill,
  tmConfirm,
  rejectInvoice,
} from '@/services/bms/CostBill';
import CostChildBillSearchPage from '@/pages/NewCost/CostChildBill/CostChildBillSearchPage';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import { havePermission } from '@/utils/authority';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';

///CommonLayout/RyzeStandardTable
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    selectCords: [],
    billState: [],
    e: {},
    isExMerge: true,
    apLoading: false,
    rejectModal: false,
    showCreate: false,
    showChecklistConfirm: false,
    showBillConfirm: false,
    showTmConfirm: false,
    showPushBill: false,
    showReconciliation: false,
    showInvoiceConfirm: false,
    showRejectInvoice: false,
    showVerification: false,
    showApplyPayment: false,
    showPayment: false,
    showCompleted: false,
    Logvisible:false,
    entityUuid:''
  };

  onView = record => {};

  exSearchFilter = () => {
    return [
      {
        field: 'PLAN_UUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.params.entityUuid,
      },
    ];
  };

  onCloseLog = () => {
    this.setState({ Logvisible: !this.state.Logvisible });
  };

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
    }
  };
  //table额外的列
  drawExColumns = e => {
    if (e.column.fieldName == 'STATE') {
      return {
        title: '操作 ',
        width: 60,
        render: (_, record) => {
          return (
            <div>
             <a
               onClick={() => {
                 this.onCloseLog()
                 this.setState({ entityUuid :record.UUID ?record.UUID:'-1'} )
               }}
             >
               查看日志
             </a>
            </div>
          );
        },
      };
    }
  };

  checkDtl = e => {
    this.setState({ isModalVisible: true, e });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  drawToolsButton = () => {
    const {
      showCreate,
      showChecklistConfirm,
      showBillConfirm,
      showTmConfirm,
      showPushBill,
      showReconciliation,
      showInvoiceConfirm,
      showRejectInvoice,
      showVerification,
      showApplyPayment,
      showPayment,
      showCompleted,
      selectedRows,
      apLoading,
    } = this.state;
    return (
      <span>
        <Popconfirm
          title="确定是否对所选账单进行清单确认吗?"
          visible={showChecklistConfirm}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showChecklistConfirm: visible });
          }}
          onCancel={() => {
            this.setState({ showChecklistConfirm: false });
          }}
          onConfirm={() => {
            this.setState({ showChecklistConfirm: false });
            this.handleChecklistConfirm();
          }}
        >
          <Button onClick={() => this.setState({ showChecklistConfirm: true })}>清单确认</Button>
        </Popconfirm>

        <Popconfirm
          title="确定要生成所选账单的子帐单吗?"
          visible={showCreate}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showCreate: visible });
          }}
          onCancel={() => {
            this.setState({ showCreate: false });
          }}
          onConfirm={() => {
            this.setState({ showCreate: false });
            createChildBill(selectedRows[0].UUID).then(response => {
              if (response.success) {
                message.success('生成成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button type="primary" onClick={() => this.handleChildBill()}>
            子帐单生成
          </Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行账单确认吗?"
          visible={showBillConfirm}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showBillConfirm: visible });
          }}
          onCancel={() => {
            this.setState({ showBillConfirm: false });
          }}
          onConfirm={() => {
            this.setState({ showBillConfirm: false });
            this.handleBillConfirm();
          }}
        >
          <Button onClick={() => this.setState({ showBillConfirm: true })}>账单确认</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行运管审核吗?"
          visible={showTmConfirm}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showTmConfirm: visible });
          }}
          onCancel={() => {
            this.setState({ showTmConfirm: false });
          }}
          onConfirm={() => {
            this.setState({ showTmConfirm: false });
            this.handleTmConfirm();
          }}
        >
          <Button onClick={() => this.setState({ showTmConfirm: true })}>运管审核</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选子账单进行推送吗?"
          visible={showPushBill}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showPushBill: visible });
          }}
          onCancel={() => {
            this.setState({ showPushBill: false });
          }}
          onConfirm={() => {
            this.setState({ showPushBill: false });
            this.handlePushBill();
          }}
        >
          <Button onClick={() => this.setState({ showPushBill: true })}>子账单推送</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行对账完成吗?"
          visible={showReconciliation}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showReconciliation: visible });
          }}
          onCancel={() => {
            this.setState({ showReconciliation: false });
          }}
          onConfirm={() => {
            this.setState({ showReconciliation: false });
            this.handleReconciliation();
          }}
        >
          <Button onClick={() => this.setState({ showReconciliation: true })}>对账完成</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行票据确认吗?"
          visible={showInvoiceConfirm}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showInvoiceConfirm: visible });
          }}
          onCancel={() => {
            this.setState({ showInvoiceConfirm: false });
          }}
          onConfirm={() => {
            this.setState({ showInvoiceConfirm: false });
            this.handleInvoiceConfirm();
          }}
        >
          <Button onClick={() => this.setState({ showInvoiceConfirm: true })}>票据确认</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行票据驳回吗?"
          visible={showRejectInvoice}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showRejectInvoice: visible });
          }}
          onCancel={() => {
            this.setState({ showRejectInvoice: false });
          }}
          onConfirm={() => {
            this.setState({ showRejectInvoice: false });
            this.rejectInvoice();
          }}
        >
          <Button onClick={() => this.setState({ showRejectInvoice: true })}>票据驳回</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行核销吗?"
          visible={showVerification}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showVerification: visible });
          }}
          onCancel={() => {
            this.setState({ showVerification: false });
          }}
          onConfirm={() => {
            this.setState({ showVerification: false });
            this.handleVerification();
          }}
        >
          <Button onClick={() => this.setState({ showVerification: true })}>核销</Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行付款申请吗?"
          visible={showApplyPayment}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showApplyPayment: visible });
          }}
          onCancel={() => {
            this.setState({ showApplyPayment: false });
          }}
          onConfirm={() => {
            this.setState({ showApplyPayment: false });
            this.applyPayment();
          }}
        >
          <Button loading={apLoading} onClick={() => this.setState({ showApplyPayment: true })}>
            付款申请
          </Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行付款吗?"
          visible={showPayment}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showPayment: visible });
          }}
          onCancel={() => {
            this.setState({ showPayment: false });
          }}
          onConfirm={() => {
            this.setState({ showPayment: false });
            this.handlePayment();
          }}
        >
          <Button loading={apLoading} onClick={() => this.setState({ showPayment: true })}>
            付款
          </Button>
        </Popconfirm>

        <Popconfirm
          title="确定是否对所选账单进行归档吗?"
          visible={showCompleted}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showCompleted: visible });
          }}
          onCancel={() => {
            this.setState({ showCompleted: false });
          }}
          onConfirm={() => {
            this.setState({ showCompleted: false });
            this.handleCompleted();
          }}
        >
          <Button loading={apLoading} onClick={() => this.setState({ showCompleted: true })}>
            归档
          </Button>
        </Popconfirm>

        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Drawer
            placement="right"
            onClose={() => this.onCloseLog()}
            visible={this.state.Logvisible}
            width={'50%'}
            destroyOnClose
        >
          <Tabs defaultActiveKey="detail">
            <TabPane tab="操作日志" key='log'>
              <EntityLogTab entityUuid={this.state.entityUuid}/>
            </TabPane>
          </Tabs>
        </Drawer>
      </span>
    );
  };

  //生成子帐单
  handleChildBill = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ showCreate: true });
  };

  //校验
  billVerify = (selectedRows, childSelectRows) => {
    if (selectedRows.length == 0 && (childSelectRows == undefined || childSelectRows.length == 0)) {
      message.error('请至少选择一条记录');
      return false;
    }
    if (selectedRows.length > 0 && childSelectRows != undefined && childSelectRows.length > 0) {
      message.error('总账单与子帐单不可同时进行操作，请分开操作');
      return false;
    }
    return true;
  };

  handleChecklistConfirm = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    const response = await checklistConfirm(selectedRows[0].UUID);
    if (response.success) {
      message.success('确认成功！');
      this.onSearch();
    }
  };

  handlePushBill = () => {
    const childSelectRows = this.childRef?.state.selectedRows;
    if (childSelectRows == undefined || childSelectRows.length == 0) {
      message.error('请选择需要推送的子帐单！');
      return;
    }
    if (childSelectRows.length == 1) {
      this.pushBill(childSelectRows[0]).then(response => {
        if (response.success) {
          message.success('推送成功！');
        } else {
          message.error(response.message);
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '子账单推送',
        childSelectRows,
        this.pushBill,
        this.childRef.refreshTable()
      );
    }
  };

  //账单确认
  handleBillConfirm = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.confirmBill(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('确定成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.confirmChildBill(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('确定成功！');
            this.childRef.refreshTable();
            // this.onSearch;
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单确认',
          childSelectRows,
          this.confirmChildBill,
          // this.onSearch
          this.childRef.refreshTable()
        );
      }
    }
  };

  //运管确认
  handleTmConfirm = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.tmConfirmBill(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('审核成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.tmConfirmChildBill(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('审核成功！');
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '运管审核',
          childSelectRows,
          this.tmConfirmChildBill,
          this.childRef.refreshTable()
        );
      }
    }
  };

  pushBill = async child => {
    return await pushBill(child.UUID);
  };

  confirmBill = async uuid => {
    return await billConfirm('parent', uuid);
  };

  confirmChildBill = async child => {
    return await billConfirm('child', child.UUID);
  };

  tmConfirmBill = async uuid => {
    return await tmConfirm('parent', uuid);
  };

  tmConfirmChildBill = async child => {
    return await tmConfirm('child', child.UUID);
  };

  //对账确认
  handleReconciliation = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.reconciliationBill(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('确认成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.reconciliationChildBill(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('确认成功！');
            // this.onSearch();
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单对账确认',
          childSelectRows,
          this.reconciliationChildBill,
          this.childRef.refreshTable()
        );
      }
    }
  };

  reconciliationBill = async uuid => {
    return await reconciliation('parent', uuid);
  };

  reconciliationChildBill = async child => {
    return await reconciliation('child', child.UUID);
  };

  //票据确认
  handleInvoiceConfirm = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.invoiceConfirm(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('确认成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.invoiceConfirmChild(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('确认成功！');
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单对账确认',
          childSelectRows,
          this.invoiceConfirmChild,
          this.childRef.refreshTable()
        );
      }
    }
  };

  rejectInvoice = () => {
    const childSelectRows = this.childRef?.state.selectedRows;
    if (childSelectRows.length > 1 || childSelectRows.length == 0) {
      message.error('请仅选择一条需要驳回的子帐单记录！');
      return;
    }
    this.setState({ rejectModal: true });
  };

  handleRejectInvoice = async () => {
    const { rejectMessage } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    await rejectInvoice(childSelectRows[0].UUID, rejectMessage);
    this.setState({ rejectModal: false });
  };

  invoiceConfirm = async uuid => {
    return await invoice('parent', uuid);
  };

  invoiceConfirmChild = async child => {
    return await invoice('child', child.UUID);
  };

  //核销
  handleVerification = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.verification(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('核销成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.verificationChild(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('核销成功！');
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单核销',
          childSelectRows,
          this.verificationChild,
          this.childRef.refreshTable()
        );
      }
    }
  };

  verification = async uuid => {
    return await verification('parent', uuid);
  };

  verificationChild = async child => {
    return await verification('child', child.UUID);
  };

  //付款申请
  applyPayment = () => {
    this.setState({ apLoading: true });
    const childSelectRows = this.childRef?.state.selectedRows;
    if (childSelectRows.length == 0) {
      message.error('请选择需要发起付款申请的子帐单！');
      return;
    }
    let uuid = [];
    childSelectRows.map(data => {
      uuid.push(data.UUID);
    });
    console.log('uuid', uuid);
  };

  //付款
  handlePayment = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.payment(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('核销成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.paymentChild(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('核销成功！');
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单付款',
          childSelectRows,
          this.paymentChild,
          this.childRef.refreshTable()
        );
      }
    }
  };

  payment = async uuid => {
    return await payment('parent', uuid);
  };

  paymentChild = async child => {
    return await payment('child', child.UUID);
  };

  //归档
  handleCompleted = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) return;

    if (selectedRows.length > 0) {
      if (selectedRows.length > 1) {
        message.error('总账单操作只能操作单条记录！');
        return;
      }
      this.completed(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('归档成功！');
          this.onSearch();
        }
      });
    } else {
      if (childSelectRows.length == 1) {
        this.completedChild(childSelectRows[0]).then(response => {
          if (response.success) {
            message.success('归档成功！');
            this.childRef.refreshTable();
          } else {
            message.error(response.message);
          }
        });
      } else {
        this.batchProcessConfirmRef.show(
          '子账单归档',
          childSelectRows,
          this.completedChild,
          this.childRef.refreshTable()
        );
      }
    }
  };

  completed = async uuid => {
    return await completed('parent', uuid);
  };

  completedChild = async child => {
    return await completed('child', child.UUID);
  };

  expandedRowRender = record => {
    return (
      <div
        style={{
          maxHeight: 'calc(50vh)',
          maxWidth: 'calc(160vh)',
          overflowY: 'auto',
        }}
      >
        <CostChildBillSearchPage
          key={record.UUID}
          quickuuid="cost_child_bill"
          isNotHd={true}
          billUuid={record.UUID}
          onRef={r => (this.childRef = r)}
        />
      </div>
    );
  };

  portBill = () => {
    const { selectedRows } = this.state;
    const childSelectRows = this.childRef?.state.selectedRows;
    const verify = this.billVerify(selectedRows, childSelectRows);
    if (!verify) {
      return;
    }
    if (selectedRows.length > 0) {
      selectedRows.forEach(row => {
        portChildBill(row.UUID, 'parent');
      });
    } else {
      childSelectRows.forEach(row => {
        portChildBill(row.UUID, 'child');
      });
    }
  };

  // //绘制上方按钮
  drawActionButton = () => {
    const { isModalVisible, e, rejectModal } = this.state;
    return (
      <>
        <Button
          onClick={() => {
            this.portBill();
          }}
        >
          导出
        </Button>
        <Button
          onClick={() => {
            this.props.switchTab('query');
          }}
        >
          返回
        </Button>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <CostBillViewForm
            key={e.val}
            showPageNow="query"
            quickuuid="123"
            {...e}
            {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>
        <Modal
          title={'驳回原因'}
          visible={rejectModal}
          onCancel={() => {
            this.setState({ rejectModal: false });
          }}
          onOk={() => {
            this.handleRejectInvoice();
          }}
        >
          <Row justify="center" style={{ marginLeft: '2rem' }}>
            <Col span={5} style={{ fontSize: '1rem' }}>
              驳回原因：
            </Col>
            <Col span={16}>
              <Input
                placeholder={'驳回原因'}
                onChange={val => {
                  this.setState({ rejectMessage: val.target.value });
                }}
              />
            </Col>
          </Row>
        </Modal>
      </>
    );
  };
}
