import React, { PureComponent } from 'react';
import { Button, Empty, Modal, Table } from 'antd';
import { queryData } from '@/services/quick/Quick';
import PowerbankModel from './PowerbankModel';
import styles from './powerbankStyles.less'

export default class PowerbankAndDtlPage extends PureComponent {
  state = {
    data: [],
    showModel: false,
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

  render() {
    const { data, showModel } = this.state
    const { billNumber } = this.props
    return (
      <div>
        {billNumber &&
          <Button type="primary" onClick={() => this.setState({ showModel: true })}>
            绑定充电宝收退
          </Button>
        }
        <div style={{ height: 'calc(100vh - 120px)', backgroundColor: 'white' }}>
          {data?.length > 0 ?
            <Table
              columns={[
                { title: '单号', dataIndex: 'ASNNO',width: 130, key: '1' },
                { title: '门店号', dataIndex: 'SUPPLIERID',width: 75, key: '2' },
                { title: '商品编号', dataIndex: 'SKU',width: 99, key: '3' },
                { title: '数量', dataIndex: 'EXPECTEDQTY',width: 60, key: '5' },
                { title: '描述', dataIndex: 'DESCR_C',width: 250, key: '4' },
                { title: '操作人', dataIndex: 'OPERATOR',width: 110, key: '6' },
                { title: '操作时间 ', dataIndex: 'OPERATIONTIME',width: 110, key: '7' },
              ]}
              dataSource={data}
              scroll={{ x: 1300 }}
              bordered
              pagination={false}           // 去掉翻页组件
            />
            :
            <Empty />
          }
        </div>

        <Modal
          visible={showModel}
          style={{ top: 0 ,width: '100vw'}}
          className={styles.powerbankModal}
          onCancel={() => this.setState({ showModel: false })}
        >
          <PowerbankModel quickuuid="v_rtn_cy" billNumber={billNumber} modelClose={this.modelClose} />
        </Modal>
      </div>
    );
  }
}
