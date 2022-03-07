
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class QuickFormSearchPageDefault extends QuickFormSearchPage {
}