/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-21 15:09:10
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { cancelIssue, applyIssue } from '@/services/sjitms/ETCIssueAndRecycle';
import { message, Popconfirm, Button, Form, Modal, Input } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ETCSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showCancel: false,
    showApply: false,
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    this.props.onRef && this.props.onRef(this);
  }

  handleOnRow = record => {
    return {
      onClick: () => {
        this.props.refreshSelectedRow(record);
      },
    };
  };

  //取消发卡（多选）
  cancelIssue = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showCancel: true })
      : this.batchProcessConfirmRef.show(
          '取消发卡',
          selectedRows,
          this.handleCancelIssue,
          this.onSearch
        );
  };

  //申请发卡
  clickApplyIssue = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    this.setState({ showApply: true });
  };

  handleCancelIssue = async selectedRow => {
    this.props.refreshSelectedRow({});
    return await cancelIssue(selectedRow.BILLNUMBER);
  };

  handleApplyIssue = async (selectedRow, fieldsValue) => {
    console.log('selectedRow', selectedRow);
    console.log('fieldsValue', fieldsValue);
    return await applyIssue(selectedRow.BILLNUMBER, fieldsValue.note);
  };

  drawToolsButton = () => {
    const { showCancel, showApply, selectedRows } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <span>
        <Button onClick={() => this.clickApplyIssue()}>申请发卡</Button>

        <Modal
          title="申请发卡"
          visible={showApply}
          key={selectedRows[0]}
          onOk={() => {
            this.props.form.validateFields((err, fieldsValue) => {
              if (err) {
                return;
              }
              this.handleApplyIssue(selectedRows[0], fieldsValue).then(response => {
                if (response.success) {
                  message.success('发起成功！');
                  this.setState({ showApply: false });
                  this.onSearch();
                }
              });
            });
          }}
          onCancel={() => {
            this.setState({ showApply: false });
          }}
        >
          <Form>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="申请原因">
              {getFieldDecorator('note', {})(<Input />)}
            </Form.Item>
          </Form>
        </Modal>

        <Popconfirm
          title="你确定要取消发卡所选中的排车单吗?"
          visible={showCancel}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showCancel: visible });
          }}
          onCancel={() => {
            this.setState({ showCancel: false });
          }}
          onConfirm={() => {
            this.setState({ showCancel: false });
            this.handleCancelIssue(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('取消成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button type="danger" onClick={() => this.cancelIssue()}>
            取消发卡
          </Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  };

  render() {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
      </div>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
