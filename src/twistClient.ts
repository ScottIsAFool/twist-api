import * as endPoints from './endpoints';

import { ActionButton, Attachment, AwayMode, Channel, Comment, Group, Thread, User, Workspace } from './entities';
import { authUrl, baseUrl, tokenUrl } from './consts';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosStatic } from 'axios';

import create from '@alcadica/state-manager';
import { scopes } from './Scopes';

export enum platform {
    mobile,
    desktop,
    api
};

interface AddWorkspaceOptions {
    name: string;
    temp_id?: number;
    color?: number;
};

interface UpdateWorkspaceOptions {
    name?: string;
    color?: number;
};

interface ClientDetails {
    clientSecret: string;
    clientId: string;
};

export interface UpdateUserOptions {
    name?: string;
    email?: string;
    password?: string;
    default_workspace?: number;
    profession?: string;
    contact_info?: string;
    timezone?: string;
    snooze_until?: number;
    snooze_dnd_start?: string;
    snooze_dnd_end?: string;
    away_mode?: AwayMode;
    off_days?: number[]
};

export interface AddUserOptions {
    email: string;
    name?: string;
    user_type?: userType,
    channel_ids?: number[]
};

export enum userType {
    guest = "GUEST",
    user = "USER",
    admin = "ADMIN"
};

export enum filterThreadBy {
    attachedToMe = "attached_to_me",
    everyone = "everyone",
    isStarred = "is_starred"
};

export enum orderBy {
    descending = "DESC",
    ascending = "ASC"
};

const clientDetailsState = create<ClientDetails>();
const accessTokenState = create<AccessToken>();

const accessToken = () => accessTokenState.getState().access_token;
const clientId = () => clientDetailsState.getState().clientId;
const clientSecret = () => clientDetailsState.getState().clientSecret;

//#region Auth methods

export const setClientDetails = (
    clientSecret: string,
    clientId: string
) => {
    clientDetailsState.update({
        clientId: clientId,
        clientSecret: clientSecret
    });
};

export const setAccessToken = (accessToken: string) => {
    accessTokenState.update({ access_token: accessToken });
};

export const getAuthUrl = (scopes: scopes[], state: string) => {
    const scope = scopes.toString();
    return `${authUrl}?client_id=${clientId()}&scope=${scope}&state=${state}`;
};

export const exchangeToken = async (code: string): Promise<string> => {
    const data = {
        client_id: clientId(),
        client_secret: clientSecret(),
        code: code
    };

    const response = await axios.post(tokenUrl, data);

    if (response.status !== 200)
        throw Error;

    const accessToken: AccessToken = response.data;

    return accessToken.access_token;
};

//#endregion

//#region User methods

export const getSessionUser = (): Promise<User> => {
    return get<User>(endPoints.getSessionUser);
};

export const updateUser = (options: UpdateUserOptions): Promise<User> => {
    return post<User>(endPoints.updateUser, options);
};

export const updatePassword = (updatedPassword: string): Promise<User> => {
    throwIfEmpty(updatedPassword, "Password");

    const data = {
        new_password: updatedPassword
    };

    return post<User>(endPoints.updatePassword, data);
};

export const updateAvatar = (fileName: string, file: any): Promise<User> => {
    // TODO: This whole method
    return post<User>(endPoints.updateAvatar, {});
};

export const setPresence = (workspaceId: number, platform: platform): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = {
        workspace_id: workspaceId,
        platform: platform
    };

    return post<any>(endPoints.setPresence, data);
};

export const resetPresence = (workspaceId: number): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = {
        workspace_id: workspaceId
    };

    return post<any>(endPoints.resetPresence, data);
};

export const resetPassword = (email: string): Promise<any> => {
    throwIfEmpty(email, "email");

    const data = {
        email: email
    };

    return post<any>(endPoints.resetPassword, data, false);
};

export const setPasswordByCode = (resetCode: string, newPassword: string): Promise<User> => {
    throwIfEmpty(resetCode, "Reset code");
    throwIfEmpty(newPassword, "New password");

    const data = {
        reset_code: resetCode,
        new_password: newPassword
    };

    return post<User>(endPoints.setPassword, data, false);
};

export const checkGoogleConnection = (): Promise<GoogleConnection> => {
    return get<GoogleConnection>(endPoints.isConnectedToGoogle);
};

export const disconnectFromGoogle = (): Promise<any> => {
    return post<any>(endPoints.disconnectFromGoogle, {});
};

//#endregion

//#region Workspace methods

export const getWorkspace = (workspaceId: number): Promise<Workspace> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = {
        id: workspaceId
    };

    return get<Workspace>(endPoints.getWorkspace, data, true);
};

