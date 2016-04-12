/// <reference path="../../common/def/jquery.d.ts" />
declare var Hashids: any;

/**
 * The server API singleton
 * This acts as the central server API endpoint for the rest of the app
 */
class Server {
    private static URL: string = "http://kimbee.herokuapp.com/api/";

    private static INSTANCE: Server = null;

    private key: string;
    private enabled: boolean;

    /**
     * Should not be called directly. Use getInstance() instead.
     */
    constructor() {
        if (Server.INSTANCE != null) {
            throw 'Singleton already constructed!';
        }
    }

    /**
     * Gets the singleton instance of the API
     * @returns {API} the speech processor instance
     */
    public static getInstance(): Server {
        if (Server.INSTANCE == null) {
            Server.INSTANCE = new Server();
        }

        return Server.INSTANCE;
    }

    /**
     * Get the client key used by the application
     * @return {string} The client key
     */
    public getKey(): string {
        return this.key;
    }

    /**
     * Sends a recording to the server
     * @param {number[]} rawData The raw data of the recording
     * @param {string} word The word they are saying
     */
    public sendRecording(rawData: any): void {
        if (rawData.length > 18 || rawData.length == 0) return;

        var dataStr = "[";
        for (var i: number = 0; i < rawData.length; i++) {
            dataStr += "[";
            for (var k: number = 0; k < 2; k++) {
                dataStr += "[";
                dataStr += rawData[i][k][0];
                for (var j: number = 1; j < rawData[i][k].length; j++) {
                    dataStr += "," + rawData[i][k][j];
                }
                dataStr += "]";
                dataStr += ",";
            }
            dataStr = dataStr.substr(0, dataStr.length - 1) + "]";
            dataStr += ",";
        }
        dataStr = dataStr.substr(0, dataStr.length - 1) + "]";

        (<any>$).post(Server.URL + 'recording/add', {
            token: this.key,
            raw: dataStr
        }, function(data) {
            console.log("Recording saved on server. Response:");
            console.log(data);
        });
    }
}

export = Server;