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
    BATCH_INFO:         GET_PREFIX + API.GET.BATCH_INFO,
    ASSIGNMENTS:        GET_PREFIX + API.GET.ASSIGNMENTS,
    USER_PROGRESS:      GET_PREFIX + API.GET.USER_PROGRESS,
    TEST_PROGRESS:      GET_PREFIX + API.GET.TEST_PROGRESS,
  },
  POST: {
    INIT_TEST:          POST_PREFIX + API.POST.INIT_TEST,
    START_TEST:         POST_PREFIX + API.POST.START_TEST,
    FINISH_TEST:        POST_PREFIX + API.POST.FINISH_TEST,
    FORCE_FINISH_TEST:  POST_PREFIX + API.POST.FORCE_FINISH_TEST,
    CONTINUE_TEST:      POST_PREFIX + API.POST.CONTINUE_TEST,
    CANCEL_TEST:        POST_PREFIX + API.POST.CANCEL_TEST,
    CLOSE_TEST:         POST_PREFIX + API.POST.CLOSE_TEST,
    SAVE_TEST_ITEM:     POST_PREFIX + API.POST.SAVE_TEST_ITEM,
  }
}