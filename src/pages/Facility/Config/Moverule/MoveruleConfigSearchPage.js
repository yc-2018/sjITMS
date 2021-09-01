import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import { colWidth } from '@/utils/ColWidth';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { moveruleConfigLocale } from './MoveruleConfigLocale';
import MoveruleConfigSearchForm from './MoveruleConfigSearchForm';
import { orgType } from '@/utils/OrgType';
import Empty from '@/pages/Component/Form/Empty';

@connect(({ moveruleConfig, loading }) => ({
    moveruleConfig,
    loading: loading.models.moveruleConfig,
}))
export default class MoveruleConfigSearchPage extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: moveruleConfigLocale.moveruleConfigTitle,
            data: props.moveruleConfig.data,
            unShowRow: true,
            key: 'moveruleConfig.search.table',
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
        this.state.logCaption = 'MoveRuleConfig';
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.moveruleConfig.data
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
            type: 'moveruleConfig/query',
            payload: queryFilter,
        });
    };

    getChangeOwner = (changeOwner) => {
        let caption = '';

        if (true === changeOwner) {
            caption = moveruleConfigLocale.moveruleConfigModify;

        }
        if (false === changeOwner) {
            caption = moveruleConfigLocale.moveruleConfigNotModify;
        }
        return caption;
    }

    drawSearchPanel = () => {
        return <MoveruleConfigSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
    }

    columns = [
        {
            title: moveruleConfigLocale.moveruleConfigFromBinUsage,
            dataIndex: 'fromBinUsage',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => binUsage[val].caption
        },
        {
            title: moveruleConfigLocale.moveruleConfigToBinUsage,
            dataIndex: 'toBinUsage',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => binUsage[val].caption
        },
        {
            title: moveruleConfigLocale.moveruleConfigChangeOwner,
            dataIndex: 'changeOwner',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => (
                <span>
                    {this.getChangeOwner(val)}
                </span>
            )
        },
        {
            title: moveruleConfigLocale.moveruleConfigTargetOwnerType,
            width: colWidth.enumColWidth,
            sorter: true,
            dataIndex: 'targetOwnerType',
            render: text => text ? orgType[text.toLowerCase()].caption : <Empty />
        },
    ];
}
