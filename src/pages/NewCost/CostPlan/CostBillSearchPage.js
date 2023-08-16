/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-09 14:08:13
 * @version: 1.0
 */
import React from 'react';
import { Form, Button, Layout, Empty, Row, Col, Card, Icon, Modal } from 'antd';
import { connect } from 'dva';
import Page from '@/pages/Component/Page/inner/Page';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { DndProvider } from 'react-dnd';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import { dynamicQuery } from '@/services/quick/Quick';
import CostBillViewForm from '@/pages/NewCost/CostBill/CostBillViewForm';

const { Header, Footer, Content } = Layout;

@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    selectCords: [],
    billState: [],
    e: {},
    isModalVisible: false,
    accessoryModal: false,
  };

  changeState = () => {
    this.searchDict();
  };

  searchDict = async () => {
    const queryData = {
      tableName: 'V_SYS_DICT_ITEM',
      condition: { params: [{ field: 'DICT_CODE', rule: 'eq', val: ['costState'] }] },
    };
    await dynamicQuery(queryData).then(e => {
      this.setState({ billState: e.result.records });
    });
  };

  //绘制上方按钮
  drawActionButton = () => {
    return (
      <>
        <Button
          onClick={() => {
            this.props.switchTab('query');
          }}
        >
          返回
        </Button>
      </>
    );
  };

  drowe = () => {
    const { selectCords, data } = this.state;
    return data.length != 0 && data?.list.length > 0 ? (
      <div>
        <Row
          children={data.list.map(e => {
            let color = selectCords?.includes(e.UUID) ? 'skyblue' : '';
            return (
              <Col style={{ paddingBottom: 15 }} span={6}>
                <Card
                  hoverable
                  key={e.UUID}
                  bodyStyle={{ padding: '15px 10px 10px', backgroundColor: color }}
                  style={{ width: '90%', border: '0.5px solid #3B77E3' }}
                  onClick={() => {
                    if (selectCords.includes(e.UUID)) {
                      let selectCord = selectCords.filter(x => x != e.UUID);
                      this.setState({ selectCords: selectCord });
                    } else {
                      let selectCord = [...selectCords];
                      selectCord.push(e.UUID);
                      this.setState({ selectCords: selectCord });
                    }
                  }}
                >
                  {this.drawBody(e)}
                </Card>
              </Col>
            );
          })}
        />
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </div>
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  drawBody = e => {
    const { billState } = this.state;
    const stateDict = billState.find(x => x.VALUE == e.STATE);
    return (
      <div>
        <Row style={{ height: '30px' }} align="bottom">
          <Col
            span={20}
            style={{
              fontWeight: 'bolder',
              fontSize: '18px',
            }}
          >
            {e.TITLE}
          </Col>
          <Col
            span={4}
            style={{
              width: '60px',
              height: '60px',
              transform: 'rotate(0.1turn)',
              border: 'solid 2px' || stateDict?.TEXT_COLOR,
              borderRadius: '100%',
              textAlign: 'center',
              color: stateDict?.TEXT_COLOR,
              fontSize: '16px',
              fontWeight: 'bold',
              lineHeight: '30px',
              right: '10px',
              bottom: '-20px',
              position: 'absolute',
            }}
          >
            <Col style={{ bottom: '-10px' }}>{e.STATE_CN}</Col>
          </Col>
        </Row>
        <Row>
          <Col>
            单号：
            {e.BILL_NUMBER}
          </Col>
        </Row>
        <Row style={{ float: 'right', marginTop: '20px' }}>
          <Button onClick={() => this.checkDtl(e)} style={{ margin: '0px 10px' }}>
            查看台账
          </Button>

          <Button onClick={() => this.accessoryModalShow(true, e)}>
            <Icon type="upload" />
            附件
          </Button>
        </Row>
      </div>
    );
  };

  checkDtl = e => {
    // console.log('this.state', this.state);
    this.setState({ isModalVisible: true, e });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  accessoryModalShow = (isShow, e) => {
    if (e != 'false' && e.ACCESSORY_NAME) {
      let downloadsName = e.ACCESSORY_NAME.split(',');
      let downloads = [];
      downloadsName.map(c => {
        let param = {
          download: c,
          uuid: e.UUID,
        };
        downloads.push(param);
      });
      // this.setState({ downloads: downloads });
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads });
    } else {
      // this.setState({ downloads: [] });
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads: [] });
    }
  };

  drawPage = () => {
    const { e, isModalVisible } = this.state;
    const layout = {
      width: '100%',
      height: '90%',
      backgroundColor: '#ffffff',
    };
    return (
      <div>
        <NavigatorPanel title={this.state.title} action={this.drawActionButton()} />
        <Layout style={layout}>
          <Header style={{ backgroundColor: '#ffffff', height: '10%', marginTop: '1%' }}>
            {this.drawSearchPanel ? this.drawSearchPanel() : ''}
          </Header>
          <Content style={{ overflow: 'auto', height: '20%' }}>{this.drowe()}</Content>
        </Layout>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(70vh)', overflowY: 'auto' }}
        >
          <CostBillViewForm
            key={e.UUID}
            showPageNow="query"
            quickuuid="123"
            {...e}
            {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>
      </div>
    );
  };

  render() {
    let ret = (
      <PageHeaderWrapper>
        <Page withCollect={true}>{this.drawPage()}</Page>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
