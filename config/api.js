const API = {
  GET: {
    BATCH_INFO:         'get-batch-info',
    ASSIGNMENTS:        'get-assignments',
    USER_PROGRESS:      'get-user-progress',
    TEST_PROGRESS:      'get-test-progress',
  },
  POST: {
    INIT_TEST:          'init-test',
    START_TEST:         'start-test',
    FINISH_TEST:        'finish-test',
    FORCE_FINISH_TEST:  'force-finish-test',
    CONTINUE_TEST:      'continue-test',
    CANCEL_TEST:        'cancel-test',
    CLOSE_TEST:         'close-test',
    SAVE_TEST_ITEM:     'save-test-item',
  }
}

export default API