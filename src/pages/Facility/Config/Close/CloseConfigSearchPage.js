import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message } from 'antd';
import { binUsage } from '@/utils/BinUsage';
import { formatMessage } from 'umi/locale';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import { decincConfigLocale } from '../Decinc/DecincConfigLocale';
import CloseConfigSearchForm from './CloseConfigSearchForm';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class CloseConfigSearchPage extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: '封仓解仓配置',
            data: props.decincConfig.data,
            unShowRow:true
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.searchKeyValues.configType = 'CLOSE';
        this.state.pageFilter.sortFields = {};
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
                configType: 'CLOSE'
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

        if ("CLOSE" === configType) {
            caption = '封仓';
        }
        return caption;
    }

    drawSearchPanel = () => {
        return <CloseConfigSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
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
            width: itemColWidth.noteEditColWidth,
            dataIndex: 'note',
            render: text => text?<EllipsisCol colValue={text} />:<Empty/>
        },
    ];
}
