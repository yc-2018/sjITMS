import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { message, Form, Switch } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from './Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { collectionBinReviewShipConfigLocale } from './CollectionBinReviewShipConfigLocale';
import { commonLocale } from '@/utils/CommonLocale';

@connect(({ collectbinreviewshipconfig, loading }) => ({
    collectbinreviewshipconfig,
    loading: loading.models.collectbinreviewshipconfig,
}))
@Form.create()
export default class CompanyDetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reviewResultShip: this.props.collectbinreviewshipconfig.data
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            reviewResultShip: nextProps.collectbinreviewshipconfig.data
        });
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.props.dispatch({
            type: 'collectbinreviewshipconfig/get',
            payload: {
                dcUuid: loginOrg().uuid
            }
        });
    }

    onChange = (checked) => {
        let { reviewResultShip } = this.state;

        this.setState({
            reviewResultShip: checked,
        });

        this.props.dispatch({
            type: 'collectbinreviewshipconfig/modify',
            payload: checked,
            callback: response => {
                if (response && response.success)
                    message.success(commonLocale.saveSuccessLocale);
                this.refresh();
            },
        });
    }

    render() {
        const {
            loading,
            form,
            data
        } = this.props;

        const {
            reviewResultShip,
        } = this.state;

        return (
            <Page>
                <NavigatorPanel title={collectionBinReviewShipConfigLocale.title} />
                <div>
                    {collectionBinReviewShipConfigLocale.reviewResultShip}
                    &emsp;&emsp;
                    <Switch
                        onChange={this.onChange}
                        checked={reviewResultShip}>
                    </Switch>
                </div>
            </Page>
        );
    }
}
