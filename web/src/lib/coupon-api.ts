import { request } from "@/lib/api-request";
import type { CouponInput, CouponListData, UserCouponView } from "@/server/types/coupon.types";

const ADMIN_URL = "/api/admin/coupons";

export const fetchCoupons = async (): Promise<CouponListData> =>
  (await request<{ data: CouponListData }>("GET", ADMIN_URL)).data;

export const saveCoupon = async (id: string | null, input: CouponInput): Promise<void> => {
  await request<{ ok: boolean }>(id ? "PUT" : "POST", id ? `${ADMIN_URL}/${id}` : ADMIN_URL, input);
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await request<{ ok: boolean }>("DELETE", `${ADMIN_URL}/${id}`);
};

export const assignCoupon = async (id: string, userId: string): Promise<void> => {
  await request<{ ok: boolean }>("POST", `${ADMIN_URL}/${id}/assign`, { userId });
};

export const fetchMyCoupons = async (): Promise<UserCouponView[]> =>
  (await request<{ data: UserCouponView[] }>("GET", "/api/coupons")).data;
