const users = "users/";
const workspaces = "workspaces/";
const groups = "groups/";
const channels = "channels/";
const threads = "threads/";

export const getSessionUser = users + "get_session_user";
export const updateUser = users + "update";
export const updatePassword = users + "update_password";
export const updateAvatar = users + "update_avatar";
export const setPresence = users + "heartbeat";
export const resetPresence = users + "reset_presence";
export const resetPassword = users + "reset_password";
export const setPassword = users + "set_password";
export const isConnectedToGoogle = users + "is_connected_to_google";
export const disconnectFromGoogle = users + "disconnect_google";

export const getWorkspace = workspaces + "getone";
export const getDefaultWorkspace = workspaces + "get_default";
export const getAllWorkspaces = workspaces + "get";
export const addWorkspace = workspaces + "add";
export const updateWorkspace = workspaces + "update";
export const removeWorkspace = workspaces + "remove";
export const getWorkspaceUsers = workspaces + "get_users";
export const getPublicChannels = workspaces + "get_public_channels";
export const addWorkspaceUser = workspaces + "add_user";
export const resendInvite = workspaces + "resend_invite";
export const updateWorkspaceUser = workspaces + "update_user";
export const removeWorkspaceUser = workspaces + "remove_user";
export const getUserByEmail = workspaces + "get_user_by_email";
export const getUserById = workspaces + "get_user_by_id";
export const getUserInfo = workspaces + "get_user_info";
export const getUserLocalTime = workspaces + "get_user_local_time";

export const getGroup = groups + "getone";
export const getAllGroups = groups + "get";
export const addGroup = groups + "add";
export const updateGroup = groups + "update";
export const removeGroup = groups + "remove";
export const addUserToGroup = groups + "add_user";
export const addUsersToGroup = groups + "add_users";
export const removeUserFromGroup = groups + "remove_user";
export const removeUsersFromGroup = groups + "remove_users";

export const getChannel = channels + "getone";
export const getAllChannels = channels + "get";
export const addChannel = channels + "add";
export const updateChannel = channels + "update";
export const archiveChannel = channels + "archive";
export const unarchiveChannel = channels + "unarchive";
export const removeChannel = channels + "remove";
export const addUserToChannel = channels + "add_user";
export const addUsersToChannel = channels + "add_users";
export const removeUserFromChannel = channels + "remove_user";
export const removeUsersFromChannel = channels + "remove_users";

export const getThread = threads + "getone";
export const getAllThreads = threads + "get";
export const addThread = threads + "add";
export const updateThread = threads + "update";
export const removeThread = threads + "remove";
export const starThread = threads + "star";
export const unstarThread = threads + "unstar";
export const moveThread = threads + "move_to_channel";
export const getUnreadThreads = threads + "get_unread";
export const markThreadAsRead = threads + "mark_read";
export const markThreadAsUnread = threads + "mark_unread";
export const markAllAsRead = threads + "mark_all_read";
export const clearUnreadThreads = threads + "clear_unread";
export const muteThread = threads + "mute";
export const unmuteThread = threads + "unmute";