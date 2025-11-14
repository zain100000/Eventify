export const CHAT_EVENTS = {
  // ======================
  // Events to EMIT (send)
  // ======================

  // Client emits to start a new chat
  START_CHAT: 'startChat',

  // Client emits to send a message
  SEND_MESSAGE: 'sendMessage',

  // Client emits to get chat history
  GET_CHAT_HISTORY: 'getChatHistory',

  // Client emits to close a chat
  CLOSE_CHAT: 'closeChat',

  // Client emits to get all chats (superadmin only)
  GET_ALL_CHATS: 'getAllChats',

  // Client emits to delete a chat (superadmin only)
  DELETE_CHAT: 'deleteChat',

  // ======================
  // Events to LISTEN (receive)
  // ======================

  // Server emits when a new chat is created
  NEW_CHAT: 'newChat',

  // Server emits when a new message is received
  NEW_MESSAGE: 'newMessage',

  // Server emits the chat history
  CHAT_HISTORY: 'chatHistory',

  // Server emits when a chat is closed
  CHAT_CLOSED: 'chatClosed',

  // Server emits the list of all chats
  ALL_CHATS_LIST: 'allChatsList',

  // Server emits when a chat is deleted
  CHAT_DELETED: 'chatDeleted',

  // ======================
  // General events
  // ======================
  ERROR: 'error',
  SUCCESS: 'success',
};
