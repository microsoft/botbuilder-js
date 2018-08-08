
export interface Alarm {
    title: string;
    time: string;
}

export interface AlarmUser {
    alarms: Alarm[];
}
