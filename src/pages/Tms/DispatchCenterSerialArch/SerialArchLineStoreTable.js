import { Table, Button, message, Input, InputNumber, Icon, Popconfirm, Tabs, Modal, Form } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { element } from 'prop-types';
import { SerialArchLocale, SerialArchPerm } from './SerialArchLocale';
import SerialArchLineAddStore from './SerialArchLineAddStore';
import Highlighter from 'react-highlight-words';
import OperateInfoTable from './OperateInfoTable';
import { SERVICE_CAPTION } from '@/utils/constants';
import { routerRedux } from 'dva/router';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
const FormItem = Form.Item;
let dragingIndex = -1;
const TabPane = Tabs.TabPane;
class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };
    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }
    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}
const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};
const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};
const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);
@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch,
}))
export default  class SerialArchLineStoreTable extends React.Component {
  state = {
    data: [],
    selectedRowKeys: [],
    selectedRows: [],
    lineUuid: '',
    searchText: '',
    lineEntity: {},
    showAdjDragModal: false,
    modalLoading: false,
    adjDragIndex: 0,
    toAdjOrderNo: 1
  };
  components = {
    body: {
      row: DragableBodyRow,
    },
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.dispatchSerialArch) {
      this.setState({
        data: nextProps.dispatchSerialArch.existInLineStores,
        selectedRowKeys: [],
        selectedRows: [],
      });
    }
    if (nextProps.lineEntity) {
      this.setState({
        lineEntity: nextProps.lineEntity,
        lineUuid: nextProps.lineUuid
      })
    }
  }
  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];
    this.props.dispatch({
      type: 'dispatchSerialArch/sort',
      payload: {
        startData: dragRow,
        endData: data[hoverIndex],
        lineUuid: this.state.lineUuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshData();
        }
      }
    })
  };
  refreshData = () => {
    const { searchFilter } = this.props;
    this.props.dispatch({
      type: 'dispatchSerialArch/queryLines',
      payload: {
        ...searchFilter
      }
    })
  }
  onShowStoreModal = (type) => {
    const { lineUuid, lineEntity } = this.props;
    if (!lineUuid) {
      message.warning(SerialArchLocale.pleaseSelectArchLineFirst);
      return;
    }
    this.props.dispatch({
      type: 'dispatchSerialArch/getStoreUCN',
      payload: {
        companyUuid: loginCompany().uuid,
        serialArchUuid: lineUuid,
        storeType: type
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.setState({
            storeVendorData: response.data,
            storeType: type
          });
        }
      }
    })
  };
  onCancelStoreModal = () => {
    this.props.dispatch({
      type: 'dispatchSerialArch/showPage',
      payload: {
        addStoreVisible: false
      }
    })
  }
  handleSelectRows = (keys, rows) => {
    this.setState({
      selectedRows: rows,
      selectedRowKeys: keys,
    });
  };
  onRemove = () => {
    const { lineUuid, lineEntity } = this.props;
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.warning(SerialArchLocale.pleaseSelectToRemoveStore);
      return;
    }
    if ( selectedRowKeys && selectedRowKeys.length>0 ) {
      for (let i = 0; i < selectedRowKeys.length; i++) {
        this.props.dispatch({
          type: 'dispatchSerialArch/removeLineStore',
          payload: {
            uuid: selectedRowKeys[i]
          },
          callback: (response) => {
            if (response && response.success) {
              this.refreshData();
            }
          }
        })
      }
    }
  }
  onRemoveForOne = (record) => {
    this.props.dispatch({
      type: 'dispatchSerialArch/removeLineStore',
      payload: {
        uuid: record && record.uuid ? record.uuid : ''
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshData();
        }
      }
    })
  }
  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };
  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  onViewStore = (code) => {
    this.props.dispatch({
      type: 'store/getByCompanyUuidAndCode',
      payload: code,
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/store',
            payload: {
              showPage: 'view',
              entityUuid: response.data.uuid
            }
          }));
        }
      }
    })
  }
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={SerialArchLocale.storeCode}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {SerialArchLocale.search}
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          {SerialArchLocale.reset}
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      return record[dataIndex].code
        .toString()
        .toLowerCase().indexOf((value.toLowerCase())) === 0
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text, record) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={record.store.code.toString()}
      />
    ),
  });
  fetchOperateProps = (record) => {
    let operateProps = [
      {
        name: SerialArchLocale.adjOrderNo,
        onClick: this.onShowAdjOrderNoModal.bind(this, record)
      },
      {
        name: commonLocale.deleteLocale,
        disabled: !SerialArchPerm.DELETE_STORE,
        confirm: true,
        confirmCaption: SerialArchLocale.store,
        onClick: this.onRemoveForOne.bind(this, record)
      }
    ];
    return operateProps;
  }
  onShowAdjOrderNoModal = (record) => {
    const number = record.orderNo - 1;
    this.setState({
      adjDragIndex: number,
      selectLine:record,
      showAdjDragModal: true
    });
  }
  handleCancelAdjOrderNo() {
    this.setState({
      showAdjDragModal: false,
      toAdjOrderNo: 1
    });
  }
  handleAdjOrderNo() {
    const { data, adjDragIndex, toAdjOrderNo, selectLine } = this.state;
    const startData = data[adjDragIndex];
    const endData = data[toAdjOrderNo - 1];
    this.props.dispatch({
      type: 'dispatchSerialArch/sort',
      payload: {
        orderNo: toAdjOrderNo,
        serialArchLineUuid: this.state.lineUuid,
        storeUuid: selectLine.store && selectLine.store.uuid ? selectLine.store.uuid : ''
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshData();
          this.setState({
            showAdjDragModal: false,
            modalLoading: false,
            toAdjOrderNo: 1
          });
        } else {
          this.setState({
            modalLoading: false,
            toAdjOrderNo: 1
          });
        }
      }
    })
  }
  orderNoChange = (value) => {
    this.setState({
      toAdjOrderNo: value
    });
  }
  drawOtherCom = () => {
    const baseFormItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        centered={true}
        width={350}
        title={'请输入要调整的序号'}
        visible={this.state.showAdjDragModal}
        confirmLoading={this.state.modalLoading}
        onOk={() => this.handleAdjOrderNo()}
        onCancel={() => this.handleCancelAdjOrderNo()}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
      >
        <Form>
          <FormItem
            {...baseFormItemLayout}
            key='orderNo'
            label={SerialArchLocale.orderNo}
          >
            <InputNumber value={this.state.toAdjOrderNo} min={1} max={this.state.data ? this.state.data.length : 1} placeholder={placeholderLocale(SerialArchLocale.orderNo)} onChange={this.orderNoChange}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
  render() {
    const { addStoreVisible, storeVendorData, storeType } = this.state;
    const { lineEntity, selectedSerialArch , tableList, searchFilter } = this.props;
    const columns = [
      {
        title: SerialArchLocale.orderNo,
        dataIndex: 'orderNo',
        key: 'orderNo',
        width: '100px',
      },
      {
        title: commonLocale.codeLocale,
        dataIndex: 'code',
        key: 'code',
        width: '280px',
        ...this.getColumnSearchProps('store'),
        render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store ? record.store.code : undefined)}>
          {record.store ? record.store.code : ''}</a>,
      },
      {
        title: commonLocale.nameLocale,
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => record.store ? record.store.name : '',
        width: '300px',
      },
      {
        key: 'operate',
        title: commonLocale.operateLocale,
        render: record => {
          return < OperateCol menus={this.fetchOperateProps(record)} />
        }
      }
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: this.handleSelectRows,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: 10,
      pageSizeOptions: ['10', '20', '50', '100', '200']
    };
    return (<div>
      <Tabs defaultActiveKey='1' tabBarExtraContent={
        <Fragment>
          <Popconfirm title={SerialArchLocale.sureToRemoveSelectedStore} onConfirm={() => this.onRemove()}>
            <Button disabled={!SerialArchPerm.DELETE_STORE}>
              {commonLocale.batchRemoveLocale}
            </Button>
          </Popconfirm>
          &nbsp;
          <Button type='primary' icon='plus' onClick={() => this.onShowStoreModal('STORE')} disabled={!SerialArchPerm.ADD_STORE}>
            {SerialArchLocale.addStore}
          </Button>&nbsp;
          <Button type='primary' icon='plus' onClick={() => this.onShowStoreModal('VENDOR')}>
            {SerialArchLocale.addWrh}
          </Button>&nbsp;
          <Button type='primary' icon='plus' onClick={() => this.onShowStoreModal('DC')}>
            {'添加配送中心'}
          </Button>
        </Fragment>}>
        <TabPane tab={'门店/供应商'} key='1'>
          <Table
            pagination={paginationProps}
            rowKey={record => record.uuid}
            columns={columns}
            dataSource={ this.state.data && this.state.data.records ? this.state.data.records : [] }
            onRow={(record, index) => ({
              index: record.orderNo - 1,
              moveRow: this.moveRow,
            })}
            rowSelection={rowSelection}
          />
        </TabPane>
        <TabPane tab={commonLocale.operateInfoLocale} key='2'>
          <OperateInfoTable
            entity={this.state.lineEntity}
            serviceCaption={SERVICE_CAPTION['serialArch']}
          />
        </TabPane>
      </Tabs>
      <SerialArchLineAddStore
        onCancelStoreModal={this.onCancelStoreModal}
        addStoreVisible={addStoreVisible}
        storeVendorData={storeVendorData}
        storeType={storeType}
        archLine={lineEntity}
        serialArch={selectedSerialArch}
        searchFilter={searchFilter}
      />
      {this.drawOtherCom()}
    </div >);
  }
}
// const SerialArchLineStoreTable = DragDropContext(HTML5Backend)(DragSortingTable);
//
// export default SerialArchLineStoreTable;
