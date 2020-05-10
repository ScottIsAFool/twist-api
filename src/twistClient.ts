import * as endPoints from './endpoints';

import { User, Workspace } from './entities';
import { authUrl, baseUrl, tokenUrl } from './consts';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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

export class TwistClient {
    constructor(
        clientSecret: string,
        clientId: string
    ) {
        this._clientId = clientId;
        this._clientSecret = clientSecret;
    }

    private _clientSecret: string;
    private _clientId: string
    private _accessToken: string | undefined;

    //#region Auth methods

    setAccessToken(accessToken: string) {
        this._accessToken = accessToken;
    }

    getAuthUrl(scopes: scopes[], state: string) {
        const scope = scopes.toString();
        const s = `${authUrl}?client_id=${this._clientId}&scope=${scope}&state=${state}`;
        return s;
    }

    async exchangeToken(code: string): Promise<string> {
        const data = {
            client_id: this._clientId,
            client_secret: this._clientSecret,
            code: code
        };

        const response = await axios.post(tokenUrl, data);

        if (response.status !== 200)
            throw Error;

        const accessToken: AccessToken = response.data;

        return accessToken.access_token;
    }

    //#endregion

    //#region User methods

    getSessionUser(): Promise<User> {
        return this.get<User>(endPoints.getSessionUser);
    }

    updateUser(user: User): Promise<User> {
        return this.post<User>(endPoints.updateUser, user);
    }

    updatePassword(updatedPassword: string): Promise<User> {
        this.throwIfEmpty(updatedPassword, "Password");

        const data = {
            new_password: updatedPassword
        };

        return this.post<User>(endPoints.updatePassword, data);
    }

    updateAvatar(fileName: string, file: any): Promise<User> {
        // TODO: This whole method
        return this.post<User>(endPoints.updateAvatar, {});
    }

    setPresence(workspaceId: number, platform: platform): Promise<any> {
        const data = {
            workspace_id: workspaceId,
            platform: platform
        };

        return this.post<any>(endPoints.setPresence, data);
    }

    resetPresence(workspaceId: number): Promise<any> {
        const data = {
            workspace_id: workspaceId
        };

        return this.post<any>(endPoints.resetPresence, data);
    }

    resetPassword(email: string): Promise<any> {
        this.throwIfEmpty(email, "email");

        const data = {
            email: email
        };

        return this.post<any>(endPoints.resetPassword, data, false);
    }

    setPasswordByCode(resetCode: string, newPassword: string): Promise<User> {
        this.throwIfEmpty(resetCode, "Reset code");
        this.throwIfEmpty(newPassword, "New password");

        const data = {
            reset_code: resetCode,
            new_password: newPassword
        };

        return this.post<User>(endPoints.setPassword, data, false);
    }

    checkGoogleConnection(): Promise<GoogleConnection> {
        return this.get<GoogleConnection>(endPoints.isConnectedToGoogle);
    }

    disconnectFromGoogle(): Promise<any> {
        return this.post<any>(endPoints.disconnectFromGoogle, {});
    }

    //#endregion

    //#region Workspace methods

    getWorkspace(workspaceId: number): Promise<Workspace> {
        const data = {
            id: workspaceId
        };

        return this.get<Workspace>(endPoints.getWorkspace, true, data);
    }

    getDefaultWorkspace(): Promise<Workspace> {
        return this.get<Workspace>(endPoints.getDefaultWorkspace);
    }

    getAllWorkspaces(): Promise<Workspace[]> {
        return this.get<Workspace[]>(endPoints.getAllWorkspaces);
    }

    addWorkspace(options: AddWorkspaceOptions): Promise<Workspace> {
        return this.post<Workspace>(endPoints.addWorkspace, options);
    }

    updateWorkspace(workspaceId: number, options: UpdateWorkspaceOptions): Promise<Workspace> {
        const data = {
            id: workspaceId,
            ...options
        };

        return this.post<Workspace>(endPoints.updateWorkspace, data);
    }

    removeWorkspace(workspaceId: number, password: string): Promise<any> {
        this.throwIfEmpty(password, "Password");

        const data = {
            id: workspaceId,
            current_password: password
        };

        return this.post<any>(endPoints.removeWorkspace, data);
    }

    getWorkspaceUsers(workspaceId: number): Promise<User[]> {
        const data = {
            id: workspaceId
        };

        return this.get<User[]>(endPoints.getWorkspaceUsers, true, data);
    }

    //#endregion

    private checkForAccessToken() {
        if (this.stringIsUndefinedOrEmpty(this._accessToken)) {
            throw new Error("No access token set");
        }
    }

    private throwIfEmpty(value: string, name: string) {
        if (this.stringIsUndefinedOrEmpty(value)) {
            throw new Error(`${name} cannot be undefined or empty`);
        }
    }

    private stringIsUndefinedOrEmpty(str?: string): boolean {
        return str === undefined
            || str.trim() === "";
    }

    private async get<T>(
        endPoint: string,
        requiresAuthentication: boolean = true,
        params: {} = {}
    ): Promise<T> {
        const url = baseUrl + endPoint;
        const options: AxiosRequestConfig = {
            params: params
        };

        if (requiresAuthentication) {
            this.checkForAccessToken();
            options.headers = {
                "Authorization": `Bearer ${this._accessToken}`
            };
        }

        let response: AxiosResponse<any>;
        try {
            response = await axios.get(url, options);

            if (response.status >= 300)
                throw new Error;
        }
        catch (e) {
            throw new Error();
        }

        const body = response.data;
        return body;
    }

    private async post<T>(
        endPoint: string,
        data: {},
        requiresAuthentication: boolean = true,
        isJson: boolean = false
    ): Promise<T> {
        const url = baseUrl + endPoint;
        const options: AxiosRequestConfig = {};

        if (requiresAuthentication) {
            this.checkForAccessToken();
            options.headers = {
                "Authorization": `Bearer ${this._accessToken}`
            };
        }

        if (!isJson) {
            if (options.headers) {
                options.headers = {
                    "content-type": "application/x-www-form-urlencoded",
                    ...options.headers
                };
            }
            else {
                options.headers = {
                    "content-type": "application/x-www-form-urlencoded"
                };
            }
        }

        let response: AxiosResponse<any>;
        try {
            response = await axios.post(url, data, options);

            if (response.status >= 300)
                throw new Error();
        }
        catch (e) {
            throw new Error();
        }

        const body = response.data;
        return body;
    }

    private async delete(
        endPoint: string,
        requiresAuthentication: boolean = true,
        useSyncApi: boolean = false
    ): Promise<any> {
        const url = baseUrl + endPoint;
        const options: AxiosRequestConfig = {};

        if (requiresAuthentication) {
            this.checkForAccessToken();
            options.headers = {
                "Authorization": `Bearer ${this._accessToken}`
            };
        }

        const response = await axios.delete(url, options);

        if (response.status >= 300) {
            throw new Error;
        }
    }
}

interface AccessToken {
    access_token: string,
    token_type: string
};

export interface GoogleConnection {
    google_connection: boolean;
    google_email: string;
};