export const getDefaultWorkspace = (): Promise<Workspace> => {
    return get<Workspace>(endPoints.getDefaultWorkspace);
};

export const getAllWorkspaces = (): Promise<Workspace[]> => {
    return get<Workspace[]>(endPoints.getAllWorkspaces);
};

export const addWorkspace = (options: AddWorkspaceOptions): Promise<Workspace> => {
    throwIfEmpty(options.name, "Name");

    return post<Workspace>(endPoints.addWorkspace, options);
};

export const updateWorkspace = (workspaceId: number, options: UpdateWorkspaceOptions): Promise<Workspace> => {
    throwIfInvalidId(workspaceId, "Workspace");

    if (options.name && stringIsUndefinedOrEmpty(options.name)) {
        throw new Error("Please provide a valid name to update");
    }

    if (!options.name && !options.color) {
        throw new Error("You need to provide either a name or color to update");
    }

    const data = {
        id: workspaceId,
        ...options
    };

    return post<Workspace>(endPoints.updateWorkspace, data);
};

export const removeWorkspace = (workspaceId: number, password: string): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(password, "Password");

    const data = {
        id: workspaceId,
        current_password: password
    };

    return post<any>(endPoints.removeWorkspace, data);
};

export const getWorkspaceUsers = (workspaceId: number): Promise<User[]> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = {
        id: workspaceId
    };

    return get<User[]>(endPoints.getWorkspaceUsers, data, true);
}

export const getPublicChannels = (workspaceId: number): Promise<Channel[]> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = { id: workspaceId };

    return get<Channel[]>(endPoints.getPublicChannels, data);
};

//#endregion

//#region Workspace User methods

export const addUser = (workspaceId: number, options: AddUserOptions): Promise<User> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.email, "Email");

    const data = {
        id: workspaceId,
        ...options
    };

    return post<User>(endPoints.addWorkspaceUser, data);
};

export const resendInvite = (
    workspaceId: number,
    options: {
        email: string,
        user_id?: number
    }
): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.email, "Email");

    const data = {
        id: workspaceId,
        ...options
    };

    return post<any>(endPoints.resendInvite, data);
};

export const updateWorkspaceUser = (
    workspaceId: number,
    options: {
        user_type: userType,
        email?: string,
        user_id?: number
    }
): Promise<User> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.user_type, "User type");

    if (options.email && stringIsUndefinedOrEmpty(options.email)) {
        throw new Error("Please provide a valid email address to update");
    }

    const data = {
        id: workspaceId,
        ...options
    };

    return post<User>(endPoints.updateWorkspaceUser, data);
};

export const removeWorkspaceUser = (
    workspaceId: number,
    options: {
        email: string,
        user_id?: number
    }
): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.email, "Email");

    const data = {
        id: workspaceId,
        ...options
    };

    return post<any>(endPoints.removeWorkspaceUser, data);
};

export const getUserByEmail = (
    workspaceId: number,
    email: string
): Promise<User> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(email, "Email");

    const data = {
        id: workspaceId,
        email: email
    };

    return post<any>(endPoints.getUserByEmail, data);
};

export const getUserById = (
    workspaceId: number,
    user_id: number
): Promise<User> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfInvalidId(user_id, "User");

    const data = {
        id: workspaceId,
        user_id: user_id
    };

    return post<any>(endPoints.getUserById, data);
};

export const getUserInfo = (
    workspaceId: number,
    user_id: number
): Promise<User> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfInvalidId(user_id, "User");

    const data = {
        id: workspaceId,
        user_id: user_id
    };

    return post<any>(endPoints.getUserInfo, data);
};

export const getUserLocalTime = (
    workspaceId: number,
    user_id: number
): Promise<Date> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfInvalidId(user_id, "User");

    const data = {
        id: workspaceId,
        user_id: user_id
    };

    return post<Date>(endPoints.getUserLocalTime, data);
}

//#endregion

//#region Groups methods

export const getGroup = (groupId: number): Promise<Group> => {
    throwIfInvalidId(groupId, "Group");

    const data = { id: groupId };

    return get<Group>(endPoints.getGroup, data);
};

export const getAllGroups = (workspaceId: number): Promise<Group[]> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = { id: workspaceId };

    return get<Group[]>(endPoints.getAllGroups, data);
};

export const addGroup = (
    workspaceId: number,
    options: {
        name: string,
        user_ids?: number[]
    }
): Promise<Group> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.name, "Name");

    const data = {
        workspace_id: workspaceId,
        ...options
    };

    return post<Group>(endPoints.addGroup, data);
};

