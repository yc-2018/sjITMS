import { PureComponent } from 'react';
import { connect } from 'dva';
import { List, Card, Statistic, Row, Col, Empty, Skeleton, Collapse } from 'antd';
import ShipPlanDispatchInfoCard from './ShipPlanDispatchInfoCard';
import ShipPlanDispatchDCInfoCard from './ShipPlanDispatchDCInfoCard';
import { ShipPlanDispatchLocale, ShipPlanType, } from './ShipPlanDispatchLocale';
import ShipPlanDispatchSearchPage from './ShipPlanDispatchSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './ShipPlanDispatch.less';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { guid } from '@/utils/utils';
import router from 'umi/router';
import { routerRedux } from 'dva/router';
const { Panel } = Collapse;
import { add } from '@/utils/QpcStrUtil';

@connect(({ shipPlanDispatch, loading }) => ({
    shipPlanDispatch,
    loading: loading.models.shipPlanDispatch,
}))
export default class ShipPlanDispatchPanel extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            style: { borderRadius: 10 },
            choiceStyle: {
                borderRadius: '50%',
                borderWidth: '10pt',
                backgroundColor: '#D8DAE6'
            },
            selectKeys: [],
            pageFilter: {},
            totalInfo: {
                qtyStr: 0,
                amount: 0,
                volume: 0,
                weight: 0
            }
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'shipPlanDispatch/query',
            payload: {
                companyUuid: loginCompany().uuid
            }
        })
    }

    /**
     * 对于勾选与取消勾选对应的两个事件不做区分，
     * 勾选时需要把传入的参数加入到selecteKeys集合中
     * 取消勾选时说明selecteKeys集合中已经包括传入的参数，此时需要把改元素从集合中删除
     */
    onSelect = (dispatchInfo) => {
        let newSelectedKeys = [];
        let existInArray = false;
        for (const selectedKey of this.state.selectKeys) {
            if (selectedKey.uuid === dispatchInfo.uuid) {
                existInArray = true;
                continue;
            }
            newSelectedKeys.push(selectedKey);
        }
        if (!existInArray && dispatchInfo.uuid) {
            newSelectedKeys.push(dispatchInfo);
        }
        this.setState({
            selectKeys: newSelectedKeys
        })


        //queryFilter：后台查询参数
        const queryFilter = {};
        queryFilter.companyUuid = loginCompany().uuid;
        queryFilter.fromOrgUuids = [];
        queryFilter.toOrgUuids = [];

        //pageFilter：控件赋值参数
        const pageFilter = {};
        pageFilter.companyUuid = loginCompany().uuid;
        pageFilter.fromOrgUuids = [];
        pageFilter.toOrgUuids = [];
        pageFilter.taskTypes = [];
        newSelectedKeys.forEach(selectedKey => {
            queryFilter.fromOrgUuids.push(selectedKey.fromOrg.uuid);
            let fromOrg = { ...selectedKey.fromOrg, type: selectedKey.fromOrgType };
            pageFilter.fromOrgUuids.push(JSON.stringify(fromOrg));
            if (pageFilter.taskTypes.indexOf(selectedKey.type) === -1)
                pageFilter.taskTypes.push(selectedKey.type);
        });
        this.props.dispatch({
            type: 'shipPlanDispatch/queryDispatch',
            payload: queryFilter,
        })
        let totalInfo = {
            qtyStr: 0,
            amount: 0,
            volume: 0,
            weight: 0,
            taskCount: 0
        };
        newSelectedKeys.forEach(selectedKey => {
            totalInfo.amount = totalInfo.amount + selectedKey.amount;
            totalInfo.qtyStr = add(totalInfo.qtyStr, selectedKey.qtyStr);
            totalInfo.volume = (Number(totalInfo.volume) + Number(selectedKey.volume)).toFixed(4);
            totalInfo.weight = Number(totalInfo.weight) + Number(selectedKey.weight);
            totalInfo.taskCount = Number(totalInfo.taskCount) + Number(selectedKey.taskCount);
        })
        this.setState({
            pageFilter: pageFilter,
            totalInfo: totalInfo
        })
    }

    /**
     * 刷新排车看板
     */
    queryDelivery = (queryDelivery) => {
        this.props.dispatch({
            type: 'shipPlanDispatch/queryDispatch',
            payload: queryDelivery,
        })
    }

    onGenerateShipPlanBill = (list) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/shipplanbill',
            items: list
        }));
    }


    onGenerateShipBill = (list) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/shipbill',
            items: list
        }));
    }

    render() {
        const props = this.props.shipPlanDispatch;
        const map = new Map();
        for (let dispatchInfo of props.data.list) {
            if (map.has(dispatchInfo.fromOrg.uuid)) {
                let value = map.get(dispatchInfo.fromOrg.uuid);
                value.push(dispatchInfo);
            } else {
                let value = [];
                value.push(dispatchInfo);
                map.set(dispatchInfo.fromOrg.uuid, value);
            }
        }

        let dcInfoCards = [];
        for (let key of map.keys()) {
            dcInfoCards.push(<ShipPlanDispatchDCInfoCard dispatchInfos={map.get(key)} onSelect={(dispatchInfo) => this.onSelect(dispatchInfo)} />)
        }

        const { pageFilter, totalInfo } = this.state;
        return (
            <PageHeaderWrapper>
                <Collapse className={styles.cardCollapse} defaultActiveKey={['1']} bordered={false}>
                  <Panel key='1'
                    header={(() => { return <span className={styles.title}>{ShipPlanDispatchLocale.dispatchInfoPanel}</span> })()}
                    extra={"任务量:" + (totalInfo.taskCount ? totalInfo.taskCount : 0) + "，金额:" + totalInfo.amount + "，重量:" + (Number(totalInfo.weight) / 1000).toFixed(4) + "，体积:" + totalInfo.volume}>
                    <Card hoverable={false}>
                        <Card.Grid style={{
                            width: '20%',
                            textAlign: 'center',
                            height: '100%',
                            borderBottom: 0,
                            boxShadow: '',

                        }}><span style={{ height: 70 }}>{ShipPlanDispatchLocale.taskInfoPanel}</span></Card.Grid>
                        <Card.Grid style={{
                            width: '20%',
                            textAlign: 'center',
                            background: '#F9F9F9'
                        }}>{ShipPlanType.DELIVERY.caption}</Card.Grid>
                        <Card.Grid style={{
                            width: '20%',
                            textAlign: 'center',
                        }}>{ShipPlanType.RTN.caption}</Card.Grid>
                        <Card.Grid style={{
                            width: '20%',
                            textAlign: 'center',
                            background: '#F9F9F9'
                        }}>{ShipPlanType.TRANSPORT.caption}</Card.Grid>
                        <Card.Grid style={{
                            width: '20%',
                            textAlign: 'center',
                        }}>{ShipPlanType.TRANSFER.caption}</Card.Grid>
                        {dcInfoCards}
                    </Card></Panel></Collapse>
                <ShipPlanDispatchSearchPage queryDelivery={this.queryDelivery} dispatch={this.props.dispatch} loading={this.props.loading} pageFilter={pageFilter}
                    deliveryData={props.deliveryData}
                    onGenerateShipPlanBill={this.onGenerateShipPlanBill}
                    onGenerateShipBill={this.onGenerateShipBill}/>
            </PageHeaderWrapper >);
    }
}
