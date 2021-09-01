import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Input, Pagination, Icon,Transfer,Spin,Table } from 'antd';
import PropTypes from 'prop-types';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginStore } from '@/utils/LoginContext';
import { formatMessage, getLocale } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import styles from './PickOrder.less';
import difference from 'lodash/difference';

const Search = Input.Search;
// 自定义表格穿梭框
const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;

      const rowSelection = {
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows.map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);

          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          onRow={({key}) => ({
            onClick: () => {
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

@connect(({ storepickorder,stockAllocateOrder, loading }) => ({
  storepickorder,stockAllocateOrder,
  loading: loading.models.storepickorder?loading.models.storepickorder:(loading.models.stockAllocateOrder?loading.models.stockAllocateOrder:false)
}))
class OrderAddStoreModal extends Component {

  static propTypes = {
    addStoreModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    handleSaveStore: PropTypes.func,
    handleAddStoreCancel: PropTypes.func,
    schemeUuid:PropTypes.string,
    component:PropTypes.string
  }

  state = {
    targetKeys: [],// 右边-选中
    stores: [],// 展示
  }

  componentDidMount() {
    this.fetchStore();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.component==='pickup'){
      if(nextProps.storepickorder.stores&&nextProps.storepickorder.stores!=this.props.storepickorder.stores){
          this.setState({
            stores:nextProps.storepickorder.stores,
          });
      }
    } else if(nextProps.component==='stock'){
      if(nextProps.stockAllocateOrder.stores&&nextProps.stockAllocateOrder.stores!=this.props.stockAllocateOrder.stores){
          this.setState({
            stores:nextProps.stockAllocateOrder.stores
          });
      }
    }

  }

  /**
   * 获取可用的门店集合
   */
  fetchStore = (value) => {
    const { dispatch } = this.props;
    let type = ''
    if (this.props.component==='pickup') {
      type='storepickorder/getStoreUCN'
    }else if (this.props.component==='stock') {
      type='stockAllocateOrder/getStoreUCN'      
    }
    dispatch({
      type: type,
      payload: {
        schemeUuid:this.props.schemeUuid,
      },
    });
  }

  /**
   * 转化门店UCN
   */
  fetchStoreUCN = (uuid, lists) => {
    for (let ucn of lists) {
      if (uuid === ucn.uuid)
        return ucn;
    }
    return {};
  }

  /**
   * 保存
   */
  handleSaveStore = () => {
    const { targetKeys,stores,orderStoreUuidList } = this.state;
    let list = [];

    targetKeys.map((uuid) => {
        let store = this.fetchStoreUCN(uuid, stores);
        list.push(store);
    })

    this.props.handleSaveStore(list);
  }

  /**
   * 穿梭
   */
  onChange = targetKeys => {
    this.setState({ targetKeys: targetKeys });
  };

  render() {
    const {
      handleSaveStore,
      handleAddStoreCancel,
      addStoreModalVisible,
      confirmLoading,
      loading
    } = this.props;

    const { targetKeys,stores} = this.state;

    const mockData = [];
    if (stores) {
      for (let i = 0; i < stores.length; i++) {
        mockData.push({
          key: stores[i].uuid,
          title: convertCodeName(stores[i]),
          disabled: false,
          code: stores[i].code,
          name: stores[i].name
        });
      }
    }

    const leftTableColumns = [
      {
        title: '门店',
        dataIndex: 'title',
      },
    ];
    const rightTableColumns = [
      {
        title: '门店',
        dataIndex: 'title',

      },
    ];
    return (
      <Modal
        title='添加门店'
        visible={addStoreModalVisible}
        width={650}
        onOk={this.handleSaveStore}
        onCancel={handleAddStoreCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}>
          <Spin spinning={loading}>
            <TableTransfer
              dataSource={mockData}
              targetKeys={targetKeys}
              disabled={false}
              showSearch={true}
              onChange={this.onChange}
              listStyle={{width:'290px'}}
              leftColumns={leftTableColumns}
              rightColumns={rightTableColumns}
              filterOption={(inputValue, item) =>
                item.title.indexOf(inputValue) !== -1
              }
            />
          </Spin>
      </Modal>
    )
  }
}

export default OrderAddStoreModal;