import { PureComponent } from 'react';
import { connect } from 'dva';
import DecincConfigSearchPage from './DecincConfigSearchPage';

@connect(({ decincConfig, loading }) => ({
    decincConfig,
    loading: loading.models.decincConfig,
}))
export default class DecincConfig extends PureComponent {

    render() {
        return <DecincConfigSearchPage />;
    }
}