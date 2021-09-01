import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Row, Col, Form } from 'antd';
import FormTitle from './FormTitle';
import styles from './NotePanel.less'; 

const FormItem = Form.Item;

export default class NoteRow extends PureComponent {
    render() {
        const noteItemLayout = {
            labelCol: { span: 0 },
            wrapperCol: { span: 36 },
            colon: false,
        };

        return (
            <div className={styles.notePanel}>
                <FormTitle title='备注' className={styles.formTitle} />
                <Row style={{ marginLeft: 30 }}>
                    <Col span={36}>
                        <FormItem {...noteItemLayout}>
                            {this.props.children}
                        </FormItem>
                    </Col>
                </Row>
            </div>
        );
    }
}