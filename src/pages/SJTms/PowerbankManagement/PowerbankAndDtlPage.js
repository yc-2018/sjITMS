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


  /** 刷新 */
  refreshSelectedRow = row => {
    this.setState({ selectRows: row[0] })
  }

  render () {
    const { selectRows } = this.state
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Content>
            <SearchPage
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="v_sj_itms_powerbank_management"
              row={this.state.row}
            />
          </Content>
          <Sider width="60%">
            <Row gutter={[0, 8]}>
              <Col>
                <Card title={<b>收退管理明细 {selectRows?.BILLNUMBER}</b>}>
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
