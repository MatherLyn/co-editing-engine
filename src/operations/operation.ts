export interface Operation {
    exec(...args: any[]): boolean;
    isExecutable(): boolean;
}
