/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-09 16:37:41
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { message, Popconfirm, Button } from 'antd';
import { deleteHead } from '@/services/sjitms/StoreTeam';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreTeamHeadSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showDelete: false,
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

  addItem = data => {
    const param = {
      quickuuid: 'sj_itms_storeteam_head',
      params: data ? { entityUuid: data.record.UUID } : {},
      showPageNow: data ? 'update' : 'create',
    };
    this.setState({ param });
    this.createPageModalRef.show();
  };

  delete = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showDelete: true })
      : this.batchProcessConfirmRef.show(
          '删除方案',
          selectedRows,
          this.handleDelete,
          this.onSearch
        );
  };

  handleDelete = async selectedRow => {
    return await deleteHead(selectedRow.UUID);
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { showDelete, selectedRows } = this.state;
    return (
      <span>
        <Button
          onClick={() => {
            this.addItem();
          }}
        >
          新增方案
        </Button>

        <Popconfirm
          title="你确定要删除所选中的方案吗?"
          visible={showDelete}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showDelete: visible });
          }}
          onCancel={() => {
            this.setState({ showDelete: false });
          }}
          onConfirm={() => {
            this.setState({ showDelete: false });
            this.handleDelete(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('删除成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button type="danger" onClick={() => this.delete()}>
            删除方案
          </Button>
        </Popconfirm>

        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </span>
    );
  };

  drawcell = e => {
    if (e.column.fieldName == 'CODE') {
      const component = <a onClick={() => this.addItem(e)}>{e.record.CODE}</a>;
      e.component = component;
    }
  };

  render() {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
        <CreatePageModal
          modal={{
            afterClose: () => {
              this.queryCoulumns();
            },
          }}
          page={this.state.param}
          onRef={node => (this.createPageModalRef = node)}
        />
      </div>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
