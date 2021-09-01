import { stringify } from 'qs';
import request from '@/utils/request';

export async function getByUuid(payload) {
    return request(`/iwms-facility/facility/vendordispatch?uuid=${payload}`);
}

export async function getByVendorUuid(payload) {
    return request(`/iwms-facility/facility/vendordispatch/vendor?vendorUuid=${payload.vendorUuid}&dcUuid=${payload.dcUuid}`);
}

export async function query(payload) {
    return request(`/iwms-facility/facility/vendordispatch/page`, {
        method: 'POST',
        body: payload,
    });
}

export async function genPickupBillByVendor(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/genpickup/vendor?vendorUuid=${payload.vendorUuid}&ownerUuid=${payload.ownerUuid}&companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}&method=${payload.method}`, {
            method: 'POST'
        });
}

export async function genPickupBillByContainer(payload) {
    return request(`/iwms-facility/facility/vendorrtnpick/genpickup/container?vendorUuid=${payload.vendorUuid}&ownerUuid=${payload.ownerUuid}&companyUuid=${payload.companyUuid}&dcUuid=${payload.dcUuid}&method=${payload.method}`, {
            method: 'POST',
            body: payload.containerBarcodes,
        });
}