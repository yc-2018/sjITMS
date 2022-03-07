
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class QuickFormDefault extends QuickForm {
}