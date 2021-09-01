import { PureComponent } from 'react';
import { connect } from 'dva';
import { List, Card, Statistic, Row, Col, Empty, Skeleton } from 'antd';
import Choice from '@/assets/common/ic_choice.svg';
import { ShipPlanDispatchLocale, ShipPlanType } from './ShipPlanDispatchLocale';

export default class ShipPlanDispatchInfoCard extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            style: {
                backgroundColor: '#FFFFFF', borderRadius: 12,
                borderWidth: '1pt',
                borderColor: '#D8DAE6',
                borderStyle: 'solid'
            },
            choiceStyle: {
                borderRadius: '50%',
                borderWidth: '10pt',
                backgroundColor: '#D8DAE6'
            },
            isSelected: false,
            dispatchInfo: {
                qtyStr: '',
                amount: 0,
                volume: 0,
                weight: 0,
                type: '',
                taskCount: 0
            },
            isBackGround: false,
            gridStyleGroundColor: '#F9F9F9',
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({
                dispatchInfo: nextProps.dispatchInfo,
                gridStyleGroundColor: nextProps.isBackGround ? '#FFFFFF' : '#F9F9F9',
            })
        }
    }

    changeStyle = () => {
        if (this.state.isSelected) {
            this.setState({
                style: {
                    ...this.state.style,
                    borderColor: '#D8DAE6',
                },
                choiceStyle: {
                    ...this.state.choiceStyle,
                    backgroundColor: '#D8DAE6'
                },
                isSelected: false,
            })
        } else {
            this.setState({
                style: {
                    ...this.state.style,
                    borderColor: '#3B77E3',
                },
                choiceStyle: {
                    ...this.state.choiceStyle,
                    backgroundColor: '#3B77E3'
                },
                isSelected: true,
            });
        }
        this.props.onSelect(this.state.dispatchInfo);
    }

    render() {
        const { dispatchInfo } = this.state;
        return (
            <Card.Grid style={{
                width: '20%',
                height: "200px",
                textAlign: 'center',
                background: this.state.gridStyleGroundColor
            }}><div style={this.state.style} >
                    <Row span={24} type="flex" justify="space-around" align="middle">
                        <Col span={8} >
                            <Row style={{ textAlign: 'center' }}>
                                <Statistic title={ShipPlanDispatchLocale.taskAmount} value={dispatchInfo.taskCount}></Statistic>
                            </Row>
                        </Col>
                        <Col span={16}>
                            <div style={{ textAlign: 'left', marginLeft: 5 }}>
                                <br></br>
                                <span>{ShipPlanDispatchLocale.amount}</span><span>{'  '}</span><span style={{ marginLeft: 5 }}>{dispatchInfo.amount}</span>
                            </div>
                            <div style={{ textAlign: 'left', marginLeft: 5 }}>
                                <br />
                                <span>{ShipPlanDispatchLocale.weight}</span><span>{'  '}</span><span style={{ marginLeft: 5 }}>{(dispatchInfo.weight / 1000).toFixed(4)}</span>
                            </div>
                            <div style={{ textAlign: 'left', marginLeft: 5 }}>
                                <br />
                                <span>{ShipPlanDispatchLocale.volume}</span><span>{'  '}</span><span style={{ marginLeft: 5 }}>{dispatchInfo.volume.toFixed(4)}</span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={20}></Col>
                        <Col span={4} ><img src={Choice} onClick={this.changeStyle} style={this.state.choiceStyle}></img></Col>
                    </Row>
                </div></Card.Grid>);
    }
}