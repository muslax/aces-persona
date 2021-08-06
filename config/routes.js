import API from "./api";

export const ROUTES = {
  Home:     '/',
  Persona:  '/persona',
  Workbook: '/workbook',
}

const GET_PREFIX = `/api/get?q=`;
const POST_PREFIX = `/api/post?q=`;

export const API_ROUTES = {
  Token:    '/api/token',
  Login:    '/api/login',
  Logout:   '/api/logout',
  User:     '/api/user',
  GET:      '/api/get?',
  POST:     '/api/post?',

  GET: {
    BATCH_INFO: GET_PREFIX + API.GET.BATCH_INFO,
    USER_PROGRESS: GET_PREFIX + API.GET.USER_PROGRESS,
  }
}