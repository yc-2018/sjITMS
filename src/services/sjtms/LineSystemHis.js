import { func } from "prop-types";
import request from "@/utils/request";
import { loginOrg, loginCompany } from "@/utils/LoginContext";

export async function findLineSystemHisTree(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystemHis/findLineSystemHisTree`, {
    method: 'get',
    body: payload
  });
}
export  function systemHisExport(payload) {
  return request(`/itms-schedule/itms-schedule/LineSystemHis/export/${payload}`, {
    method: 'post'
  });
}
 
export async function modify(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/modify`, {
    method: 'POST',
    body: payload
  });
}

export async function remove(payload) {
  return request(`/itms-schedule/itms-schedule/feetype/${payload}`, {
    method: 'POST',
  });
}
export async function save(payload) {
  return request(`/itms-schedule/itms-schedule/feetype`, {
    method: 'POST',
    body: payload
  });
}


export async function findLineSystemTreeByStoreCode(payload) {
    return request(`/itms-schedule/itms-schedule/LineSystem/findLineSystemTreeByStoreCode/${payload.company}/${payload.dcUuid}?code=${payload.code}`, {
      method: 'get',
    });
  }

  export async function findLineSystemTree (payload) {
    return request(`/itms-schedule/itms-schedule/LineSystem/findLineSystemTree/${payload.company}/${payload.dcUuid}`, {
      method: 'get',
    });
  }
  
  export async function deleteLineSystemTree(payload) {
    return request(
      `/itms-schedule/itms-schedule/line/LineSystemTree/deleteLineSystemTree/${payload}`,
      {
        method: 'get',
      }
    );
  }
  export async function deleteLines(payload) {
    return request(
      `/itms-schedule/itms-schedule/line/delete/${payload}`,
      {
        method: 'get',
      }
    );
  }
  export async function deleteLineStoreAddressById(payload) {
    return request(`/itms-schedule/itms-schedule/lineShipAddress/deleteLineAddress/${payload}`, {
      method: 'get',
    });
  }
  export async function inScheduleStore(payload) {
    return request(`/itms-schedule/itms-schedule/lineShipAddress/inScheduleStore/${payload}`, {
      method: 'get',
    });
  }
  
  export async function updateState(LineSystemUuid,state){
    return request(`/itms-schedule/itms-schedule/LineSystem/updateState/${LineSystemUuid}/${state}`, {
      method: 'get',
    });
  }
  export async function isEnable(uuid,enable){
    return request(`/itms-schedule/itms-schedule/LineSystem/updateEnable?systemUuid=${uuid}&enable=${enable}
    &companyUuid=${loginCompany().uuid}&dispatchcenterUuid=${loginOrg().uuid}`);
  }

  export async function backupLineSystem(payload){
    return request(`/itms-schedule/itms-schedule/LineSystem/backupLineSystem?systemUuid=${payload.systemUuid}&note=${payload.note}
    &companyUuid=${payload.companyUuid}&dispatchcenterUuid=${payload.dispatchcenterUuid}`);
  }
  
  // export async function findLineByNameLike(payload) {
  //   return request(`/itms-schedule/itms-schedule/LineSystem/findLineByNameLike/${payload}`, {
  //     method: 'POST',
  //   });
  // }
  export async function addToNewLine(payload) {
    return request(
      `/itms-schedule/itms-schedule/itms-schedule/LineSystem/addToNewLine/${payload.lineuuid}`,
      {
        method: 'POST',
        body: payload.addressIds,
      }
    );
  }
  export async function savePlan(payload) {
    return request(
      `/itms-schedule/itms-schedule/lineShipAddress/savePlan/${payload.lineuuid}`,
      {
        method: 'POST',
        body: payload.addressIds,
      }
    );
  }

  export async function updateStoreAddressList(payload) {
    return request(
      `/itms-schedule/itms-schedule/lineShipAddress/updateStoreAddressList`,
      {
        method: 'POST',
        body: payload.ddressList,
      }
    );
  }

  export async function findChildLine(payload) {
     return await request(
      `/itms-schedule/itms-schedule/line/findChildLine/${payload.uuid}`,
      {
        method: 'GET'
      }
    );
  }
  export async function updateStoreNum(payload) {
    return await request(
     `/itms-schedule/itms-schedule/line/updateStoreNum/${payload.lineUuid}`,
     {
       method: 'GET'
       
     }
   );
 }