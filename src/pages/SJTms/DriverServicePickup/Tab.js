/*
* 司机服务取货组件
*/
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, Input, message, Popconfirm, Table } from 'antd'
import React from 'react';
import { driverSvcPickup } from '@/services/sjitms/DriverCustomerService'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class extends QuickFormSearchPage {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
      successList: [],   // 成功的UUID列表
      noTable: true,     // 框架的表格不显示
      DRIVERCODE: '',   // 司机工号
    }
  }

  componentDidMount() {
    this.queryCoulumns()
    this.getCreateConfig()
    this.empInputRef?.focus() //进来直接获取司机工号输入框焦点
  }


  /** 确认取货 */
  confirmPickup = async (UUID) => {
    if (this.state.successList.includes(UUID)) return message.error('你选择的货品已经取货啦')
    const resp = await driverSvcPickup(UUID)
    if (resp.success) {
      message.success('操作成功!')
      this.setState({ successList: [...this.state.successList, UUID] })
    }
  }

  /**
   * @description 改变每一行的数据展示（这里改变颜色）
   * @param row 一行数据
   * */
  drawcell = row => {
    if (this.state.successList.includes(row.record.UUID)) {
      row.component = (
          <div style={{ backgroundColor: '#47ff00' }}>{row.val}✔</div>
      )
    }
  }


  //该方法会覆盖所有的上层按钮
  drawActionButton = () => <></>

  /** 绘制搜索 */
  drawSearchPanel = () => {
    let { isOrgQuery } = this.state
    return <div style={{ fontSize: 16, textAlign: 'center' }}>
      司机工号：
      <Input
          ref={input => (this.empInputRef = input)}
          allowClear
          value={this.state.DRIVERCODE}
          style={{ width: 250, height: 40, fontSize: 16, margin: 15 }}
          onPressEnter={() =>
              this.setState({
                pageFilters:
                    {
                      ...this.state.pageFilters, superQuery: {
                        matchType: 'and',
                        queryParams: [{
                          field: 'DRIVERCODE',
                          rule: 'eq',
                          type: 'VarChar',
                          val: this.state.DRIVERCODE, //司机代码
                        }, ...isOrgQuery],
                      }
                    }
              }, () => this.getData(this.state.pageFilters))
          }
          placeholder={'输入司机工号'}
          onChange={e => this.setState({ DRIVERCODE: e.target.value })}
      />
    </div>
  }

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () =>
      <div style={{ marginBottom: 10 }}>
        <Popconfirm
            title="确认取货?"
            onConfirm={this.confirmPickup}
            style={{ marginLeft: 10 }}
        >
          <Button type={'primary'}
                  style={{ marginLeft: 10, visibility: this.state.selectedRows.length > 0 ? 'visible' : 'hidden' }}>
            确认取货
          </Button>
        </Popconfirm>
      </div>


  /** 绘制其他组件 */
  drawOtherCom = () =>
      <div style={{ marginBottom: 10, fontSize: 55, textAlign: 'center', color: '#ff0000' }}>
        {!this.state.pageFilters?.superQuery?.queryParams?.[0]?.val ? '请输入司机工号获取数据' :
            this.state.data?.list?.length > 0 || this.props.loading ?
                <Table dataSource={this.state.data?.list}
                       pagination={false} // 设置 pagination 为 false 以去掉翻页组件
                       scroll={{ x: '100%' }}
                       columns={[
                         { title: '门店号码', width: 100, dataIndex: 'CUSTOMERCODE', key: 'CUSTOMERCODE' },
                         { title: '货物代码', width: 100, dataIndex: 'PRODUCTCODE', key: 'PRODUCTCODE' },
                         { title: '货物名称', width: 200, dataIndex: 'PRODUCTNAME', key: 'PRODUCTNAME' },
                         { title: '货位', width: 80, dataIndex: 'PRODUCTPOSITION', key: 'PRODUCTPOSITION' },
                         { title: '货物数量', width: 80, dataIndex: 'PRODUCTQUANTITY', key: 'PRODUCTQUANTITY' },
                         { title: '配送日期', width: 133, dataIndex: 'DELIVERYDATE', key: 'DELIVERYDATE' },
                         { title: '货物金额', width: 80, dataIndex: 'PRODUCTAMOUNT', key: 'PRODUCTAMOUNT' },
                         { title: '货品价格', width: 80, dataIndex: 'PRODUCTPRICE', key: 'PRODUCTPRICE' },
                         { title: '门店名称', width: 222, dataIndex: 'CUSTOMERNAME', key: 'CUSTOMERNAME' },
                         { title: '排车单号', width: 111, dataIndex: 'SCHEDULENUMBER', key: 'SCHEDULENUMBER' },
                         { title: '买单单号', width: 111, dataIndex: 'BUYNUMBER', key: 'BUYNUMBER' },
                         { title: '取货操作', width: 100, key: 'action', fixed: 'right',
                           render: (_text, record) => {
                             const { UUID } = record // 假设每行数据有一个 `uuid` 字段
                             return this.state.successList.includes(UUID) ?
                                 <Button disabled>已取货</Button>
                                 :
                                 <Button onClick={() => this.confirmPickup(UUID)} type="primary">
                                   确认取货
                                 </Button>
                           },
                         },
                       ]}
                /> :
                '工号' + this.state.pageFilters?.superQuery?.queryParams?.[0]?.val + '暂无数据\n请检查输入是否正确'}
      </div>
}