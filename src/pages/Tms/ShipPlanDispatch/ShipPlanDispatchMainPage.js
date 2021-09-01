import { connect } from 'dva';
import { Fragment, PureComponent ,Suspense} from 'react';
import { Row, Col, Tabs,Card ,Tag,Form,Table,Checkbox,Collapse} from 'antd';
import { formatMessage } from 'umi/locale';

const { TabPane } = Tabs;
const { Panel } = Collapse;

@connect(({ shipPlanDispatch, loading }) => ({
    shipPlanDispatch,
    loading: loading.models.shipPlanDispatch,
}))
@Form.create()
export default class ShipPlanDispatchMainPage extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: '排车看板',
        };
    }

    render() {
        const columns = [
        {
            title: '来源组织',
            dataIndex: 'dc',
        },
        {
            title:'配送',
            children: [
                {
                    title: '任务量',
                    dataIndex: 'deliveryTaskCount',
                },
                {
                    title: '统计信息',
                    children:[
                        {
                            title: '金额',
                            dataIndex: 'deliveryTaskAmount',
                        },
                        {
                            title: '重量',
                            dataIndex: 'deliveryTaskWeight',
                        },
                        {
                            title: '体积',
                            dataIndex: 'deliveryTaskVolume',
                        }
                    ]
                },
                {
                    title: '勾选',
                    render: (text, record) => (
                        <Checkbox />
                      ),
                }

            ]
        },
        {
            title:'退仓',
            children: [
                {
                    title: '任务量',
                    dataIndex: 'rtnTaskCount',
                },
                {
                    title: '统计信息',
                    children:[
                        {
                            title: '金额',
                            dataIndex: 'rtnTaskAmount',
                        },
                        {
                            title: '重量',
                            dataIndex: 'rtnTaskWeight',
                        },
                        {
                            title: '体积',
                            dataIndex: 'rtnTaskVolume',
                        }
                    ]
                },
                {
                    title: '勾选',
                    render: (text, record) => (
                        <Checkbox />
                      ),
                }

            ]
        },
        {
            title:'调拨',
            children: [
                {
                    title: '任务量',
                    dataIndex: 'transferCount',
                },
                {
                    title: '统计信息',
                    children:[
                        {
                            title: '金额',
                            dataIndex: 'transferTaskAmount',
                        },
                        {
                            title: '重量',
                            dataIndex: 'transferTaskWeight',
                        },
                        {
                            title: '体积',
                            dataIndex: 'transferTaskVolume',
                        }
                    ]
                },
                {
                    title: '勾选',
                    render: (text, record) => (
                        <Checkbox />
                      ),
                }

            ]
        },
        {
            title:'转运',
            children: [
                {
                    title: '任务量',
                    dataIndex: 'transportTaskCount',
                },
                {
                    title: '统计信息',
                    children:[
                        {
                            title: '金额',
                            dataIndex: 'transportTaskAmount',
                        },
                        {
                            title: '重量',
                            dataIndex: 'transportTaskWeight',
                        },
                        {
                            title: '体积',
                            dataIndex: 'transportTaskVolume',
                        }
                    ]
                },
                {
                    title: '勾选',
                    render: (text, record) => (
                        <Checkbox />
                      ),
                }

            ]
        }
        ];

        const deliveryData = [
            {
              key: '1',
              dc:'配送中心01',
              deliveryTaskCount: 20,
              deliveryTaskAmount: 899302.12,
              deliveryTaskWeight:232,
              deliveryTaskVolume:213,
              rtnTaskCount: 0,
              rtnTaskAmount: 899302.12,
              rtnTaskWeight:232,
              rtnTaskVolume:213,
              transportTaskCount: 6,
              transportTaskAmount: 899302.12,
              transportTaskWeight:232,
              transportTaskVolume:213,
              transferCount: 0,
              transferTaskAmount: 899302.12,
              transferTaskWeight:232,
              transferTaskVolume:213,
            },
            {
                key: '2',
                dc:'配送中心02',
                deliveryTaskCount: 20,
                deliveryTaskAmount: 899302.12,
                deliveryTaskWeight:232,
                deliveryTaskVolume:213,
                rtnTaskCount: 0,
                rtnTaskAmount: 899302.12,
                rtnTaskWeight:232,
                rtnTaskVolume:213,
                transportTaskCount: 6,
                transportTaskAmount: 899302.12,
                transportTaskWeight:232,
                transportTaskVolume:213,
                transferCount: 0,
                transferTaskAmount: 899302.12,
                transferTaskWeight:232,
                transferTaskVolume:213,
            },
          ];

        const taskColumns = [
            {
            title:'任务信息',
            children :[
            {
                title:'来源组织',
                dataIndex:'fromOrg',
            },{
                title:'目标组织',
                dataIndex:'toOrg',
            },
            {
                title:'任务类型',
                dataIndex:'taskType',
            },
            ]
        },
        {
            title:'配送信息',
            children :[
            {
                title:'门店线路',
                dataIndex:'storeSerialArchLine',
            },{
                title:'码头集',
                dataIndex:'dockerGroup',
            },
            {
                title:'业务信息',
                dataIndex:'logisticMode',
            },
            {
                title:'拣货进度',
                dataIndex:'pickUpProgress',
            },
            ]
        },
        {
            title:'任务量',
            children :[
            {
                title:'金额(万)',
                dataIndex:'amount',
            },{
                title:'重量(kg)',
                dataIndex:'weight',
            },
            {
                title:'体积(m3)',
                dataIndex:'volumn',
            },
            ]
        },
        {
            title:'状态',
            dataIndex:'shipState'
        }
        ];

        const taskData = [
            {
                fromOrg:'[8027]配送中心',
                toOrg:'[3355]庆春路店',
                taskType:'配送',
                storeSerialArchLine:'市内线路',
                dockerGroup:'码头集01',
                logisticMode:'统配，越库',
                pickUpProgress:'拣货中(90%)',
                amount:8903.22,
                weight:232,
                volumn:100,
                shipState:'未排车'
            },
            {
                fromOrg:'[8025]配送中心',
                toOrg:'[3455]庆春路店',
                taskType:'配送',
                storeSerialArchLine:'市内线路',
                dockerGroup:'码头集01',
                logisticMode:'统配，越库',
                pickUpProgress:'拣货中(90%)',
                amount:8903.22,
                weight:232,
                volumn:100,
                shipState:'未排车'
            },
            {
                fromOrg:'[8027]配送中心',
                toOrg:'[3355]庆春路店',
                taskType:'配送',
                storeSerialArchLine:'市内线路',
                dockerGroup:'码头集01',
                logisticMode:'统配，越库',
                pickUpProgress:'拣货中(90%)',
                amount:8903.22,
                weight:232,
                volumn:100,
                shipState:'未排车'
            },
        ]

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
        };

        return (
            <div>
            <Row gutter={24} type="flex">
             <Col xl={24} lg={24} md={24} sm={24} xs={24}>
             <Collapse>
                <Panel header="排车看板" key="1">
                    <Table size='small' bordered columns={columns} pagination={false} dataSource={deliveryData} />
                </Panel>
            </Collapse>
            </Col>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card title="任务看板">
                <Table size='small' bordered rowSelection={rowSelection} columns={taskColumns} dataSource={taskData} />
              </Card>
            </Col>
            </Row>
          </div>
        );
    }
}