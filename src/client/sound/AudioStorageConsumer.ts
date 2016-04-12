/**
 * AudioStorageConsumer is a consumer that simply stores all audio given to it.
 */
class AudioStorageConsumer {
    private samples : any;
    private onStopped : Function;

    constructor(onStopped : Function) {
        this.samples = [];
        this.onStopped = onStopped;
    }

    /**
     * Get the samples stored by this storage consumer
     * @returns The samples stored.
     */
    public getSamples() {
        // Flattened samples
        return this.samples;
    }

    /**
     * Process the data dished out by the recorder
     */
    private processData(data : any) {
        this.samples.push(data);
    }

    /**
     * Clears this consumers data store
     */
    public clear() : void {
        this.samples = [];
    }

    /**
     * Called by web worker message postings via ducktyping
     * @param e The message posted
     */
    public postMessage(e : any) {
        switch (e.command) {
            case 'rawData':
                this.processData(e.raw);
                break;
            case 'stop':
                this.onStopped();
                break;
        }
    }
}

export = AudioStorageConsumer;