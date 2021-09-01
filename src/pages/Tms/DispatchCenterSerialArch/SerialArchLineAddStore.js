import { Transfer, Modal, message, Table, Spin } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { SerialArchLocale } from './SerialArchLocale';
import difference from 'lodash/difference';
import { orgType } from '@/utils/OrgType';

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
          size='small'
          onRow={({ key }) => ({
            onClick: () => {
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch,
}))
export default class SerialArchLineAddStore extends React.Component {
  state = {
    targetKeys: [],
    disabled: false,
    showSearch: false,
    addStoreVisible: false,
    notExistInLineStores: [],
    lineUuid: '',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      this.setState({
        notExistInLineStores: nextProps.dispatchSerialArch.notExistInLineStores,
        lineUuid: nextProps.dispatchSerialArch.lineUuid,
      });

    }
  }

  onChange = nextTargetKeys => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  fetchStoreUCN = (uuid, lists) => {
    for (let ucn of lists) {
      if (uuid === ucn.uuid)
        return ucn;
    }
  };

  refreshData = () => {
    const { searchFilter } = this.props;
    this.props.dispatch({
      type: 'dispatchSerialArch/queryLines',
      payload: {
        ...searchFilter,
      },
    });
  };

  onSaveStore = () => {
    const { targetKeys, lineUuid } = this.state;
    const { storeVendorData, storeType, archLine, serialArch, addStoreVisible } = this.props;
    if (!archLine.uuid) {
      message.warning(SerialArchLocale.pleaseSelectArchLineFirst);
      return;
    }
    let list = [];
    if (Array.isArray(targetKeys)) {
      for (let item of targetKeys) {
        // let notExStore = this.fetchStoreUCN(item, this.state.notExistInLineStores);
        let notExStore = this.fetchStoreUCN(item, storeVendorData);
        let lineStore = {};
        lineStore.storeType = storeType;
        lineStore.dispatchCenterUuid = loginOrg().uuid;
        lineStore.store = notExStore;
        lineStore.archLine = archLine;
        lineStore.serialArch = archLine.serialArch ? archLine.serialArch : serialArch;
        lineStore.companyUuid = loginCompany().uuid;
        if (lineStore.store != null) {
          list.push(lineStore);
        }
      }
    }

    this.props.dispatch({
      type: 'dispatchSerialArch/saveLineStore',
      payload: list,
      callback: (response) => {
        if (response && response.success) {
          this.refreshData();
          this.setState({
            targetKeys: [],
            disabled: false,
            showSearch: false,
            notExistInLineStores: [],
          });

        }
      },
    });
  };

  render() {
    const { targetKeys, disabled, showSearch, notExistInLineStores } = this.state;
    const { addStoreVisible, onCancelStoreModal, storeVendorData, storeType } = this.props;
    const visible = this.props.dispatchSerialArch.addStoreVisible;
    let title = '门店';
    switch (storeType) {
      case 'STORE':
        title = '门店';
        break;
      case 'DC':
        title = '配送中心';
        break;
      case 'VENDOR':
        title = '供应商';
        break;
    }
    const leftTableColumns = [
      {
        title: title,
        dataIndex: 'title',
      },
    ];
    const rightTableColumns = [
      {
        title: title,
        dataIndex: 'title',

      },
    ];

    const mockDataa = [];
    if (storeVendorData) {
      for (let i = 0; i < storeVendorData.length; i++) {
        mockDataa.push({
          key: storeVendorData[i].uuid,
          title: convertCodeName(storeVendorData[i]),
          description: storeVendorData[i].code,
          disabled: false,
          code: storeVendorData[i].code,
          name: storeVendorData[i].name,
        });
      }
    }
    return (
      <Modal
        title={'添加' + title}
        visible={visible}
        onOk={this.onSaveStore}
        onCancel={onCancelStoreModal}
        confirmLoading={this.props.loading}
        destroyOnClose={true}>
        <Spin spinning={this.props.loading}>
          <TableTransfer
            rowKey={record => record.key}
            dataSource={mockDataa}
            targetKeys={targetKeys}
            disabled={false}
            showSearch={true}
            onChange={this.onChange}
            listStyle={{ width: '290px' }}
            leftColumns={leftTableColumns}
            rightColumns={rightTableColumns}
            filterOption={(inputValue, item) =>
              item.code.indexOf(inputValue) !== -1 || item.name.indexOf(inputValue) !== -1
            }
          />
          {/* render={item => convertCodeName(item)} */}
        </Spin>
      </Modal>
    );
  }
}
