const NODE_ENV = process.env.NODE_ENV || 'production';

export const debugLogs = (log: string) => {
    if (NODE_ENV === 'development') {
        console.debug("[DEBUG] : " + log);
    }
}

export const printLogs = (log: string) => {
    console.log(log);
}