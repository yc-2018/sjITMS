import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Form, Select, Input, InputNumber, message } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { BinTypeLocale } from './BinTypeLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';

@connect(({ binType, loading }) => ({
    binType,
    loading: loading.models.binType,
}))
@Form.create()
export default class BinTypeCreatePage extends CreatePage {

    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + BinTypeLocale.title,
            entity: {
                dcUuid: loginOrg().uuid,
                companyUuid: loginCompany().uuid
            },
            currentView: CONFIRM_LEAVE_ACTION.NEW,
        }
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.binType.entity && this.props.binType.entityUuid) {
            this.setState({
                entity: nextProps.binType.entity,
                title: convertCodeName(nextProps.binType.entity)
            });
        }
    }

    refresh = () => {
        let entityUuid = this.props.binType.entityUuid;
        if (entityUuid) {
            this.setState({
                currentView: CONFIRM_LEAVE_ACTION.EDIT
            })
        }
        this.props.dispatch({
            type: 'binType/get',
            payload: {
                uuid: entityUuid
            }
        })

    }

    onCancel = () => {
        this.props.dispatch({
            type: 'binType/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    onSave = (data) => {
        let binType = {
            ...this.state.entity,
            ...data
        };
        if (!binType.uuid) {
            this.props.dispatch({
                type: 'binType/add',
                payload: binType,
                callback: (response) => {
                    if (response && response.success) {
                        message.success(commonLocale.saveSuccessLocale);
                    }
                }
            });
        } else {
            this.props.dispatch({
                type: 'binType/modify',
                payload: binType,
                callback: (response) => {
                    if (response && response.success) {
                        message.success(commonLocale.modifySuccessLocale);
                    }
                }
            });
        }
    }

    onSaveAndCreate = (data) => {
        let binType = {
            ...this.state.entity,
            ...data
        };
        this.props.dispatch({
            type: 'binType/onSaveAndCreate',
            payload: binType,
            callback: (response) => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.props.form.resetFields();
                }
            }
        });
    }

    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;
        let cols = [
            <CFormItem label={commonLocale.codeLocale} key='code' labelSpan={6}>
                {getFieldDecorator('code', {
                    initialValue: entity.code,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.codeLocale) },
                        {
                            pattern: /^[0-9A-Za-z]{2,7}$/,
                            message: formatMessage({ id: 'bintype.create.form.item.code.validate.message.integrality' })
                        },
                    ],
                })(<Input disabled={entity.code ? true : false} style={{ width: '100%' }} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
            </CFormItem>,

            <CFormItem label={commonLocale.nameLocale} key='name'>
                {getFieldDecorator('name', {
                    initialValue: entity.name,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.nameLocale) },
                        {
                            max: 30,
                            message: tooLongLocale(commonLocale.nameLocale, 30),
                        },
                    ],
                })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </CFormItem>,

            <CFormItem label={BinTypeLocale.storageNum}
                key='storageNumber'>
                {getFieldDecorator('storageNumber', {
                    initialValue: entity.storageNumber,
                    rules: [
                        {
                            required: true,
                            message: notNullLocale(BinTypeLocale.storageNum)
                        }, {
                            pattern: /^[0-9]{1,12}$/,
                            message: formatMessage({ id: 'bintype.create.form.item.storageNumber.validate.int' })
                        },
                    ],
                })(
                    <InputNumber min={0} max={30000}
                        style={{ width: '100%' }}
                        placeholder={placeholderLocale(BinTypeLocale.storageNum)} />
                )}
            </CFormItem>
        ];

        let qpcCols = [
            <CFormItem label={BinTypeLocale.length} key='length' labelSpan={6}>
                {getFieldDecorator('length', {
                    initialValue: entity.length,
                    rules: [
                        {
                            required: true,
                            message: formatMessage({ id: 'bintype.create.form.item.length.validate.message.notNull' })
                        },
                    ]
                })(
                    <InputNumber min={1} max={999999}
                        style={{ width: '100%' }}
                        placeholder={placeholderLocale(BinTypeLocale.length)} />
                )}
            </CFormItem>,
            <CFormItem label={BinTypeLocale.width} key='width'>
                {getFieldDecorator('width', {
                    initialValue: entity.width,
                    rules: [
                        {
                            required: true,
                            message: notNullLocale(BinTypeLocale.width)
                        },
                    ],
                })(
                    <InputNumber min={1} max={999999}
                        style={{ width: '100%' }}
                        placeholder={placeholderLocale(BinTypeLocale.width)} />
                )}
            </CFormItem>,
            <CFormItem label={BinTypeLocale.height} key='height'>
                {getFieldDecorator('height', {
                    initialValue: entity.height,
                    rules: [
                        {
                            required: true,
                            message: notNullLocale(BinTypeLocale.height),
                        }
                    ],
                })(<InputNumber min={1} max={999999}
                    style={{ width: '100%' }}
                    placeholder={placeholderLocale(BinTypeLocale.height)} />)}
            </CFormItem>,
            <CFormItem label={BinTypeLocale.weight} key='weight'>
                {getFieldDecorator('weight', {
                    initialValue: entity.weight,
                    rules: [
                        {
                            required: true,
                            message: notNullLocale(BinTypeLocale.weight)
                        },
                    ],
                })(
                    <InputNumber min={1} max={9999999999}
                        style={{ width: '100%' }}
                        placeholder={placeholderLocale(BinTypeLocale.weight)} />
                )}
            </CFormItem>,
            <CFormItem label={BinTypeLocale.plotRatio} key='plotRatio' labelSpan={6}>
                {getFieldDecorator('plotRatio', {
                    initialValue: entity.plotRatio,
                    rules: [
                        { required: true, message: notNullLocale(BinTypeLocale.plotRatio) },
                    ],
                })(<InputNumber min={0} max={100}
                    style={{ width: '100%' }}
                    placeholder={placeholderLocale(BinTypeLocale.plotRatio)} />)}
            </CFormItem>
        ];
        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} noteLabelSpan={3}/>,
            <FormPanel key='qpcInfo' title={BinTypeLocale.qpcInfo} cols={qpcCols} />
        ];
    }
}
