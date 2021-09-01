import CreatePage from '@/pages/Component/Page/CreatePage';
import { Form, Input, Select, InputNumber, message, Col } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import CategorySelect from '@/pages/Component/Select/CategorySelect';
import DCSelect from '../../Component/Select/DCSelect';
import { loginCompany, getActiveKey } from '@/utils/LoginContext';
import { STATE, STATUS, SOURCE_WAY } from '@/utils/constants';
import FormItem from 'antd/lib/form/FormItem';
import { sourceWay } from '@/utils/SourceWay';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { WrhLocale } from './WrhLocale';
import Empty from '@/pages/Component/Form/Empty';

@connect(({ wrh, loading }) => ({
    wrh,
    loading: loading.models.wrh,
}))
@Form.create()
export default class WrhCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + WrhLocale.title,
            entity: {
                companyUuid: loginCompany().uuid,
                sourceWay: sourceWay.CREATE.name,
            },
            spinning: false,
        }
    }

    componentDidMount() {
        if (this.props.wrh.entityUuid) {
            this.props.dispatch({
                type: 'wrh/get',
                payload: this.props.wrh.entityUuid
            });
        }

    }

    componentWillReceiveProps(nextProps) {

        if (getActiveKey() != '' && getActiveKey() != this.props.pathname) {
            return;
        }

        if (nextProps.wrh.entity && this.props.wrh.entityUuid) {
            this.setState({
                entity: nextProps.wrh.entity,
                title: convertCodeName(nextProps.wrh.entity)
            });
        }
    }


    handleAdd = (value, toCreateView) => {
        const { dispatch, form } = this.props;
        const { entity } = this.state;

        let wrh = {
            ...entity,
            ...value
        }

        if (value && value.dc)
            wrh.dc = JSON.parse(value.dc).uuid;
        if (!wrh.code)
            wrh.code = entity.code;
        if (!wrh.dc)
            wrh.dc = entity.dc.uuid;

        let type = 'wrh/add';
        if (entity.uuid) {
            type = 'wrh/modify';
        }

        dispatch({
            type: type,
            payload: wrh,
            callback: response => {
                if (response && response.success) {
                    message.info(commonLocale.saveSuccessLocale);
                    if (toCreateView) {
                        // 清空form
                        form.resetFields()
                        this.setState({
                            entity: {
                                companyUuid: loginCompany().uuid,
                                sourceWay: sourceWay.CREATE.name,
                            }
                        })
                    } else {
                        this.onView(entity.uuid ? entity.uuid : response.data);
                    }
                }
            },
        })
    }

    onSaveAndCreate = (value) => {
        this.handleAdd(value, true);
    }

    onSave = (value) => {
        this.handleAdd(value, false);
    }

    onCancel = () => {
        this.props.dispatch({
            type: 'wrh/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    onView = (uuid) => {
        this.props.dispatch({
            type: 'wrh/showPage',
            payload: {
                showPage: 'view',
                entityUuid: uuid
            }
        });
    }

    drawBasicInfoCols = () => {
        const { form } = this.props;
        const { entity } = this.state;
        let basicInfoCols = [];

        if (entity.code) {
            basicInfoCols.push(
                <CFormItem key="code" label={commonLocale.codeLocale}>
                    {form.getFieldDecorator('code')
                        (
                            <Col>{entity.code ? entity.code : <Empty />}</Col>
                        )}
                </CFormItem>
            );
        } else {
            basicInfoCols.push(
                <CFormItem key="code" label={commonLocale.codeLocale}>
                    {form.getFieldDecorator('code', {
                        rules: [
                            { required: true, message: notNullLocale(commonLocale.codeLocale) },
                            {
                                pattern: /^[0-9a-zA-Z]{1,30}$/,
                                message: formatMessage({ id: 'wrh.create.form.item.code.validate.message.integrality' }),
                            },
                        ],
                        initialValue: entity ? entity.code : null,
                    })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
                </CFormItem>
            );
        }

        basicInfoCols.push(
            <CFormItem key='name' label={commonLocale.nameLocale}>
                {form.getFieldDecorator('name', {
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.nameLocale) },
                        {
                            max: 30,
                            message: formatMessage({ id: 'wrh.create.form.item.name.validate.message.limitLength' }),
                        },
                    ],
                    initialValue: entity ? entity.name : null,
                })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </CFormItem>
        );
        basicInfoCols.push(
            <CFormItem label={WrhLocale.sourceWrhCode}>
                {form.getFieldDecorator('sourceWrhCode', {
                    rules: [
                        {
                            max: 10,
                            message: formatMessage({ id: 'wrh.create.form.item.sourceWrhCode.validate.message.limitLength' }),
                        },
                    ],
                    initialValue: entity.sourceWrhCode,
                })(<Input placeholder={placeholderLocale(WrhLocale.sourceWrhCode)} />)}
            </CFormItem>
        );
        basicInfoCols.push(
            <CFormItem label={WrhLocale.sourceWrhName}>
                {form.getFieldDecorator('sourceWrhName', {
                    rules: [
                        {
                            max: 30,
                            message: formatMessage({ id: 'wrh.create.form.item.name.validate.message.limitLength' }),
                        },
                    ],
                    initialValue: entity ? entity.sourceWrhName : null,
                })(<Input placeholder={placeholderLocale(WrhLocale.sourceWrhName)} />)}
            </CFormItem>
        );

        if (entity.dc) {
            basicInfoCols.push(
                <CFormItem key="dc" label={commonLocale.inDCLocale}>
                    {form.getFieldDecorator('dc')
                        (
                            <Col>{entity.dc ? convertCodeName(entity.dc) : '空'}</Col>
                        )}
                </CFormItem>
            );
        } else {
            basicInfoCols.push(
                <CFormItem label={WrhLocale.dc}>
                    {form.getFieldDecorator('dc', {
                        rules: [
                            { required: true, message: notNullLocale(WrhLocale.dc) },
                        ],
                        initialValue: entity && entity.dc ? JSON.stringify(entity.dc) : undefined,
                    })(
                        <DCSelect
                            placeholder={placeholderChooseLocale(commonLocale.inDCLocale)} />
                    )}
                </CFormItem>
            );
        }
        return basicInfoCols;
    }

    drawFormItems = () => {
        return (
            <FormPanel key="basicInfo" title={formatMessage({ id: 'iwms.index.create.basic' })} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()} noteLabelSpan={4} />
        );
    }


}