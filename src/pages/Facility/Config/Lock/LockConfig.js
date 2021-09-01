import { PureComponent } from 'react';
import { connect } from 'dva';
import LockConfigSearchPage from './LockConfigSearchPage';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class LockConfig extends PureComponent {

    render() {
        return <LockConfigSearchPage />;
    }
}