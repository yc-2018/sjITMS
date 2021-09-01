import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { binUsage } from '@/utils/BinUsage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { bindConfigLocale } from './BindConfigLocale';
import BindConfigSearchForm from './BindConfigSearchForm';

@connect(({ bindConfig, loading }) => ({
    bindConfig,
    loading: loading.models.bindConfig,
}))
export default class BindConfigSearchPage extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: bindConfigLocale.bindConfigTitle,
            data: props.bindConfig.data,
            unShowRow: true
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.searchKeyValues.configType='BIND,MERGER';
        this.state.pageFilter.sortFields = {};
        this.state.logCaption = 'BinUsageConfig';
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.bindConfig.data
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
                configType: 'BIND,MERGER'
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
            type: 'bindConfig/query',
            payload: queryFilter,
        });
    };

    getConfigType = (configType) => {
        let caption = '';

        if ("MERGER" === configType) {
            caption = bindConfigLocale.bindConfigSplitsand;
            
        }
        if ("BIND" === configType) {
            caption = bindConfigLocale.bindConfigBinding;
        }
        return caption;
    }

    drawSearchPanel = () => {
        return <BindConfigSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
    }

    columns = [
        {
            title: bindConfigLocale.bindConfigBinUsage,
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
            title: bindConfigLocale.bindConfigConfigType,
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
            title: bindConfigLocale.bindConfigNote,
            width: itemColWidth.noteEditColWidth,
            dataIndex: 'note',
            render: text => <EllipsisCol colValue={text} />
        },
    ];
}
