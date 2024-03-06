/*
* 司机服务取货组件
*/
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, Checkbox, Col, Input, message, Popconfirm, Row, Table } from 'antd'
import React from 'react';
import { driverSvcPickup } from '@/services/sjitms/DriverCustomerService'
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class extends QuickFormSearchPage {
  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
      successObjs: {},   // 成功的UUID列表
      noTable: true,     // 框架的表格不显示
      takecode: '',      // 司机工号
      teamUpToPick:false //是否是组队取货
    }
  }

  componentDidMount() {
    this.queryCoulumns()
    this.getCreateConfig()
  }


  /** 确认取货 */
  confirmPickup = async (UUID,type) => {
    let { takecode, successObjs } = this.state
    if (this.state.successObjs[UUID]) return message.error('你选择的货品已经取货啦')
    // take代表司机                                                                             1交货 2收货
    const resp = await driverSvcPickup( UUID, type === '已交货' ? 1 : 2, takecode)
    if (resp.success) {
      message.success('操作成功!')
      this.setState({ successObjs: {...successObjs,  [UUID] : type}})
    }
  }




  //该方法会覆盖所有的上层按钮
  drawActionButton = () => <></>

  /** 绘制搜索 */
  drawSearchPanel = () => {
    let { isOrgQuery,teamUpToPick } = this.state
    return <div style={{ fontSize: 16, display:'flex',justifyContent:'center',alignItems:'center',position:'relative'}}>
      司机工号：
      <SimpleAutoComplete
        value={this.state.takecode}
        placeholder={'输入司机工号'}
        textField="CODE"
        valueField={'CODE'}
        queryParams={{ tableName: 'sj_itms_employee', 'selects ': ['CODE', 'NAME','DEPARTMENT'] }}
        searchField="CODE,NAME,DEPARTMENT"
        showSearch={true}
        autoComplete
        style={{width: 250, height: 40, fontSize: 16, margin: 15,display: 'inline-block',top:6}}
        onChange={value => {
          this.setState({ takecode: value.value ,
            pageFilters:
              {
                ...this.state.pageFilters, superQuery: {
                  matchType: 'and',
                  queryParams: [{
                    field: teamUpToPick ? 'DRIVERDEPT':'DRIVERCODE',//部门或司机代码
                    rule: 'eq',
                    type: 'VarChar',
                    val: teamUpToPick ? value.record.DEPARTMENT : value.value //部门或司机代码
                  }, ...isOrgQuery],
                }
              },
            successObjs: {}   // 清空成功列表
             }, () => this.getData(this.state.pageFilters));
        }}
      />

      {/* 是否组队取货勾选框 */}
      <Checkbox style={{fontSize:16}}
                checked={this.state.teamUpToPick}
                onChange={e => {
                  this.setState({ teamUpToPick: e.target.checked, data: {}, takecode: '' })}}
      >
        组队取货
      </Checkbox>
    </div>
  }

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => <></>

  /** 绘制组件 */
  drawOtherCom = () =>
      <div style={{ marginBottom: 10, fontSize: 55, textAlign: 'center', color: '#ff0000' }}>
        {!this.state.pageFilters?.superQuery?.queryParams?.[0]?.val ?
            '请输入司机工号获取数据' :
            this.state.data?.list?.length > 0 || this.props.loading ?
                <Table dataSource={this.state.data?.list}
                       loading={this.props.loading}
                       scroll={{ x: '100%' }}
                       pagination={false}           // 去掉翻页组件
                       columns={[
                         { title: '门店号码', width: 100, dataIndex: 'CUSTOMERCODE',    key: 'CUSTOMERCODE' },
                         { title: '货物代码', width: 100, dataIndex: 'PRODUCTCODE',     key: 'PRODUCTCODE' },
                         { title: '货物名称', width: 200, dataIndex: 'PRODUCTNAME',     key: 'PRODUCTNAME' },
                         { title: '货位',    width: 88,  dataIndex: 'PRODUCTPOSITION', key: 'PRODUCTPOSITION' },
                         { title: '货物数量', width: 80,  dataIndex: 'PRODUCTQUANTITY', key: 'PRODUCTQUANTITY' },
                         { title: '配送日期', width: 160, dataIndex: 'DELIVERYDATE',    key: 'DELIVERYDATE' },
                         { title: '货物金额', width: 80,  dataIndex: 'PRODUCTAMOUNT',   key: 'PRODUCTAMOUNT' },
                         { title: '货品价格', width: 80,  dataIndex: 'PRODUCTPRICE',    key: 'PRODUCTPRICE' },
                         { title: '门店名称', width: 222, dataIndex: 'CUSTOMERNAME',    key: 'CUSTOMERNAME' },
                         { title: '排车单号', width: 111, dataIndex: 'SCHEDULENUMBER',  key: 'SCHEDULENUMBER' },
                         { title: '买单单号', width: 111, dataIndex: 'BUYNUMBER',       key: 'BUYNUMBER' },
                         { title: '取货操作', width: 200, key: 'action', fixed: 'right',
                           render: (_text, { UUID }) => {
                             const successObj = this.state.successObjs[UUID]
                             return successObj ?
                                 <Button disabled>{successObj}</Button> :
                               <>
                                 <Button onClick={() => this.confirmPickup(UUID,"已交货")} type="primary">
                                   确认交货</Button>&nbsp;
                                 <Button onClick={() => this.confirmPickup(UUID,"已收货")} type="primary">
                                   确认收货</Button>
                               </>
                           }
                         }
                       ]}
                /> : this.state.teamUpToPick && this.state.takecode ? '工号' + this.state.takecode + '未发现有可组队取货的货品' :
                this.state.teamUpToPick?'请输入同队司机工号获取数据':
              this.state.takecode?'工号' + this.state.takecode + '暂无未取货数据\n请检查输入是否正确':'请输入司机工号获取数据'
        }
      </div>
}