import * as endPoints from './endpoints';

import { User, Workspace } from './entities';
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

export const updateUser = (user: User): Promise<User> => {
    return post<User>(endPoints.updateUser, user);
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
    const data = {
        workspace_id: workspaceId,
        platform: platform
    };

    return post<any>(endPoints.setPresence, data);
};

export const resetPresence = (workspaceId: number): Promise<any> => {
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
    return post<Workspace>(endPoints.addWorkspace, options);
};

export const updateWorkspace = (workspaceId: number, options: UpdateWorkspaceOptions): Promise<Workspace> => {
    const data = {
        id: workspaceId,
        ...options
    };

    return post<Workspace>(endPoints.updateWorkspace, data);
};

export const removeWorkspace = (workspaceId: number, password: string): Promise<any> => {
    throwIfEmpty(password, "Password");

    const data = {
        id: workspaceId,
        current_password: password
    };

    return post<any>(endPoints.removeWorkspace, data);
};

export const getWorkspaceUsers = (workspaceId: number): Promise<User[]> => {
    const data = {
        id: workspaceId
    };

    return get<User[]>(endPoints.getWorkspaceUsers, data, true);
}

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