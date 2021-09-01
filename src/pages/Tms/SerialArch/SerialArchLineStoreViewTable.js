import { Table, Tabs, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import OperateInfoTable from './OperateInfoTable';
import { SERVICE_CAPTION } from '@/utils/constants';
import { Fragment } from 'react';
import { commonLocale } from '@/utils/CommonLocale';
import { SerialArchLocale, SerialArchPerm } from './SerialArchLocale';
import SerialArchLineStoreTable from './SerialArchLineStoreTable';


const TabPane = Tabs.TabPane;


@connect(({ serialArch, loading }) => ({
    serialArch,
    loading: loading.models.serialArch,
}))
class SerialArchLineStoreViewTable extends React.Component {
    state = {
        data: [],
        lineUuid: '',
        lineEntity: {}
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.serialArch) {
            this.setState({
                data: nextProps.serialArch.existInLineStores,
                lineUuid: nextProps.serialArch.lineUuid,
                lineEntity: nextProps.serialArch.lineEntity,
            });
        }
    }

    onEditLine = () => {
        this.props.dispatch({
            type: 'serialArch/getLineByUuid',
            payload: {
                lineUuid: this.state.lineUuid,
            }
        })
    }

    onRemove = () => {
        if (!this.state.lineUuid || !this.state.lineEntity) {
            message.warning(SerialArchLocale.selectedToRemoveLine);
            return;
        }
        this.props.dispatch({
            type: 'serialArch/removeLine',
            payload: {
                uuid: this.state.lineUuid,
                version: this.state.lineEntity.version
            },
            callback: response => {
                if (response && response.success) {
                    this.props.dispatch({
                        type: 'serialArch/query',
                        payload: {}
                    })
                } else {
                    message.error(response.message);
                }
            }
        })
    }

    render() {
        const entity = {};
        entity.uuid = this.state.lineUuid;

        const operations = <Fragment><Button type='primary' disabled={!SerialArchPerm.EDIT_LINE}
            onClick={this.onEditLine}>{commonLocale.editLocale}</Button>&nbsp;
        <Popconfirm title={SerialArchLocale.sureToRemoveThisLine} onConfirm={this.onRemove}><Button disabled={!SerialArchPerm.DELETE_LINE}>{commonLocale.deleteLocale}</Button></Popconfirm></Fragment>;
        return (
            <Tabs defaultActiveKey='1' tabBarExtraContent={operations}>
                <TabPane tab={SerialArchLocale.store} key='1'>
                    <SerialArchLineStoreTable
                        lineEntity={this.state.lineEntity}
                        lineUuid={this.state.lineUuid}
                    />
                </TabPane>
                <TabPane tab={commonLocale.operateInfoLocale} key='2'>
                    <OperateInfoTable
                        entity={entity}
                        serviceCaption={SERVICE_CAPTION['serialArch']}
                    />
                </TabPane>
            </Tabs>
        );
    }
}

export default SerialArchLineStoreViewTable;