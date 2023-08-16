export const orgType = {
  heading: {
    name: 'HEADING',
    caption: '海鼎',
  },
  company: {
    name: 'COMPANY',
    caption: '企业',
  },
  dc: {
    name: 'DC',
    caption: '配送中心',
  },
  dispatchCenter: {
    name: 'DISPATCH_CENTER',
    caption: '调度中心',
  },
  carrier: {
    name: 'CARRIER',
    caption: '承运商',
  },
  vendor: {
    name: 'VENDOR',
    caption: '供应商',
  },
  store: {
    name: 'STORE',
    caption: '门店',
  },
  owner: {
    name: 'OWNER',
    caption: '货主',
  },
  bms: {
    name: 'BMS',
    caption: '费用中心',
  },
};

export function getOrgCaption(name) {
  let caption;

  for (let x in orgType) {
    if (orgType[x].name === name) {
      caption = orgType[x].caption;
      break;
    }
  }

  return caption;
}
