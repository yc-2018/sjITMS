import React, { PureComponent } from 'react';
import { Button, Empty, message, Modal, Popconfirm, Table } from 'antd'
import { dynamicDelete, queryData } from '@/services/quick/Quick'
import PowerbankModel from './PowerbankModel';
import styles from './powerbankStyles.less'

export default class PowerbankAndDtlPage extends PureComponent {
  state = {
    data: [],
    showModel: false,
    storeCodeList:[], // 排车单门店代码列表
  }

  /**
   * 排车单号变化时，获取对应数据
   * @author ChenGuangLong
   * @since 2024/7/13 16:42
  */
  componentDidUpdate(prevProps) {
    if (prevProps.billNumber !== this.props.billNumber) {
      this.setState({ data: [] }, this.getData)
    }
  }

  /**
   * 获取对应的数据
   * @author ChenGuangLong
   * @since 2024/7/13 16:49
  */
  getData = () => {
    const params = {
      pageSize: 100,
      page: 1,
      quickuuid: 'sj_itms_powerbank_management',
      superQuery: {
        matchType: 'and',
        queryParams: [{ field: 'BILLNUMBER', type: 'VarChar', rule: 'eq', val: this.props.billNumber }]
      }
    }
    queryData(params).then(res => {
      if (res?.data?.records) this.setState({ data: res?.data?.records })
      else this.setState({ data: [] })
    })
  }

  /**
   * 给弹窗关闭，和刷新数据
   * @param isGetData{boolean} 是否刷新数据
   * @author ChenGuangLong
   * @since 2024/7/13 17:51
   */
  modelClose = (isGetData = false) => {
    this.setState({ showModel: false })
    if (isGetData) this.getData()
  }

  /**
   * 充电宝收退单解除关联排车单
   * @author ChenGuangLong
   * @since 2024/7/15 16:16
  */
  removeAssociation = async (uuid) => {
    const result = await dynamicDelete({
      code: 'sj_itms_powerbank_management',
      params: [{
        tableName: 'sj_itms_powerbank_management',
        condition: { params: [{ field: 'UUID', rule: 'eq', val: [uuid] }] },
        deleteAll: 'false'
      }]
    })
    if (result.success) {
      message.success('解除关联成功')
      this.getData()                        // 刷新数据
      window.PowerbankSearchPage.onSearch() // 刷新主表
    }
  }

  /**
   * 打开关联充电宝收退单
   * @author ChenGuangLong
   * @since 2024/8/13 16:10
   */
  openPowerBankModel = async () => {
    const { billNumber } = this.props
    // 先打开弹窗
    this.setState({ showModel: true })
    // 获取排车单明细
    const params = {
      pageSize: 100,
      page: 1,
      quickuuid: 'sj_itms_schedule_order',
      superQuery: {
        matchType: 'and',
        queryParams: [
          { field: 'BILLNUMBER', type: 'VarChar', rule: 'eq', val: billNumber },
        ]
      }
    }
    const searchResult = await queryData(params)
    if (searchResult?.data?.records?.length > 0) {
      // 【去重】拿到排车单门店代码
      const storeCodeList = [...new Set(searchResult.data.records.map(item => item.DELIVERYPOINTCODE))]
      this.setState({ storeCodeList })
    } else {
      this.setState({ storeCodeList: [] })
      message.error(`该排车单明细数据为空???`, 5)
    }
  }

  render() {
    const { data, showModel, storeCodeList } = this.state
    const { billNumber, isBind } = this.props
    return (
      <div>
        {billNumber && isBind &&
          <Button type="primary" onClick={this.openPowerBankModel} style={{ margin: 5 }}>
            关联充电宝收退单
          </Button>
        }
        {!isBind && <Button disabled style={{ margin: 5 }}>发运后不能关联再充电宝收退单</Button>}

        <div style={{ height: 'calc(100vh - 222px)', backgroundColor: 'white' }}>
          {data?.length > 0 ?
            <Table
              columns={[
                { title: '单号', dataIndex: 'ASNNO',width: 120, key: '1' },
                { title: '门店号', dataIndex: 'SUPPLIERID',width: 70, key: '2' },
                { title: '商品编号', dataIndex: 'SKU',width: 90, key: '3' },
                { title: '数量', dataIndex: 'EXPECTEDQTY',width: 60, key: '5' },
                { title: '描述', dataIndex: 'DESCR_C',width: 250, key: '4' },
                { title: '操作人', dataIndex: 'OPERATOR',width: 100, key: '6' },
                { title: '操作时间 ', dataIndex: 'OPERATIONTIME',width: 110, key: '7' },
                { title: '操作', key: 'operation', fixed: 'right', width: 110,align:'center',
                  render: item =>
                    <Popconfirm title="确定解除关联吗？" onConfirm={() => this.removeAssociation(item.UUID)}>
                      <Button>解除关联</Button>
                    </Popconfirm>
                }
              ]}
              dataSource={data}
              scroll={{ x: true, y: 500 }}  // 设置可滚动的宽高
              bordered                      // 边框
              pagination={false}            // 去掉翻页组件
            />
            :
            <Empty />
          }
        </div>

        <Modal
          visible={showModel}
          style={{ top: '2vh' }}
          className={styles.powerbankModal}
          footer={<Button onClick={() => this.setState({ showModel: false })}>返回</Button>}
          onCancel={() => this.setState({ showModel: false })}
        >
          <PowerbankModel
            quickuuid="v_rtn_cy"
            billNumber={billNumber}
            modelClose={this.modelClose}
            storeCodeList={storeCodeList}
          />
        </Modal>
      </div>
    );
  }
}
