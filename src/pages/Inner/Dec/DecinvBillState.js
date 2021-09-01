export const decinvBillState = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存'
  },
  APPROVED: {
    name: 'APPROVED',
    caption: '已批准'
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核'
  },
}

export function getStateCaption(state) {
  let caption;

  for (let x in decinvBillState) {
    if (decinvBillState[x].name === state) {
      caption = decinvBillState[x].caption;
      break;
    }
  }

  return caption;
}