export const updateGroup = (
    groupId: number,
    options: {
        name: string
    }
): Promise<Group> => {
    throwIfInvalidId(groupId, "Group");
    throwIfEmpty(options.name, "Name");

    const data = {
        id: groupId,
        ...options
    };

    return post<Group>(endPoints.updateGroup, data);
};

export const removeGroup = (groupId: number): Promise<any> => {
    throwIfInvalidId(groupId, "Group");

    const data = { id: groupId };

    return post<any>(endPoints.removeGroup, data);
};

export const addUserToGroup = (
    groupId: number,
    options: {
        user_id: number
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    throwIfInvalidId(options.user_id, "User");

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.addUserToGroup, data);
};

export const addUsersToGroup = (
    groupId: number,
    options: {
        user_ids: number[]
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    options.user_ids.forEach(x => throwIfInvalidId(x, "User"));

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.addUsersToGroup, data);
};

export const removeUserFromGroup = (
    groupId: number,
    options: {
        user_id: number
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    throwIfInvalidId(options.user_id, "User");

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.removeUserFromGroup, data);
};

export const removeUsersFromGroup = (
    groupId: number,
    options: {
        user_ids: number[]
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    options.user_ids.forEach(x => throwIfInvalidId(x, "User"));

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.removeUsersFromGroup, data);
};

//#endregion

//#region Channel methods

export const getChannel = (channelId: number): Promise<Channel> => {
    throwIfInvalidId(channelId, "Channel");

    const data = { id: channelId };

    return get<Channel>(endPoints.getChannel, data);
};

export const getAllChannels = (
    workspaceId: number,
    options: {
        archived?: boolean
    }
): Promise<Channel[]> => {
    throwIfInvalidId(workspaceId, "Workdspace");

    const data = {
        workdspace_id: workspaceId,
        ...options
    };

    return get<Channel[]>(endPoints.getAllChannels, data);
};

export const addChannel = (
    workspaceId: number,
    options: {
        name: string,
        temp_id?: number,
        user_ids?: number[],
        color?: number,
        public?: boolean,
        description?: string
    }
): Promise<Channel> => {
    throwIfInvalidId(workspaceId, "Workspace");
    throwIfEmpty(options.name, "Name");

    const data = {
        workspace_id: workspaceId,
        ...options
    };

    return post<Channel>(endPoints.addChannel, data);
};

export const updateChannel = (
    groupId: number,
    options: {
        name?: string,
        color?: number,
        public?: boolean,
        description?: string
    }
): Promise<Channel> => {
    throwIfInvalidId(groupId, "Group");

    const data = {
        id: groupId,
        ...options
    };

    return post<Channel>(endPoints.updateChannel, data);
};

export const archiveChannel = (groupId: number): Promise<any> => {
    throwIfInvalidId(groupId, "Group");

    const data = { id: groupId };

    return post<any>(endPoints.archiveChannel, data);
};

export const unarchiveChannel = (groupId: number): Promise<any> => {
    throwIfInvalidId(groupId, "Group");

    const data = { id: groupId };

    return post<any>(endPoints.unarchiveChannel, data);
};

export const removeChannel = (groupId: number): Promise<any> => {
    throwIfInvalidId(groupId, "Group");

    const data = { id: groupId };

    return post<any>(endPoints.removeChannel, data);
};

export const addUserToChannel = (
    groupId: number,
    options: {
        user_id: number
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    throwIfInvalidId(options.user_id, "User");

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.addUserToChannel, data);
};

export const addUsersToChannel = (
    groupId: number,
    options: {
        user_ids: number[]
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    options.user_ids.forEach(x => throwIfInvalidId(x, "User"));

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.addUsersToChannel, data);
};

export const removeUserFromChannel = (
    groupId: number,
    options: {
        user_id: number
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    throwIfInvalidId(options.user_id, "User");

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.removeUserFromChannel, data);
};

export const removeUsersFromChannel = (
    groupId: number,
    options: {
        user_ids: number[]
    }
): Promise<any> => {
    throwIfInvalidId(groupId, "Group");
    options.user_ids.forEach(x => throwIfInvalidId(x, "User"));

    const data = {
        id: groupId,
        ...options
    };

    return post<any>(endPoints.removeUsersFromChannel, data);
};

//#endregion

//#region Thread methods

export const getThread = (threadId: number): Promise<Thread> => {
    throwIfInvalidId(threadId, "Thread");

    const data = { id: threadId };

    return get<Thread>(endPoints.getThread, data);
};

