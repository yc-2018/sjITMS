import React, { PureComponent } from 'react';
import { Form, Input, Select, Row, Col, Button } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { BillType } from './BillType';
import { billImportLocale } from './BillImportLocale';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import styles from '@/pages/Component/Form/SearchForm.less';
import { formatMessage } from 'umi/locale';
import { havePermission } from '@/utils/authority';
import { BILLIMPORT_RES } from './BillImportPermission';

const billTypeOptions = [];
Object.keys(BillType).forEach(function (key) {
    billTypeOptions.push(<Option key={BillType[key].name} value={BillType[key].name}>{BillType[key].caption}</Option>);
});
@Form.create()
export default class BillImportSearchForm extends PureComponent {
    // componentDidUpdate() {
    //     if (this.drawRows()) {
    //
    //         let id = this.drawRows()[0].props.children[0].key
    //
    //         if (document.getElementById(id) != null && (document.activeElement.tagName == 'A' ||
    //             document.activeElement.tagName == 'BODY' || document.activeElement.id == id)) {
    //             document.getElementById(id).focus();
    //
    //             if (document.getElementById(id).firstChild != null) {
    //                 if (document.querySelector('.ant-select-selection') === document.getElementById(id).firstChild) {
    //                     document.querySelector('.ant-select-selection').focus();
    //                 }
    //             }
    //         }
    //     }
    // }

    /**重置搜索条件 */
    reset = () => {
        this.props.form.resetFields();
        if (this.props.onReset) {
            this.props.onReset();
            return;
        }
    }

    /**搜索 */
    handlerSearch = (e) => {
        const { form } = this.props;

        e.preventDefault();
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const data = {
                ...fieldsValue
            };
            if (this.onSearch) {
                this.onSearch(data);
                return;
            }
            if (this.props.refresh) {
                this.props.refresh(data);
            }
        });
    }

    /**按钮组 */
    drawButtonGroup = () => {
        const toggle = this.state ? this.state.toggle : undefined;
        return (
            <Col key='btnGroup' style={{ float: 'right' }}>
                <div>
                    <Button type="primary" htmlType="submit">
                        {formatMessage({ id: 'company.index.search.button.search' })}
                    </Button>
                    <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
                        {formatMessage({ id: 'company.index.search.button.reset' })}
                    </Button>
                    <Button style={{ marginLeft: 12 }} onClick={this.props.billImport} >
                        {billImportLocale.import}
                    </Button>
                    <Button disabled={!havePermission(BILLIMPORT_RES.MOULDCONFIGURE)} style={{ marginLeft: 12 }} onClick={this.props.onViewBillImportMould}>
                        {billImportLocale.templatConfigure}
                    </Button>
                </div>
            </Col>
        );
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { owner, billType } = this.props;

        let cols = [
          <Col key="owner" span={8}>
            <Form.Item key="owner" label={commonLocale.inOwnerLocale}>
              {
                getFieldDecorator('owner', {
                  initialValue: owner && owner.uuid ? JSON.stringify(owner) : '',
                })(
                  <OwnerSelect hasAll placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />)
              }
            </Form.Item>
          </Col>,
          <Col key="billType" span={8}>
            <Form.Item key="billType" label={billImportLocale.billType}>
              {
                getFieldDecorator('billType', {
                  initialValue: billType ? billType : '',
                })(
                  <Select placeholder={placeholderChooseLocale(billImportLocale.billType)}>
                    {billTypeOptions}
                  </Select>)
              }
            </Form.Item>
          </Col>,
          <Col key="mould" span={8}>
            <Form.Item key="mould" label={billImportLocale.templat}>
              {this.props.mouldString}
            </Form.Item>
          </Col>
        ];
        return cols;
    }

    /**根据子类构造的查询条件列，构造搜索表单的行 */
    drawRows = () => {
        let rows = [];
        let currentRowCols = [];
        let cols = this.drawCols ? this.drawCols() : [];

        for (let i = 0; i < cols.length; i++) {
            let col = cols[i];
            if (currentRowCols.length < 3) {
                currentRowCols.push(col);
            } else {
                rows.push(<Row key={i} gutter={16}>{currentRowCols}</Row>);
                currentRowCols = [];
                currentRowCols.push(col);
            }
        }

        rows.push(<Row key={cols.length} gutter={16}>{currentRowCols}</Row>);
        currentRowCols = [];
        currentRowCols.push(this.drawButtonGroup());
        rows.push(<Row key={'btn'} gutter={16}>{currentRowCols}</Row>);

        return rows;
    }

    render() {
        return (
            <SearchPanel>
                <Form onSubmit={this.handlerSearch}>
                    {this.drawRows()}
                </Form>
            </SearchPanel>
        );
    }
}
