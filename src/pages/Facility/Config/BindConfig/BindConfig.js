import { PureComponent } from 'react';
import { connect } from 'dva';
import BindConfigSearchPage from './BindConfigSearchPage';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class BindConfig extends PureComponent {

    render() {
        return <BindConfigSearchPage />;
    }
}