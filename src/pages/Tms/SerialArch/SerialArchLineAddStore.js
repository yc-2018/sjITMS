import { Transfer, Modal, message, Table, Spin } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { SerialArchLocale } from './SerialArchLocale';
import difference from 'lodash/difference';

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

@connect(({ serialArch, loading }) => ({
  serialArch,
  loading: loading.models.serialArch,
}))
export default class SerialArchLineAddStore extends React.Component {
  state = {
    targetKeys: [],
    disabled: false,
    showSearch: false,
    notExistInLineStores: [],
    lineUuid: ''
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      this.setState({
        notExistInLineStores: nextProps.serialArch.notExistInLineStores,
        lineUuid: nextProps.serialArch.lineUuid
      })

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
    return {};
  }

  onSaveStore = () => {
    if (!this.state.lineUuid) {
      message.warning(SerialArchLocale.pleaseSelectArchLineFirst);
      return;
    }
    const { targetKeys, lineUuid } = this.state;

    let list = [];
    if (Array.isArray(targetKeys)) {
      for (let item of targetKeys) {
        let notExStore = this.fetchStoreUCN(item, this.state.notExistInLineStores);
        let lineStore = {};
        lineStore.store = notExStore;
        lineStore.archLineUuid = lineUuid;
        lineStore.companyUuid = loginCompany().uuid;
        list.push(lineStore);
      }
    }

    this.props.dispatch({
      type: 'serialArch/saveLineStore',
      payload: list,
      callback: response => {
        this.setState({
          targetKeys: [],
          disabled: false,
          showSearch: false,
          notExistInLineStores: [],
        });
        this.props.dispatch({
          type: 'serialArch/getLineEntity',
          payload: {
            lineUuid: this.state.lineUuid
          }
        })
      }
    })
  }

  onCancel = () => {
    this.setState({
      targetKeys: [],
      disabled: false,
      showSearch: false,
      notExistInLineStores: [],
    });
    this.props.dispatch({
      type: 'serialArch/showPage',
      payload: {
        addStoreVisible: false
      }
    })
  }

  render() {
    const { targetKeys, disabled, showSearch, notExistInLineStores } = this.state;
    const visible = this.props.serialArch.addStoreVisible;

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

    const mockDataa = [];
    if (notExistInLineStores) {
      for (let i = 0; i < notExistInLineStores.length; i++) {
        mockDataa.push({
          key: notExistInLineStores[i].uuid,
          title: convertCodeName(notExistInLineStores[i]),
          description: notExistInLineStores[i].code,
          disabled: false,
          code: notExistInLineStores[i].code,
          name: notExistInLineStores[i].name
        });
      }
    }
    return (
      <Modal
        title={SerialArchLocale.addStore}
        visible={visible}
        onOk={this.onSaveStore}
        onCancel={this.onCancel}
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
