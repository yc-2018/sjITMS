/**
 * 电宝wms数据弹窗搜索绑定页面
 */

import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, message } from 'antd'
import React from 'react';
import { queryData, saveFormData } from '@/services/quick/Quick'
import GetUUID from '@/utils/getUUID'
import getCurrentDateTime from '@/utils/getCurrentDateTime'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerLessBuy extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,      // 继承父组件的state
      tableHeight: 480,   // [fu]表格高度
      isNotHd: true,      // [fu]是没有最外层的边框收藏
      loading: false,     // 绑定按钮加载中
    };
  }

  changeState = () => {
    this.setState({ title: '充电宝退收单数据关联页' });
  };

  /**
   * 电宝数据绑定确认
   * @author ChenGuangLong
   * @since 2024/7/13 17:53
  */
  confirmSubmission = async () => {
    let { selectedRows } = this.state
    if (selectedRows?.length === 0) return message.warning('请先选择要绑定的数据！')
    this.setState({ loading: true })
    // ------------------------先查询有没有重复的------------------------------
    // const params = {
    //   pageSize: 100,
    //   page: 1,
    //   quickuuid: 'sj_itms_powerbank_management',
    //   superQuery: {
    //     matchType: 'and',
    //     queryParams: [
    //       { field: 'ASNNO', type: 'VarChar', rule: 'in', val: selectedRows.map(item => item.ASNNO).join('||') },
    //       { field: 'SKU', type: 'VarChar', rule: 'in', val: selectedRows.map(item => item.SKU).join('||') }
    //     ]
    //   }
    // }
    // const searchResult = await queryData(params)
    // if (searchResult?.data?.records?.length > 0) {
    //   const str = searchResult.data.records.map(item => `${item.ASNNO}商品:${item.SKU}已被排车单${item.BILLNUMBER}绑定`).join(`、`)
    //   return message.warning(`请勿重复绑定！->${str}`, 5)
    // }

    // ————————————————————————判断选择的门店是否都在排车单明细门店里面————————————————————
    const params = {
      pageSize: 100,
      page: 1,
      quickuuid: 'sj_itms_schedule_order',
      superQuery: {
        matchType: 'and',
        queryParams: [
          { field: 'BILLNUMBER', type: 'VarChar', rule: 'eq', val: this.props.billNumber },
        ]
      }
    }
    const searchResult = await queryData(params)
    if (searchResult?.data?.records?.length > 0) {
      // 【去重】拿到排车单门店代码 （去掉中文提高容错率） 再拿到充电宝明细门店代码 在判断充电宝的是否是排车单的子集
      const storeCodePCD = [...new Set(searchResult.data.records.map(item => item.DELIVERYPOINTCODE.replace(/[\u4e00-\u9fff]+/g, '')))]
      const storeCodeCDB = [...new Set(selectedRows.map(item => item.SUPPLIERID.replace(/[\u4e00-\u9fff]+/g, '')))]
      let pass = true
      for (let i = 0; i < storeCodeCDB.length; i++) {
        if (!storeCodePCD.includes(storeCodeCDB[i])) {
          message.warning(`充电宝明细门店${storeCodeCDB[i]}不在排车单明细门店里面,请检查`, 5)
          pass = false
        }
      }
      if (!pass) return this.setState({ loading: false })
    } else return this.setState({ loading: false }) || message.error(`该排车单明细数据为空???`, 5)


    // ---------------------------再请求添加------------------------------
    const localhostUser = JSON.parse(localStorage.getItem('localhost-user'))
    const OPERATOR = `[${localhostUser.code}]${localhostUser.name}` // 拿到操作人

    const result = await saveFormData({
      code: 'sj_itms_powerbank_management',
      entity: {
        sj_itms_powerbank_management:          // 🔴注意，这里的必须和低代码的对应上 大小写都要对应上
          selectedRows.map(item => ({          // 🔴注意，这里的字段必须和低代码的对应上
            UUID: GetUUID(),
            BILLNUMBER: this.props.billNumber,
            ASNNO: item.ASNNO,
            SUPPLIERID: item.SUPPLIERID,
            SKU: item.SKU,
            DESCR_C: item.DESCR_C,
            EXPECTEDQTY: item.EXPECTEDQTY,
            OPERATOR,
            OPERATIONTIME: getCurrentDateTime(),
          }))
      }
    })
    this.setState({ loading: false })

    if (result.success) {
      message.success('绑定成功！')
      this.onSearch()                        // 刷新弹窗绑定表（不然刚刚绑定完了还会在列表显示)
      window.PowerbankSearchPage.onSearch()  // 刷新主表
      this.props.modelClose(true)            // 刷新明细并关闭弹窗
      this.setState({ selectedRows: [] })
    }
  };

  /** 该方法会覆盖所有的上层按钮 */
  drawActionButton = () => {};

  /** 该方法会覆盖所有的中间功能按钮 */
  drawToolbarPanel = () => {
    const { loading } = this.state;
    return (
      <div style={{ marginBottom: 10 }}>
        <Button type="primary" loading={loading} style={{ marginLeft: 10 }} onClick={this.confirmSubmission}>
          数据绑定 {this.props.billNumber}
        </Button>
      </div>
    )
  }


}
