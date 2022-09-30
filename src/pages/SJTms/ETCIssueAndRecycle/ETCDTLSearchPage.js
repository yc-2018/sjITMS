/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-30 09:47:27
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { cancelIssue, applyIssue } from '@/services/sjitms/ETCIssueAndRecycle';
import { message, Popconfirm, Button } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
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
  applyIssue = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showApply: true })
      : this.batchProcessConfirmRef.show(
          '申请发卡',
          selectedRows,
          this.handleApplyIssue,
          this.onSearch
        );
  };

  handleCancelIssue = async selectedRow => {
    return await cancelIssue(selectedRow.BILLNUMBER);
  };

  handleApplyIssue = async selectedRow => {
    console.log('selectedRow', selectedRow);
    await applyIssue(selectedRow.BILLNUMBER);
  };

  drawToolsButton = () => {
    const { showCancel, showApply, selectedRows } = this.state;
    return (
      <span>
        <Popconfirm
          title="是否确认对该排车单发起发卡申请?"
          visible={showApply}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showApply: visible });
          }}
          onCancel={() => {
            this.setState({ showApply: false });
          }}
          onConfirm={() => {
            this.setState({ showApply: false });
            this.handleApplyIssue(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('取消成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.applyIssue()}>申请发卡</Button>
        </Popconfirm>

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
