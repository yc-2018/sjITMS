import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Switch, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import VehicleTypeSearchForm from './VehicleTypeSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { VehicleUsage, VehicleTypeLocale, VehicleTypePrem } from './VehicleTypeLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { accDiv } from '@/utils/QpcStrUtil'


const FormItem = Form.Item;

@connect(({ vehicleType, loading }) => ({
    vehicleType,
    loading: loading.models.vehicleType,
}))
@Form.create()
export default class CarrierSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: VehicleTypeLocale.title,
            data: props.vehicleType.data,
            key:'vehicleType.search.table',
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    }

    componentDidMount() {
      if(this.props.vehicleType.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.vehicleType.data,
            entity: {}
        });
    }

    onCreate = (record) => {
        const payload = {
            showPage: 'create'
        }
        if (record) {
            payload.uuid = record.uuid;
        }
        this.props.dispatch({
            type: 'vehicleType/showPage',
            payload: { ...payload }
        });
    }

    onView = (record) => {
        this.props.dispatch({
            type: 'vehicleType/showPage',
            payload: {
                showPage: 'view',
                uuid: record.uuid
            }
        });
    }

    onDelete = (record, batch) => {
        const { dispatch } = this.props;
        const that = this;
        dispatch({
            type: 'vehicleType/remove',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: response => {
                if (batch) {
                    that.batchCallback(response, record);
                    return;
                }
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.removeSuccessLocale);
                }
            }
        });
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            pageFilter.likeKeyValues = {
                ...pageFilter.likeKeyValues,
                codeName: data.codeName
            },
                pageFilter.searchKeyValues = {
                    ...pageFilter.searchKeyValues,
                    usageEquals: data.usageEquals,
                    companyUuid: loginCompany().uuid,
                }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                usageEquals: null
            },
                pageFilter.likeKeyValues = {
                    codeName: ''
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
            type: 'vehicleType/query',
            payload: queryFilter,
        });
    };

    drawActionButton = () => {
        return loginOrg().type === 'COMPANY' && (
            <Fragment>
                <Button icon="plus" type="primary" onClick={() => this.onCreate()} disabled={!VehicleTypePrem.CREATE}>
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }

    drawToolbarPanel = () => {
        return loginOrg().type === 'COMPANY' && [
            <Button key='remove' onClick={() => this.onBatchRemove()} disabled={!VehicleTypePrem.REMOVE}>
                {commonLocale.batchRemoveLocale}
            </Button>,
        ];
    }

    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(function (e) {
            that.onDelete(e, true);
        });
    }

    drawOtherCom = () => {
        return (
            <div>
                {this.drawProgress()}
            </div>
        );
    }

    drawSearchPanel = () => {
        return <VehicleTypeSearchForm filterEqualsValue={this.state.pageFilter.searchKeyValues}
            filterLikeValue={this.state.pageFilter.likeKeyValues}
            refresh={this.onSearch} />;
    }

    renderOperateCol = (record) => {
        const options = [];
        options.push(
            {
                name: commonLocale.editLocale,
                disabled: !VehicleTypePrem.EDIT,
                onClick: this.onCreate.bind(this, record),
            }
        )
        options.push(
            {
                name: commonLocale.deleteLocale,
                disabled: !VehicleTypePrem.REMOVE,
                onClick: this.onDelete.bind(this, record, false),
                confirm: true,
                confirmCaption: VehicleTypeLocale.title
            })

        return <OperateCol menus={options} />
    }

    columns = [
        {
            title: commonLocale.codeLocale,
            key: 'code',
            dataIndex: 'code',
            sorter: true,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        }, {
            title: commonLocale.nameLocale,
            key: 'name',
            dataIndex: 'name',
            sorter: true,
            key:'name'
        },
        {
            title: VehicleTypeLocale.usage,
            key: 'usage',
            dataIndex: 'usage',
            sorter: true,
            key:'usage',
            render: (text, record) =>
                VehicleUsage[text],
        },
        {
            title: VehicleTypeLocale.lengthAndwidth,
            key: 'length',
            dataIndex: 'length',
            sorter: true,
            key:'length',
            render: (text, record) => accDiv(record.length, 100) + "/" + accDiv(record.width, 100) + "/" + accDiv(record.height, 100)
        },
        {
            title: VehicleTypeLocale.bearWeight,
            key: 'bearWeight',
            dataIndex: 'bearWeight',
            sorter: true,
            key:'bearWeight'
        },
        {
            title: VehicleTypeLocale.bearVolumeRate,
            key: 'bearVolumeRate',
            dataIndex: 'bearVolumeRate',
            sorter: true,
            key:'bearVolumeRate'
        },
        (loginOrg().type === 'COMPANY') ?
            {
                title: commonLocale.operateLocale,
                render: record => this.renderOperateCol(record)
            } : {}
    ];
}
