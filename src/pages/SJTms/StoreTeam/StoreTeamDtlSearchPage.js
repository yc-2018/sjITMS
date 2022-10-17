/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-17 08:37:46
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import { message, Popconfirm, Button, Modal } from 'antd';
import TableTransfer from '@/pages/SJTms/LineSystem/TableTransfer';
import { onSave, saveTableSort, deleteDtl } from '@/services/sjitms/StoreTeam';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreTeamDtlSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    modalVisible: false,
    transferDataSource: [],
    targetKeys: [],
    modalTitle: '',
    transferColumnsTitle: '',
    modalQuickuuid: '',
    buttonDisable: false,
    canDragTable: true,
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    this.props.onRef && this.props.onRef(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRow != this.props.selectedRow) {
      this.onSearch(nextProps.selectedRow);
    }
  }

  // //拖拽排序
  drapTableChange = list => {
    const { data } = this.state;
    data.list = list.map((record, index) => {
      record.LINE = index + 1;
      return record;
    });

    this.setState({ buttonDisable: true });
  };

  onSearch = data => {
    const { selectedRow } = this.props;
    let UUID = typeof data == 'undefined' ? selectedRow : data;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'headuuid',
            type: 'VarChar',
            rule: 'eq',
            val: UUID,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };

  onTransferChange = targetKeys => {
    this.setState({ targetKeys });
  };

  onTranferFetch = dataSource => {
    this.setState({ transferDataSource: dataSource });
  };

  //添加门店
  handleAddStore = () => {
    const { selectedRow } = this.props;
    if (selectedRow == undefined) {
      message.error('请选择方案之后再添加门店');
      return;
    }
    this.setState({
      modalVisible: true,
      modalTitle: '添加门店',
      modalQuickuuid: 'sj_itms_store',
      transferColumnsTitle: '门店',
    });
  };

  //保存
  handleStoreSave = async () => {
    const { targetKeys } = this.state;
    const { selectedRow } = this.props;
    let param = {
      headUuid: selectedRow,
      storeUuid: targetKeys,
    };
    const response = await onSave(param);
    if (response.success) {
      message.success('保存成功！');
      this.setState({ modalVisible: false, targetKeys: [] });
      this.refreshTable();
    }
  };

  //排序
  saveTableSort = async () => {
    const { data } = this.state;
    const response = await saveTableSort(data.list);
    if (response.success) {
      message.success('保存成功！');
      this.refreshTable();
    }
  };

  delete = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请至少选中一条数据！');
      return;
    }
    const response = await deleteDtl(selectedRows);
    if (response.success) {
      message.success('删除成功！');
      this.refreshTable();
    }
  };

  drawActionButton = () => {};

  drawToolbarPanel = () => {
    const {
      modalVisible,
      modalTitle,
      targetKeys,
      transferColumnsTitle,
      modalQuickuuid,
      buttonDisable,
    } = this.state;
    return (
      <div style={{ marginTop: '10px' }}>
        <Button
          onClick={() => {
            this.handleAddStore();
          }}
        >
          添加门店
        </Button>
        {buttonDisable ? <Button onClick={this.saveTableSort}>保存排序</Button> : <></>}
        <Button onClick={this.delete}>删除</Button>
        <Modal
          title={modalTitle}
          width={800}
          visible={modalVisible}
          onOk={this.handleStoreSave}
          confirmLoading={false}
          onCancel={() => this.setState({ modalVisible: false })}
          destroyOnClose
        >
          <TableTransfer
            targetKeys={targetKeys}
            columnsTitle={transferColumnsTitle}
            onChange={this.onTransferChange}
            handleFetch={this.onTranferFetch}
            quickuuid={modalQuickuuid}
          />
        </Modal>
      </div>
    );
  };

  drawSearchPanel = () => {};

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
