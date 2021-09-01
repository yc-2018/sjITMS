import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LockConfigSearchForm from './LockConfigSearchForm';
import { decincConfigLocale } from '../Decinc/DecincConfigLocale';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class LockConfigSearchPage extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: decincConfigLocale.lockConfigTitle,
            data: props.decincConfig.data,
            unShowRow:true
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
        this.state.pageFilter.searchKeyValues.configType = 'LOCK';
        this.state.logCaption = 'BinUsageConfig';
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.decincConfig.data
        });
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                configType: 'LOCK',
                // state: ''
            }
        }
        this.refreshTable();
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'decincConfig/query',
            payload: queryFilter,
        });
    };

    getConfigType = (configType) => {
        let caption = '';
        if ("LOCK" === configType) {
            caption = decincConfigLocale.decincConfigLock;
        }
        return caption;
    }

    drawSearchPanel = () => {
        return <LockConfigSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
    }

    columns = [
        {
            title: decincConfigLocale.decincConfigBinUsage,
            dataIndex: 'binUsage',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => (
                <span>
                     {binUsage[val].caption}
                </span>
                )
        },
        {
            title: decincConfigLocale.decincConfigConfigType,
            dataIndex: 'configType',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => (
                <span>
                    {this.getConfigType(val)}
                </span>
            )
        },
        {
            title: decincConfigLocale.decincConfigNote,
            dataIndex: 'note',
            width: itemColWidth.noteEditColWidth,
            render: text => text?<EllipsisCol colValue={text} />:<Empty/>
        },
    ];
}