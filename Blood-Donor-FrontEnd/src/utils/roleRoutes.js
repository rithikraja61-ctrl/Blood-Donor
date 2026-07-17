export const POST_LOGIN_ROUTES = {
  USER: '/user-home',
  DONOR: '/donor-home',
  HOSPITAL: '/hospital-home',
  BLOOD_BANK: '/blood-bank-home',
  ADMIN: '/',
};
  
  export function getPostLoginRoute(role) {
    return POST_LOGIN_ROUTES[role] || '/';
  }