export const getAllThreads = (
    channelId: number,
    options: {
        filter_by?: filterThreadBy,
        newer_than_ts?: Date,
        older_than_ts?: Date,
        limit?: number,
        as_ids?: boolean
    }
): Promise<Thread[]> => {
    throwIfInvalidId(channelId, "Channel");

    const data = {
        channel_id: channelId,
        ...options
    };

    return get<Thread[]>(endPoints.getAllThreads, data);
};

export const addThread = (
    channelId: number,
    options: {
        title: string,
        content: string,
        attachments?: Attachment[],
        actions?: ActionButton[],
        recipients?: number[],
        groups?: number[],
        temp_id?: number,
        send_as_integration?: boolean
    }
): Promise<Thread> => {
    throwIfInvalidId(channelId, "Channel");
    throwIfEmpty(options.title, "Title");
    throwIfEmpty(options.content, "Content");

    const data = {
        channel_id: channelId,
        ...options
    };

    return post<Thread>(endPoints.addThread, data);
};

export const updateThread = (
    threadId: number,
    options: {
        title?: string,
        content?: string,
        attachments?: Attachment[],
        actions?: ActionButton[],
    }
): Promise<Thread> => {
    throwIfInvalidId(threadId, "Thread");

    if (options.title && stringIsUndefinedOrEmpty(options.title)) {
        throw new Error("You must set a valid title");
    }

    if (options.content && stringIsUndefinedOrEmpty(options.content)) {
        throw new Error("You must set valid content");
    }

    const data = {
        id: threadId,
        ...options
    };

    return post<Thread>(endPoints.updateThread, data);
};

export const removeThread = (threadId: number): Promise<any> => {
    throwIfInvalidId(threadId, "Thread");

    const data = { id: threadId };

    return post<any>(endPoints.removeThread, data);
};

export const starThread = (threadId: number): Promise<any> => {
    throwIfInvalidId(threadId, "Thread");

    const data = { id: threadId };

    return post<any>(endPoints.starThread, data);
};

export const unstarThread = (threadId: number): Promise<any> => {
    throwIfInvalidId(threadId, "Thread");

    const data = { id: threadId };

    return post<any>(endPoints.unstarThread, data);
};

export const moveThread = (
    threadId: number,
    options: {
        channelId: number
    }
): Promise<any> => {
    throwIfInvalidId(threadId, "Thread");
    throwIfInvalidId(options.channelId, "Channel");

    const data = {
        id: threadId,
        to_channel: options.channelId
    };

    return post<any>(endPoints.moveThread, data);
};

export const getUnreadThreads = (
    workspaceId: number
): Promise<Thread[]> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = { workspace_id: workspaceId };

    return get<Thread[]>(endPoints.getUnreadThreads, data);
};

export const markThreadAsRead = (
    threadId: number,
    options: {
        obj_index: number
    }
): Promise<Thread[]> => {
    throwIfInvalidId(threadId, "Thread");

    const data = {
        id: threadId,
        ...options
    };

    return get<Thread[]>(endPoints.markThreadAsRead, data);
};

export const markThreadAsUnread = (
    threadId: number,
    options: {
        obj_index: number
    }
): Promise<Thread[]> => {
    throwIfInvalidId(threadId, "Thread");

    const data = {
        id: threadId,
        ...options
    };

    return get<Thread[]>(endPoints.markThreadAsUnread, data);
};

export const markAllThreadsAsRead = (
    options: {
        workspaceId?: number,
        channelId?: number
    }
): Promise<any> => {
    if (options.workspaceId) {
        throwIfInvalidId(options.workspaceId, "Workspace");
    }

    if (options.channelId) {
        throwIfInvalidId(options.channelId, "Channel");
    }

    if (!options.workspaceId && !options.channelId) {
        throw new Error("Please set either a workspace ID or a channel ID");
    }

    return post<any>(endPoints.markAllAsRead, options);
};

export const clearUnreadThreads = (workspaceId: number): Promise<any> => {
    throwIfInvalidId(workspaceId, "Workspace");

    const data = { workspace_id: workspaceId };

    return post<any>(endPoints.clearUnreadThreads, data);
};

export const muteThread = (
    threadId: number,
    options: {
        minutes: number
    }
): Promise<Thread> => {
    throwIfInvalidId(threadId, "Thread");

    if (options.minutes < 0) {
        throw new Error("Invalid value for minutes");
    }

    const data = {
        id: threadId,
        ...options
    };

    return post<Thread>(endPoints.muteThread, data);
};

export const unmuteThread = (threadId: number): Promise<Thread> => {
    throwIfInvalidId(threadId, "Thread");

    const data = { id: threadId };

    return post<Thread>(endPoints.unmuteThread, data);
};

