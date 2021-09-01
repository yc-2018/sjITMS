import { PureComponent } from 'react';
import { connect } from 'dva';
import { List, Card, Statistic, Row, Col, Empty, Skeleton } from 'antd';
import Choice from '@/assets/common/ic_choice.svg';
import ShipPlanDispatchInfoCard from './ShipPlanDispatchInfoCard';
import { convertCodeName } from '@/utils/utils';
import { ShipPlanType, refreshDispatchInfo } from './ShipPlanDispatchLocale';
import { guid } from '@/utils/utils';
import { add } from '@/utils/QpcStrUtil';

export default class ShipPlanDispatchDCInfoCard extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            dispatchInfo: {
                fromOrg: {
                    uuid: '',
                    code: '',
                    name: ''
                },
                staticProfile: {
                    qtyStr: '',
                    amount: 0,
                    volume: 0,
                    weight: 0
                },
                type: '',
                taskCount: 0
            },
            dispatchInfos: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.dispatchInfos) {
            this.setState({
                dispatchInfos: nextProps.dispatchInfos
            })
        }
    }
    onSelect = (dispatchInfo) => {
        this.props.onSelect(dispatchInfo);
    }


    render() {
        //TODO render会多次触发，因为值传递的问题，数量会累加，析构赋值仍然存在问题，待优化
        const { dispatchInfos } = this.state;
        let cardLists = [];
        let deliveryDispatchInfo = {
            fromOrg: {
                uuid: '',
                code: '',
                name: ''
            },
            qtyStr: '0',
            amount: 0,
            volume: 0,
            weight: 0,
            type: '',
            taskCount: 0
        };
        let transportDispatchInfo = {
            fromOrg: {
                uuid: '',
                code: '',
                name: ''
            },
            qtyStr: '0',
            amount: 0,
            volume: 0,
            weight: 0,
            type: '',
            taskCount: 0
        }
        let transferDispatchInfo = {
            fromOrg: {
                uuid: '',
                code: '',
                name: ''
            },
            qtyStr: '0',
            amount: 0,
            volume: 0,
            weight: 0,
            type: '',
            taskCount: 0
        }
        let rtnDispatchInfo = {
            fromOrg: {
                uuid: '',
                code: '',
                name: ''
            },
            qtyStr: '0',
            amount: 0,
            volume: 0,
            weight: 0,
            type: '',
            taskCount: 0
        }
        dispatchInfos.forEach(item => {
            if (ShipPlanType.DELIVERY.name === item.type) {
                deliveryDispatchInfo.amount = deliveryDispatchInfo.amount + item.staticProfile.amount;
                deliveryDispatchInfo.taskCount = deliveryDispatchInfo.taskCount + 1;
                deliveryDispatchInfo.volume = deliveryDispatchInfo.volume + item.staticProfile.volume;
                deliveryDispatchInfo.weight = ((deliveryDispatchInfo.weight * 1000 + item.staticProfile.weight * 1000) / 1000).toFixed(4);
                deliveryDispatchInfo.fromOrg = item.fromOrg;
                deliveryDispatchInfo.uuid = item.uuid;
            } else if (ShipPlanType.TRANSPORT.name === item.type) {
                transportDispatchInfo.amount = transportDispatchInfo.amount + item.staticProfile.amount;
                transportDispatchInfo.taskCount = transportDispatchInfo.taskCount + 1;
                transportDispatchInfo.volume = transportDispatchInfo.volume + item.staticProfile.volume;
                transportDispatchInfo.weight = ((transportDispatchInfo.weight * 1000 + item.staticProfile.weight * 1000) / 1000).toFixed(4);
                transportDispatchInfo.fromOrg = item.fromOrg;
                transportDispatchInfo.uuid = item.uuid;
            } else if (ShipPlanType.RTN.name === item.type) {
                rtnDispatchInfo.amount = rtnDispatchInfo.amount + item.staticProfile.amount;
                rtnDispatchInfo.taskCount = rtnDispatchInfo.taskCount + 1;
                rtnDispatchInfo.volume = rtnDispatchInfo.volume + item.staticProfile.volume;
                rtnDispatchInfo.weight = ((rtnDispatchInfo.weight * 1000 + item.staticProfile.weight * 1000) / 1000).toFixed(4);
                rtnDispatchInfo.fromOrg = item.fromOrg;
                rtnDispatchInfo.uuid = item.uuid;
            } else if (ShipPlanType.TRANSFER.name === item.type) {
                transferDispatchInfo.amount = transferDispatchInfo.amount + item.staticProfile.amount;
                transferDispatchInfo.taskCount = transferDispatchInfo.taskCount + 1;
                transferDispatchInfo.volume = transferDispatchInfo.volume + item.staticProfile.volume;
                transferDispatchInfo.weight = ((transferDispatchInfo.weight * 1000 + item.staticProfile.weight * 1000) / 1000 / 1000).toFixed(4);
                transferDispatchInfo.fromOrg = item.fromOrg;
                transferDispatchInfo.uuid = item.uuid;
            }
        });
        cardLists.push(<ShipPlanDispatchInfoCard isBackGround={false} onSelect={this.onSelect} dispatchInfo={{ ...deliveryDispatchInfo, type: ShipPlanType.DELIVERY.name }} />);
        cardLists.push(<ShipPlanDispatchInfoCard isBackGround={true} onSelect={this.onSelect} dispatchInfo={{ ...rtnDispatchInfo, type: ShipPlanType.RTN.name }} />);
        cardLists.push(<ShipPlanDispatchInfoCard isBackGround={false} onSelect={this.onSelect} dispatchInfo={{ ...transportDispatchInfo, type: ShipPlanType.TRANSPORT.name }} />);
        cardLists.push(<ShipPlanDispatchInfoCard isBackGround={true} onSelect={this.onSelect} dispatchInfo={{ ...transferDispatchInfo, type: ShipPlanType.TRANSFER.name }} />);
        return (
            <div>
                <Card.Grid style={{
                    width: '20%',
                    textAlign: 'center',
                    height: "200px",
                }}>{this.state.dispatchInfos.length > 0 ? convertCodeName(this.state.dispatchInfos[0].fromOrg) : ''}</Card.Grid>
                {cardLists}
            </div>
        );
    }
}