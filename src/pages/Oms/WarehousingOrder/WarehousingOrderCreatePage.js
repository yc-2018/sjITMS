import React, { useDebugValue } from 'react';
import { connect } from 'dva';
import { Form, Upload, Button, Icon, message, Layout } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class WarehousingOrderCreatePage extends QuickCreatePage {}
