import { PureComponent } from 'react';
import { connect } from 'dva';
import CloseConfigSearchPage from './CloseConfigSearchPage';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class CloseConfig extends PureComponent {

    render() {
        return <CloseConfigSearchPage />;
    }
}