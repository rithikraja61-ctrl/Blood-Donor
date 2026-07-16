export const POST_LOGIN_ROUTES = {
    USER: '/find-donor',
    DONOR: '/',
    HOSPITAL: '/',
    BLOOD_BANK: '/',
    ADMIN: '/',
  };
  
  export function getPostLoginRoute(role) {
    return POST_LOGIN_ROUTES[role] || '/';
  }