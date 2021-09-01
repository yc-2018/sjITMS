export const wrhCloseState = {
  SAVED: {
    name: 'SAVED',
    caption: '已保存',
  },
  AUDITED: {
    name: 'AUDITED',
    caption: '已审核',
  },
}

export function getStateCaption(state) {
  let caption;

  for (let x in wrhCloseState) {
    if (wrhCloseState[x].name === state) {
      caption = wrhCloseState[x].caption;
      break;
    }
  }

  return caption;
}