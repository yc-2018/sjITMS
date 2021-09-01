import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Input, Pagination, Icon,Transfer,Spin,Table, message } from 'antd';
import PropTypes from 'prop-types';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginWave } from '@/utils/LoginContext';
import { formatMessage, getLocale } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import styles from '@/pages/Out/PickOrder/PickOrder.less';

import difference from 'lodash/difference';
import { State } from '../TransportOrder/TransportOrderContants';

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

@connect(({ scheduleGroup, loading }) => ({
  scheduleGroup,
  loading: loading.models.scheduleGroup?loading.models.scheduleGroup:false
}))
class AddWaveModal extends Component {

  static propTypes = {
    addWaveModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    handleSaveWave: PropTypes.func,
    handleAddWaveCancel: PropTypes.func,
    component:PropTypes.string
  }

  state = {
    targetKeys: [],// 右边-选中
    waves: [],// 展示
  }

  componentDidMount() {
    this.fetchWave();
  }


  /**
   * 获取可用的波次集合
   */
  fetchWave = (value) => {
    const { dispatch } = this.props;
    let type = ''
    if (this.props.component==='scheduleGroup') {
      type='scheduleGroup/queryWaveNumByState'
    }
    dispatch({
      type: 'scheduleGroup/queryWaveNumByState',
      payload:{
        state:State.Initial.name
      },
      callback:response=>{
        if(response&&response.success){
          this.setState({
            waves:response.data
          })
        }
      }
    });
  }

  /**
   * 保存
   */
  handleSaveWave = () => {
    const { targetKeys,waves } = this.state;
    if(targetKeys.length==0){
      message.warning('请先选择行');
      return;
    }

    this.props.handleSaveWave(targetKeys);
  }

  /**
   * 穿梭
   */
  onChange = targetKeys => {
    this.setState({ targetKeys: targetKeys });
  };

  render() {
    const {
      handleSaveWave,
      handleAddWaveCancel,
      addWaveModalVisible,
      confirmLoading,
      loading
    } = this.props;

    const { targetKeys,waves} = this.state;

    const mockData = [];
    if (waves) {
      for (let i = 0; i < waves.length; i++) {
        mockData.push({
          key: waves[i],
          title: waves[i],
          disabled: false,
        });
      }
    }

    const leftTableColumns = [
      {
        title: '波次',
        dataIndex: 'title',
      },
    ];
    const rightTableColumns = [
      {
        title: '波次',
        dataIndex: 'title',

      },
    ];
    return (
      <Modal
        title='添加波次'
        visible={addWaveModalVisible}
        width={650}
        onOk={this.handleSaveWave}
        onCancel={()=>handleAddWaveCancel(false)}
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

export default AddWaveModal;