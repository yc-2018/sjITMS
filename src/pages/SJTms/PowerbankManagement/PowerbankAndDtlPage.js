/**
 * 充电宝收发管理主页，参考的是粤通卡的发放与回收
 * @author ChenGuangLong
 * @since 2024/7/15 11:55
 */
import React, { PureComponent } from 'react'
import { Layout, Row, Col, Card, Drawer, message } from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import SearchPage from './PowerbankSearchPage'
import DtlPage from './PowerbankDtlPage'
import { dynamicQuery } from '@/services/quick/Quick'

const { Content, Sider } = Layout
export default class PowerbankAndDtlPage extends PureComponent {
  bindableChargePads = [];  // 充电宝可绑定的排车单状态列表

  state = {
    selectRows: {},
    openDrawer: false,
    isBind: false,      // 是否可绑定
  }


  componentDidMount () {
    this.getDict()
  };

  /**
   * 获取字典 哪些排车单状态可绑定哪些不能绑定
   * @author ChenGuangLong
   * @since 2024/8/30 16:22
  */
  getDict = async () => {
    const queryParamsJson = {
      tableName: 'V_SYS_DICT_ITEM',
      condition: {
        params: [{ field: 'DICT_CODE', rule: 'eq', val: ['bindableChargePads'] }],
      },
    };
    const response = await dynamicQuery(queryParamsJson);
    if (response.success) {
      this.bindableChargePads = response.result.records
    }else message.error(response.message)
  }

  /**
   * 处理列点击事件
   * @author ChenGuangLong
   * @since 2024/8/30 16:40
  */
  handleOnClickRow = rows => {
    if (rows.length > 0) {
      const find = this.bindableChargePads.find(item => item.NAME === rows[0].STAT)
      if (find) this.setState({ isBind: find.VALUE === '1' })
      else {
        this.setState({ isBind: false })
        message.error('未获取到字典对应排车单状态,请联系维护人员')
      }
    }

    this.setState({ selectRows: rows[0], openDrawer: rows.length > 0 })
  }

  render () {
    const { selectRows, openDrawer, isBind } = this.state
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>

          {/* ————————————左侧主表———————— */}
          <Content>
            <SearchPage
              quickuuid="v_sj_itms_powerbank_management"
              refreshSelectedRow={this.handleOnClickRow}
            />
          </Content>

          {/* ————————————右侧明细表———————— */}
          <Drawer
            placement="right"
            closable={false}
            onClose={() => this.setState({ openDrawer: false })}
            visible={openDrawer}
            width="70%"
          >
            <Sider width="100%" theme="light">
              <Row gutter={[0, 1]}>
                <Col>
                  <Card title={<b>收退管理明细 {selectRows?.BILLNUMBER}</b>} bodyStyle={{ padding: 5 }}>
                    <DtlPage billNumber={selectRows?.BILLNUMBER} isBind={isBind} />
                  </Card>
                </Col>
              </Row>
            </Sider>
          </Drawer>

        </Layout>
      </PageHeaderWrapper>
    )
  }
}
