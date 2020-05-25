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
    id: number;
    name: string;
    description: string;
    creator: number;
    user_ids?: number[];
    color: number;
    public: boolean;
    workspace_id: number;
    archived: boolean;
    created_ts: number;
};

export interface Group {
    id: number;
    name: string;
    description?: string;
    user_ids: number[];
    workspace_id: number;
};

export interface Reactions {
};

export interface Thread {
    id: number;
    title: string;
    content: string;
    starred: boolean;
    creator: number;
    channel_id: number;
    workspace_id: number;
    attachments?: Attachment[];
    actions: ActionButton[];
    recipients: number[];
    participants: number[];
    groups: number[];
    reactions: Reactions;
    comment_count: number;
    last_obj_index: number;
    snippet: string;
    snippet_creator: number;
    last_updated_ts: number;
    muted_until?: number;
    system_message?: SystemMessage;
    posted_ts: number;
    last_edited_ts: number;
};

export interface Attachment {
    attachment_id: string;
    title: string;
    url: string;
    url_type: string;
    file_name: string;
    file_size: number;
    underlying_type: string;
    image: string;
    image_height: number;
    image_width: number;
    upload_state: string;
};

export interface ActionButton {
    action: string;
    url?: string;
    type: string;
    button_text: string;
    message?: string;
};

export interface SystemMessage {
    is_integration?: any;
    initiator: number;
    initiator_name: string;
    channel_id: number;
    type: string;
    comment_id: number;
    initiator_id: number;
    thread_id: number;
};

export interface Reactions {
    "👍": number[];
};

export interface Comment {
    id: number;
    content: string;
    creator: number;
    thread_id: number;
    channel_id: number;
    workspace_id: number;
    obj_index: number;
    attachments?: Attachment[];
    recipients: number[];
    groups: number[];
    reactions: Reactions;
    is_deleted: boolean;
    system_message?: SystemMessage;
    posted_ts: number;
    last_edited_ts: number;
};

export interface ConversationMessage {
    reactions: Reactions;
    workspace_id: number;
    creator: number;
    deleted: boolean;
    actions: ActionButton[];
    conversation_id: number;
    last_edited_ts?: number;
    direct_mentions: any[];
    system_message?: SystemMessage;
    id: number;
    attachments: Attachment[];
    posted_ts: number;
    obj_index: number;
    content: string;
};

export interface Conversation {
    id: number;
    title?: string;
    private: boolean;
    creator: number;
    last_message: ConversationMessage;
    workspace_id: number;
    user_ids: number[];
    message_count: number;
    last_obj_index: number;
    snippet: string;
    snippet_creators: number[];
    last_active_ts: number;
    muted_until_ts?: number;
    archived: boolean;
    created_ts: number;
};