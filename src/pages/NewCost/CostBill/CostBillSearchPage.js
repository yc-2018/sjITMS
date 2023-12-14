/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-12-06 18:30:25
 * @version: 1.0
 */
import React from 'react';
import { Form, Button, Modal, Popconfirm, message, Spin, Input, Row, Col } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CostBillViewForm from '@/pages/NewCost/CostBill/CostBillViewForm';
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
    showCreate: false,
    isExMerge: true,
    apLoading: false,
    rejectModal: false,
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

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
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
    const { showCreate, selectedRows, apLoading } = this.state;
    return (
      <span>
        <Button
          onClick={() => {
            this.handleChecklistConfirm();
          }}
        >
          清单确认
        </Button>
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

        <Button
          onClick={() => {
            this.handleBillConfirm();
          }}
        >
          账单确认
        </Button>
        <Button
          onClick={() => {
            this.handleTmConfirm();
          }}
        >
          运管审核
        </Button>
        <Button
          onClick={() => {
            this.handlePushBill();
          }}
        >
          子账单推送
        </Button>
        <Button
          onClick={() => {
            this.handleReconciliation();
          }}
        >
          对账完成
        </Button>
        <Button
          onClick={() => {
            this.handleInvoiceConfirm();
          }}
        >
          票据确认
        </Button>
        <Button
          type="danger"
          onClick={() => {
            this.rejectInvoice();
          }}
        >
          票据驳回
        </Button>
        <Button
          onClick={() => {
            this.handleVerification();
          }}
        >
          核销
        </Button>
        <Button
          type="primary"
          loading={apLoading}
          onClick={() => {
            this.applyPayment();
          }}
        >
          申请付款
        </Button>
        <Button
          onClick={() => {
            this.handlePayment();
          }}
        >
          付款
        </Button>
        <Button
          onClick={() => {
            this.handleCompleted();
          }}
        >
          归档
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
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
    if (childSelectRows.length == 0) {
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