//#endregion

//#region Comment methods

export const getComment = (commentId: number): Promise<Comment> => {
    throwIfInvalidId(commentId, "Comment");

    const data = { id: commentId };

    return get<Comment>(endPoints.getComment, data);
};

export const getAllComments = (
    threadId: number,
    options: {
        newer_than_ts?: number,
        older_than_ts?: number,
        from_obj_index?: number,
        to_obj_index?: number,
        limit?: number,
        order_by?: orderBy,
        as_ids?: boolean
    }
): Promise<Comment[]> => {
    throwIfInvalidId(threadId, "Thread");

    const data = {
        id: threadId,
        ...options
    };

    return get<Comment[]>(endPoints.getAllComments, data);
};

export const addComment = (
    threadId: number,
    options: {
        content: string,
        attachments?: Attachment[],
        actions?: ActionButton[],
        recipients?: number[],
        groups?: number[],
        temp_id?: number,
        mark_thread_position?: boolean,
        send_as_integration?: boolean
    }
): Promise<Comment> => {
    throwIfInvalidId(threadId, "Thread");
    throwIfEmpty(options.content, "Content");

    const data = {
        thread_id: threadId,
        ...options
    };

    return post<Comment>(endPoints.addComment, data);
};

export const updateComment = (
    commentId: number,
    options: {
        content?: string,
        attachments?: Attachment[],
        actions?: ActionButton[]
    }
): Promise<any> => {
    throwIfInvalidId(commentId, "Comment");

    if (options.content) {
        throwIfEmpty(options.content, "Content");
    }

    const data = {
        id: commentId,
        ...options
    };

    return post<Comment>(endPoints.updateComment, data);
};

export const removeComment = (commentId: number): Promise<any> => {
    throwIfInvalidId(commentId, "Comment");

    const data = { id: commentId };

    return post<any>(endPoints.removeComment, data);
};

export const markCommentPosition = (
    threadId: number,
    commentId: number
): Promise<any> => {
    throwIfInvalidId(threadId, "Thread");
    throwIfInvalidId(commentId, "Comment");

    const data = {
        thread_id: threadId,
        comment_id: commentId
    };

    return post<any>(endPoints.markCommentPosition, data);
};

//#endregion

const checkForAccessToken = () => {
    if (stringIsUndefinedOrEmpty(accessToken())) {
        throw new Error("No access token set");
    }
};

const throwIfEmpty = (value: string, name: string) => {
    if (stringIsUndefinedOrEmpty(value)) {
        throw new Error(`${name} cannot be undefined or empty`);
    }
};

const throwIfInvalidId = (value: number, name: string) => {
    if (value <= 0) {
        throw new Error(`Invlaid ${name} ID`);
    }
};

const stringIsUndefinedOrEmpty = (str?: string): boolean => {
    return str === undefined
        || str.trim() === "";
};

const get = async <T>(
    endPoint: string,
    params: {} = {},
    requiresAuthentication = true
): Promise<T> => {
    return await makeTheCall(
        endPoint,
        requiresAuthentication,
        (u, t, o) => {
            o.params = params;
            return t.get(u, o);
        }
    );
};

const post = async <T>(
    endPoint: string,
    data: {} = {},
    requiresAuthentication = true
): Promise<T> => {
    return await makeTheCall(
        endPoint,
        requiresAuthentication,
        (u, t, o) => t.post(u, data, o)
    );
};

const deleteCall = async (
    endPoint: string,
    requiresAuthentication = true
): Promise<any> => {
    return await makeTheCall(
        endPoint,
        requiresAuthentication,
        (u, t, o) => t.delete(u, o)
    );
};

const makeTheCall = async <T>(
    endPoint: string,
    requiresAuthentication = true,
    call: (u: string, t: AxiosStatic, o: AxiosRequestConfig) => Promise<AxiosResponse>
): Promise<T> => {
    const apiUrl = baseUrl;
    const url = apiUrl + endPoint;
    const options: AxiosRequestConfig = {};

    if (requiresAuthentication) {
        checkForAccessToken();
        options.headers = {
            "Authorization": `Bearer ${accessToken()}`
        };
    }

    let response: AxiosResponse<any>;
    try {
        response = await call(url, axios, options);
    }
    catch (e) {
        throw new Error();
    }

    if (response.status >= 300)
        throw new Error();

    const body = response.data;
    return body;
};

interface AccessToken {
    access_token: string,
    token_type: string
};

export interface GoogleConnection {
    google_connection: boolean;
    google_email: string;
};