import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { getStateCaption } from '@/utils/ContainerState';
import { getUseTypeCaption } from '@/utils/ContainerUseType';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { containerLocale } from './ContainerLocale';
import ContainerSearchForm from './ContainerSearchForm';
import { BinUsage, getUsageCaption } from '@/utils/BinUsage';
import { CONTAINER_RES } from './ContainerPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import Empty from '@/pages/Component/Form/Empty';
const FormItem = Form.Item;

@connect(({ container, loading }) => ({
    container,
    loading: loading.models.container,
}))
@Form.create()
export default class ContainerSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: containerLocale.title,
            showModal: false,
            data: props.container.data,
            containerTypeUuid: '',
            modalLoading: false,
            key: 'container.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        if (!this.state.pageFilter.searchKeyValues.stateEquals)
            this.state.pageFilter.searchKeyValues.stateEquals = '';
        this.state.pageFilter.sortFields = {
            barcode: false,
            containerTypeCode: false
        }
    }

    componentDidMount() {
      if(this.props.container.fromView) {
        return;
      } else {
        this.refreshTable();
      }
        // this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.container.data,
            entity: {}
        });
    }

    onCreate = () => {
        this.setState({
            showModal: true,
        });
    }

    onView = (record) => {

        this.props.dispatch({
            type: 'container/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.barcode
            }
        });
    }

    onViewContainerType = (containerTypeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/facility/containerType',
            payload: {
                showPage: 'view',
                entityUuid: containerTypeUuid
            }
        }))
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
            pageFilter.sortFields = {
                barcode: false,
                typeCode: false
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid
            }
            pageFilter.sortFields = {
                barcode: false,
                containerTypeCode: false
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
            type: 'container/query',
            payload: queryFilter,
        });
    };



    drawActionButton = () => {
        return (
            <Fragment>
                <Button icon="plus" type="primary" disabled={!havePermission(CONTAINER_RES.CREATE)} onClick={() => this.handleModalVisible(true)}>
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }


    drawToolbarPanel() {
        const { selectedRows } = this.state;
        const batchPrintParams = [];
        selectedRows.forEach(function (e) {
            batchPrintParams.push({
                billNumber: e.barcode
            })
        });

        return [
            <PrintButton
                key='printButton'
                reportParams={batchPrintParams}
                moduleId={PrintTemplateType.CONTAINER.name} />
        ];
    }

    drawSearchPanel = () => {
        return <ContainerSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }

    handleCancel() {
        this.props.form.resetFields();
        this.refreshTable();
        this.setState({
            showModal: false,
            entity: {},
            containerTypeUuid: ''
        });
    }

    handleModalVisible = (flag) => {
        this.setState({
            showModal: !!flag,
            entity: {},
        });
    }


    containerTypeChange = (value) => {
        if (!value)
            return;
        var containerType = JSON.parse(value);
        this.setState({
            containerTypeUuid: containerType.uuid
        })
    }

    handleOk() {
        this.setState({
            modalLoading: true
        });

        const { form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const data = {
                ...fieldsValue
            };

            this.props.dispatch({
                type: 'container/onSave',
                payload: {
                    "dcUuid": loginOrg().uuid,
                    "companyUuid": loginCompany().uuid,
                    "containerTypeUuid": this.state.containerTypeUuid,
                    "num": data.num
                },
                callback: (response) => {
                    if (response && response.success) {
                        this.setState({
                            showModal: false,
                            modalLoading: false
                        });
                        this.props.form.resetFields();
                        message.success(commonLocale.saveSuccessLocale);
                        this.refreshTable();
                    } else {
                        this.setState({
                            modalLoading: false
                        });
                    }
                }
            });
        });
    }

    drawOtherCom = () => {
        const baseFormItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 },
        };

        const { getFieldDecorator } = this.props.form;
        const { entity } = this.props;

        return (
            <Modal
                title={commonLocale.createLocale}
                visible={this.state.showModal}
                confirmLoading={this.state.modalLoading}
                destroyOnClose={true}
                onOk={() => this.handleOk()}
                onCancel={() => this.handleCancel()}
                okText={commonLocale.confirmLocale}
                cancelText={commonLocale.cancelLocale}
            >
                <Form>
                    <FormItem
                        {...baseFormItemLayout}
                        label={containerLocale.containerType}>
                        {getFieldDecorator('containerType', {
                            rules: [{ required: true, message: containerLocale.containerTypeNotNull },
                            ]
                        })(
                            <ContainerTypeSelect
                                placeholder={placeholderChooseLocale(containerLocale.containerType)}
                                onChange={this.containerTypeChange}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...baseFormItemLayout}
                        label={containerLocale.genNum}>
                        {getFieldDecorator('num')(
                            <InputNumber placeholder={placeholderLocale(containerLocale.genNum)}
                                style={{ width: '100%' }} min={1} max={1000} />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );

    }

    columns = [
        {
            title: containerLocale.barcodeLocale,
            dataIndex: 'barcode',
            sorter: true,
            width: colWidth.codeColWidth,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: containerLocale.containerType,
            width: colWidth.codeNameColWidth,
            dataIndex: 'containerTypeCode',
            sorter: true,
            render: (text, record) => <a onClick={this.onViewContainerType.bind(true, record.type.uuid)}
                disabled={!record.type}><EllipsisCol colValue={convertCodeName(record.type)} /></a>
        },
        {
            title: containerLocale.positionLocale,
            width: colWidth.codeColWidth,
            dataIndex: 'position',
            sorter: true,
            render: (text, record) => {
                return (record.positionBinUsage && record.position ?
                    <EllipsisCol colValue={'[' + record.position + ']' + getUsageCaption(record.positionBinUsage)} />
                    : <Empty/>
                )
            }

        },
        {
            title: containerLocale.toPosition,
            width: colWidth.codeColWidth,
            dataIndex: 'toPosition',
            sorter: true,
            render: (text, record) => {
                return (record.toPositionBinUsage && record.toPosition ?
                    <EllipsisCol colValue={'[' + record.toPosition + ']' + getUsageCaption(record.toPositionBinUsage)} />
                    : <Empty/>
                )
            }

        },
        {
            title: containerLocale.userLocale,
            key: 'use',
            width: colWidth.codeColWidth,
            sorter: true,
            dataIndex: 'use',
            render: (text, record) => {
                return (
                    record.use && record.useType ?
                        <span>
                            {getUseTypeCaption(record.useType)}<EllipsisCol colValue={convertCodeName(record.use)} />
                        </span>
                        : <Empty/>
                );
            }
        },
        {
            title: commonLocale.stateLocale,
            dataIndex: 'state',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => {
                return getStateCaption(val);
            }
        },
        {
            title: commonLocale.operateLocale,
            key: 'operate',
            width: colWidth.operateColWidth,
            render: record => (
                <Fragment>
                    <a disabled={!havePermission(CONTAINER_RES.CREATE)} onClick={() => this.onView(record)}>
                        {commonLocale.viewLocale}
                    </a>
                </Fragment>
            ),
        },
    ];
}
