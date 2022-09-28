/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-28 11:28:11
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { cancelIssue } from '@/services/sjitms/ETCIssueAndRecycle';
import { message, Popconfirm, Button } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showCancel: false,
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

  //批量审核（多选）
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

  handleCancelIssue = async selectedRow => {
    return await cancelIssue(selectedRow.BILLNUMBER);
  };

  drawToolsButton = () => {
    const { showCancel, selectedRows } = this.state;
    return (
      <span>
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
            this.handleCancelIssue(selectedRows[0]);
            this.handleCancelIssue(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('取消成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.cancelIssue()}>取消发卡</Button>
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
