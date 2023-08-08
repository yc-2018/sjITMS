import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'antd';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import AddressAreaSearchPage from '@/pages/SJTms/AddressArea/AddressAreaSearchPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ApplicationFormSearchPage extends QuickFormSearchPage {}
