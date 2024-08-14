/**
 * 电宝wms数据弹窗搜索绑定页面
 */

import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, message } from 'antd'
import React from 'react';
import { saveFormData } from '@/services/quick/Quick'
import GetUUID from '@/utils/getUUID'
import getCurrentDateTime from '@/utils/getCurrentDateTime'
import { loginUser } from '@/utils/LoginContext'

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



  /** 监控门店变化变化 去改变搜索 */
  componentWillReceiveProps(nextProps) {
    // 检查 父组件传过来的门店号列表 是否发生变化 且 不是空列表，就重置查询条件并查询
    if (this.props.storeCodeList !== nextProps.storeCodeList && nextProps.storeCodeList.length > 0) {
      let {queryConfig}=this.state;
      let creatorCol = queryConfig.columns.find(x => x.fieldName === 'SUPPLIERID');
      creatorCol.searchDefVal = nextProps.storeCodeList.join('||');
      this.setState({queryConfigColumns:queryConfig.columns,queryConfig,pageFilters:{}});
      window.setTimeout(() => {
        this.onSearch('reset')  // 重置查询条件。 在 SearchForm.js组件中有this.props.form.resetFields();没对外提供，导致对外显示的值没有变
        document.querySelectorAll('.v_rtn_cy-SearchForm button')?.[1]?.click() // 点击重置按钮
        this.onSearch()               // 查询数据
      }, 100)
    }
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

    // ---------------------------再请求添加------------------------------
    const user = loginUser()                             // 拿到操作人
    const OPERATOR = `[${user.code}]${user.name}` // [工号]操作人名

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
    const { storeCodeList } = this.props;
    return (
      <div style={{ marginBottom: 10 }}>
        <Button type="primary" loading={loading} style={{ marginLeft: 10 }} onClick={this.confirmSubmission}>
          数据绑定 {this.props.billNumber}
        </Button>

        <span>{storeCodeList?.length ? `当前排车单包涵门店：${storeCodeList.join('、')}`:''}</span>
      </div>
    )
  }
}
