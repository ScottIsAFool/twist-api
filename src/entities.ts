export interface AvatarUrls {
    s35: string;
    s195: string;
    s60: string;
    s640: string;
};

export interface AwayMode {
    date_from: Date;
    type: AwayType;
    date_to: Date;
};

export enum AwayType {
    parental,
    vacation,
    sickleave,
    other
};

export interface Email {
    connected: number[];
    email: string;
    primary: boolean;
};

export interface User {
    scheduled_banners: string[];
    feature_flags: string[];
    client_id: string;
    short_name: string;
    contact_info: string;
    snooze_dnd_start: string;
    bot: boolean;
    profession: string;
    time_format: string;
    avatar_urls: AvatarUrls;
    date_format: string;
    timezone: string;
    removed: boolean;
    avatar_id: string;
    id: number;
    comet_channel: string;
    lang: string;
    away_mode: AwayMode;
    first_name: string;
    comet_server: string;
    name: string;
    doist_employee: boolean;
    off_days: number[];
    restricted: boolean;
    original_avatar_id: string;
    default_workspace: number;
    token: string;
    emails: Email[];
    theme: string;
    version: number;
    snooze_dnd_end: string;
    snoozed: boolean;
    email: string;
    setup_pending: boolean;
    snooze_until?: number;
};

export interface Workspace {
    created_ts: number;
    version: number;
    default_channel: number;
    name: string;
    creator: number;
    color: number;
    default_conversation: number;
    id: number;
    plan: string;
};

export interface Channel {
    workspace_id: number;
    user_ids: number[];
    name: string;
    creator: number;
    color: number;
    created_ts: number;
    description: string;
    archived: boolean;
    id: number;
    public: boolean;
};