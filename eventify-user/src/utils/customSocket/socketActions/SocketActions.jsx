import socketManager from '../SocketManager';
import {CHAT_EVENTS} from '../socketEvents/SocketEvents';

// ======================
// Events to EMIT (send)
// ======================

// Start a new chat session
export const startChat = data => {
  socketManager.emit(CHAT_EVENTS.START_CHAT, data);
};

// Send a message in a chat
export const sendMessage = data => {
  socketManager.emit(CHAT_EVENTS.SEND_MESSAGE, data);
};

// Get chat history
export const getChatHistory = data => {
  socketManager.emit(CHAT_EVENTS.GET_CHAT_HISTORY, data);
};

// Close a chat
export const closeChat = data => {
  socketManager.emit(CHAT_EVENTS.CLOSE_CHAT, data);
};

// Get all chats (superadmin only)
export const getAllChats = () => {
  socketManager.emit(CHAT_EVENTS.GET_ALL_CHATS);
};

// Delete a chat (superadmin only)
export const deleteChat = data => {
  socketManager.emit(CHAT_EVENTS.DELETE_CHAT, data);
};

// ======================
// Events to LISTEN (receive)
// ======================

// Listen for new chat notifications (superadmin)
export const listenToNewChat = callback => {
  socketManager.on(CHAT_EVENTS.NEW_CHAT, callback);
};

// Listen for new messages
export const listenToNewMessage = callback => {
  socketManager.on(CHAT_EVENTS.NEW_MESSAGE, callback);
};

// Listen for chat history responses
export const listenToChatHistory = callback => {
  socketManager.on(CHAT_EVENTS.CHAT_HISTORY, callback);
};

// Listen for chat closed notifications
export const listenToChatClosed = callback => {
  socketManager.on(CHAT_EVENTS.CHAT_CLOSED, callback);
};

// Listen for all chats list (superadmin)
export const listenToAllChatsList = callback => {
  socketManager.on(CHAT_EVENTS.ALL_CHATS_LIST, callback);
};

// Listen for chat deleted notifications
export const listenToChatDeleted = callback => {
  socketManager.on(CHAT_EVENTS.CHAT_DELETED, callback);
};

// Listen for error responses
export const listenToError = callback => {
  socketManager.on(CHAT_EVENTS.ERROR, callback);
};

// Listen for success responses
export const listenToSuccess = callback => {
  socketManager.on(CHAT_EVENTS.SUCCESS, callback);
};

// ======================
// Clean up (to remove listeners)
// ======================

export const removeNewChatListener = () => {
  socketManager.off(CHAT_EVENTS.NEW_CHAT);
};

export const removeNewMessageListener = () => {
  socketManager.off(CHAT_EVENTS.NEW_MESSAGE);
};

export const removeChatHistoryListener = () => {
  socketManager.off(CHAT_EVENTS.CHAT_HISTORY);
};

export const removeChatClosedListener = () => {
  socketManager.off(CHAT_EVENTS.CHAT_CLOSED);
};

export const removeAllChatsListListener = () => {
  socketManager.off(CHAT_EVENTS.ALL_CHATS_LIST);
};

export const removeChatDeletedListener = () => {
  socketManager.off(CHAT_EVENTS.CHAT_DELETED);
};

export const removeErrorListener = () => {
  socketManager.off(CHAT_EVENTS.ERROR);
};

export const removeSuccessListener = () => {
  socketManager.off(CHAT_EVENTS.SUCCESS);
};
