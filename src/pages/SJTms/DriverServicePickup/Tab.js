/*
* 司机服务货物交接组件
*//* eslint-disable */
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Checkbox, Input, message, Table } from 'antd'
import React from 'react';
import { driverSvcPickup, getGoodsDetailList } from '@/services/sjitms/DriverCustomerService'

export default class extends QuickFormSearchPage {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
      successObjs: {},    // 成功的UUID列表对象{uuid:成功类型,...}
      noTable: true,      // 框架的表格不显示
      driverCode: null,   // 司机工号
      teamUpToPick: false, // 是否是组队取货
      goodsList: [],       // 货品列表
      tableLoading: false,// 表格加载中
      searchText: '',     // 搜索文本（控制回车后显示表格）
    }
  }

  componentDidMount() {
    this.empInputRef?.focus() //进来直接获取司机工号输入框焦点
  }


  /** 确认取货 */
  confirmPickup = async (UUID, type) => {
    let { searchText, successObjs } = this.state
    if (this.state.successObjs[UUID]) return message.warn('你选择的货品已经取货啦')
    // take代表司机                                                                             1交货 2收货
    const resp = await driverSvcPickup(UUID, type === '已交货' ? 1 : 2, searchText)
    if (resp.success) {
      message.success('操作成功!')
      this.setState({ successObjs: { ...successObjs, [UUID]: type } })
    }
  }

  /** 获取货品列表 */
  getGoodsDetails = async () => {
    const { driverCode, teamUpToPick } = this.state
    if (driverCode) {
      this.setState({ tableLoading: true })
      const resp = await getGoodsDetailList(driverCode, teamUpToPick ? '1' : '0')
      this.setState({ goodsList: resp.data ?? [], tableLoading: false, successObjs: {} ,driverCode:''})

    }
  }


  //该方法会覆盖所有的上层按钮
  drawActionButton = () => <></>

  /** 绘制搜索 */
  drawSearchPanel = () => {
    return <div style={{ fontSize: 16, textAlign: 'center' }}>
      司机工号：
      <Input
        ref={input => (this.empInputRef = input)}
        allowClear
        value={this.state.driverCode}
        style={{ width: 250, height: 40, fontSize: 16, margin: 15 }}
        onPressEnter={() =>
          this.setState({
            searchText: this.state.driverCode+'',
            successList: []   // 清空成功列表
          }, () => this.getGoodsDetails())
        }
        placeholder={'输入司机工号'}
        onChange={e =>
          this.setState({ driverCode: e.target.value, searchText: null })
        }
      />


      {/* 是否组队取货勾选框 */}
      <Checkbox style={{ fontSize: 16 }}
        checked={this.state.teamUpToPick}
        onChange={e => {
          this.setState({ teamUpToPick: e.target.checked, goodsList: [], driverCode: null })
        }}
      >
        组队取货
      </Checkbox>
    </div>
  }

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => <></>

  /** 绘制组件 */
  drawOtherCom = () => {
    const { searchText, goodsList, tableLoading, successObjs, teamUpToPick } = this.state;
    return <div style={{ marginBottom: 10, fontSize: 55, textAlign: 'center', color: '#ff0000' }}>
      {!searchText ?
        '请输入司机工号获取数据' :
        goodsList?.length > 0 || tableLoading ?
          <Table dataSource={goodsList || []}
            loading={tableLoading}
            scroll={{ x: '100%' }}
            pagination={false}           // 去掉翻页组件
            columns={[
              {
                title: '门店', width: 300, dataIndex: 'storecode', key: 'store',
                render: (val, { storename }) => { return <span>{`[${val}]${storename}`}</span> }
              },
              {
                title: '货物', width: 300, dataIndex: 'articlecode', key: 'article',
                render: (val, { articlename }) => { return <span>{`[${val}]${articlename}`}</span> }
              },
              { title: '货品价格', width: 80, dataIndex: 'price', key: 'price' },
              { title: '货物数量', width: 80, dataIndex: 'qty', key: 'qty' },
              { title: '货物金额', width: 80, dataIndex: 'amount', key: 'amount' },
              { title: '货位', width: 88, dataIndex: 'pickbin', key: 'pickbin' },
              { title: '配送日期', width: 160, dataIndex: 'deliverydate', key: 'deliverydate' },
              { title: '排车单号', width: 111, dataIndex: 'schedulenumber', key: 'schedulenumber' },
              { title: '买单单号', width: 111, dataIndex: 'buynumber', key: 'buynumber' },
              {
                title: '货物操作', width: 100, key: 'action', fixed: 'right', align: 'center',
                render: (_text, { uuid, istakedelivery }) => {
                  const successObj = successObjs[uuid];
                  if (successObjs[uuid]) {
                    return <Button disabled>{successObj}</Button>;
                  }
                  if (istakedelivery === 1) {
                    return <Button onClick={() => this.confirmPickup(uuid, '已交货')} type="primary">
                      司机交货
                    </Button>
                  }
                  if (istakedelivery === 2) {
                    return <Button onClick={() => this.confirmPickup(uuid, '已收货')} type="primary">
                      司机收货
                    </Button>
                  }
                }
              }
            ]}
          /> :
          <div>
            {teamUpToPick && searchText ?
              '工号' + searchText + '未发现有可组队取货的货品'
              : teamUpToPick ?
                '请输入同队司机工号获取数据'
                : searchText ?
                  '工号' + searchText + '暂无未取货数据\n请检查输入是否正确'
                  : '请输入司机工号获取数据!'
            }
          </div>
      }
    </div>
  }
}
