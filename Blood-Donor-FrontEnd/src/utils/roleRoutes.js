export const POST_LOGIN_ROUTES = {
  USER: '/user-home',
  DONOR: '/donor-home',
  HOSPITAL: '/',
  BLOOD_BANK: '/',
  ADMIN: '/',
};
  
  export function getPostLoginRoute(role) {
    return POST_LOGIN_ROUTES[role] || '/';
  }