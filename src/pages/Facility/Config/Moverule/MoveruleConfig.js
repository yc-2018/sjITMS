import { PureComponent } from 'react';
import { connect } from 'dva';
import MoveruleConfigSearchPage from './MoveruleConfigSearchPage';

@connect(({ moveruleConfig, loading }) => ({
    moveruleConfig,
    loading: loading.models.moveruleConfig,
}))
export default class MoveruleConfig extends PureComponent {

    render() {
        return <MoveruleConfigSearchPage />;
    }
}