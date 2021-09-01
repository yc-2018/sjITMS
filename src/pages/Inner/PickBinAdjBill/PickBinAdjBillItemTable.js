import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Select, Table, Button, Input, message,
  Popconfirm, Divider, InputNumber
} from 'antd';
import EditTable from '@/pages/Component/Form/EditTable';
import PickSchemeArticleSelect from './PickSchemeArticleSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';

@connect(({ article, pickSchema, loading }) => ({
  article, pickSchema,
  loading: loading.models.article,
}))
export default class PickBinAdjBillItemTable extends PureComponent {
  index = 0;
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      items: [],
      entity: {},
      sourceBinOptions: [],
      sourceBincode: '',
      targetBincode: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickBinAdjBill && nextProps.pickBinAdjBill.billItems) {
      this.setState({
        items: nextProps.pickBinAdjBill.billItems,
        entity: nextProps.pickBinAdjBill,
      })
    }
  }

  componentDidUpdate() {
    // 为每一个item增加一个key
    var items = [];
    items = this.state.items;
    if (items.length > 0) {
      items.map(item => {
        if (item.key == undefined) {
          item.key = `NEW_TEMP_ID_${this.index}`;
          this.index += 1;
        }
      });
      this.setState({
        items: items
      })

    }
  }
  /**
   * 获取一行
   * @param {} key 
   * @param {*} newData 
   */
  getRowByKey(key, newData) {
    const { items } = this.state;
    return (newData || items).filter(item => item.key === key)[0];
  }

  /**
   * 新增一行
   */
  newMember = () => {
    const { items } = this.state;
    const newData = items.map(item => ({
      ...item
    }));
    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({
      items: newData,
      sourceBincodes: [],
      sourceBincode: '',
      targetBincode: ''
    });
  };

  /**
   * 删除一行
   */
  remove(key) {
    const { items } = this.state;
    const newData = items.filter(item => item.key !== key);
    this.setState({
      items: newData
    });
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  /**
   * 表格变化时
   * @param {*} e 
   * @param {*} fieldName 
   * @param {*} key 
   */
  handleFieldChange(e, fieldName, key) {
    const { items } = this.state;
    const newData = items.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target && e) {
      if (e.target) {
        target[fieldName] = e.target.value;
      } else {
        if (fieldName === 'article') {

          target[fieldName] = JSON.parse(e);
          // 设置拣货方案商品可调整货位
          const sourceBinOptions = [];
          if (target[fieldName].caseBin)
            sourceBinOptions.push(
              <Select.Option key={target[fieldName].caseBin} value={target[fieldName].caseBin}>
                {target[fieldName].caseBin}
              </Select.Option>
            );
          if (target[fieldName].splitBin)
            sourceBinOptions.push(
              <Select.Option key={target[fieldName].splitBin} value={target[fieldName].splitBin}>
                {target[fieldName].splitBin}
              </Select.Option>
            );

          this.setState({
            sourceBinOptions: sourceBinOptions
          });
        } else if (fieldName === 'sourceBinCode') {
          target[fieldName] = e;

          this.setState({
            sourceBincode: target[fieldName]
          })
        } else if (fieldName === 'targetBinCode') {
          target[fieldName] = e;

          this.setState({
            targetBincode: target[fieldName]
          })
        }
        else {
          target[fieldName] = e;
        }
      }
      this.setState({
        items: newData
      })
    } else {
      console.log('test');
    }
  }

  render() {
    const columns = [
      {
        title: '行号',
        dataIndex: 'line',
        key: 'line',
        width: '10%',
        render: (text, record, index) => <span>{index + 1}</span>
      },
      {
        title: '商品',
        dataIndex: 'article',
        key: 'article',
        width: '15%',
        render: (text, record) => {
          return (
            <PickSchemeArticleSelect
              value={record.article ? `[${record.article.code}]${record.article.name}` : null}
              onChange={e => this.handleFieldChange(e, 'article', record.key)}
              placeholder={'选择商品'}
              single
              style={{ width: '100%' }}
            />
          );
        }
      },
      {
        title: '来源货位',
        dataIndex: 'sourceBinCode',
        key: 'sourceBinCode',
        width: '15%',
        render: (text, record) => {
          return (
            <Select defaultValue={record.sourceBincode}
              placeholder='选择货位'
              onChange={
                e => this.handleFieldChange(e, 'sourceBinCode', record.key)
              }
            >
              {
                this.state.sourceBinOptions
              }
            </Select>
          );
        },
      },
      {
        title: '目标货位',
        dataIndex: 'targetBinCode',
        key: 'targetBinCode',
        width: '15%',
        render: (text, record) => {
          return (
            <BinSelect
              usage="PickUpBin"
              state="FREE"
              disabled={false}
              onChange={e => this.handleFieldChange(e, 'targetBinCode', record.key)}
              placeholder="请选择货位"
            />
          );
        }
      },
      {
        title: '备注',
        dataIndex: 'note',
        key: 'note',
        width: '15%',
        render: (text, record) => {
          return (
            <InputNumber
              defaultValue={record.note ? record.note : null}
              onChange={e => this.handleFieldChange(e, 'note', record.key)}
              onKeyPress={e => this.handleKeyPress(e, record.key)}
              placeholder="备注"
              style={{ width: '100%' }}
            />
          );
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return (
            <span>
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    const { loading, items, entity } = this.state;
    const rowSelection = {
      selectedRowKey: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <Fragment>
        <div style={{ float: "right" }}>
          <a>批量添加</a>&emsp;
                    <a>批量删除</a>
        </div>
        <Table
          id="abc"
          loading={loading}
          columns={columns}
          dataSource={items}
          pagination={false}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增明细
        </Button>
      </Fragment>
    );
  }
}