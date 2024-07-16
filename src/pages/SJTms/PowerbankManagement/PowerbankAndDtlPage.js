/**
 * 充电宝收发管理主页，参考的是粤通卡的发放与回收
 * @author ChenGuangLong
 * @since 2024/7/15 11:55
 */
import React, { PureComponent } from 'react'
import { Layout, Row, Col, Card } from 'antd'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import SearchPage from './PowerbankSearchPage'
import DtlPage from './PowerbankDtlPage'

const { Content, Sider } = Layout
export default class PowerbankAndDtlPage extends PureComponent {
  state = {
    selectRows: {},
  }

  render () {
    const { selectRows } = this.state
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>

          {/* ————————————左侧主表———————— */}
          <Content>
            <SearchPage
              quickuuid="v_sj_itms_powerbank_management"
              refreshSelectedRow={row => this.setState({ selectRows: row[0] })}
            />
          </Content>

          {/* ————————————右侧明细表———————— */}
          <Sider width="60%" theme="light">
            <Row gutter={[0, 1]}>
              <Col>
                <Card title={<b>收退管理明细 {selectRows?.BILLNUMBER}</b>} bodyStyle={{ padding: 5 }}>
                  <DtlPage billNumber={selectRows?.BILLNUMBER} />
                </Card>
              </Col>
            </Row>
          </Sider>

        </Layout>
      </PageHeaderWrapper>
    )
  }
}
