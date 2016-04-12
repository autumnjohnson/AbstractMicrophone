import AudioStorageConsumer = require('./AudioStorageConsumer');

// Vanilla javascript / audio api declarations for typescript
declare var AudioContext : any;
declare var window : any;
declare var navigator : any;
declare var AudioRecorder : any;

// Deal with prefixed APIs
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

/**
 * Manages communication with the device microphone
 */
class Microphone {
    private currentlyRecording : boolean;
    private audioContext : any;
    private audioRecorder : any;
    private clientReadyFunction : Function;
    private clientResultFunction : Function;

    private numberConsuming : number;

    private storageConsumer : AudioStorageConsumer;

    constructor(clientReadyFunction : Function) {
        this.currentlyRecording = false;
        this.audioRecorder = null;
        this.clientReadyFunction = clientReadyFunction;

        try {
            this.audioContext = new window.AudioContext();
        } catch (e) {
            console.log("Error initializing Web Audio");
        }

        // Get user permissions for audio capture
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true},
                                    (stream) => {this.onInitAudio(stream)},
                                    (e) => {console.log("No live audio input in this browser");});
        } else {
            throw "No web audio support in this browser";
        }
    }

    /**
     * Called when user grants permission to initialize audio capture
     */
    private onInitAudio(stream : any) {
        var volume = this.audioContext.createGain();
        var input = this.audioContext.createMediaStreamSource(stream);
        input.connect(volume);
        this.audioRecorder = new AudioRecorder(input, {volume : volume, worker : './js/vendor/audioRecorderWorker.js'});

        this.spawnConsumers(() => {
            this.clientReadyFunction();
        });
    }

    /**
     * Spawns the consumers of the audio stream
     * @param {Function} The callback to execute when finished
     */
    private spawnConsumers(callback : Function) {
        console.log("Spawning Consumer Workers...");

        // Create a storage consumer and keep a reference to it
        this.storageConsumer = new AudioStorageConsumer(() => { this.onConsumerStop(); });

        console.log("Storage Consumer spawned...");

        // Attach consumers to recorder
        this.audioRecorder.consumers = [this.storageConsumer];

        callback();
    }

    /**
     * Spawns a worker at a particular URL
     * @param workerURL the JS file to spawn a worker for
     * @param onReady the callback to call when the worker is ready
     */
    private spawnWorker(workerURL : string, onReady : Function) {
        var worker : Worker = new Worker(workerURL);
        worker.onmessage = function(_) {
            onReady(worker);
        };
        worker.postMessage('');
    }

    /**
     * Start recording with the device microphone.
     * If the microphone is not yet ready or it is currently recording, it will do nothing.
     * @param callback The function to call when recording has started
     */
    public start(callback : Function) : void {
        if (!this.currentlyRecording && this.audioRecorder != null) {
            if (!this.audioRecorder.consumers || this.audioRecorder.consumers.length == 0) {
                // No consumers present
                throw 'Error in starting audio stream: No consumers present';
            }

            // Start recording
            this.currentlyRecording = true;
            this.audioRecorder.start();
            this.numberConsuming = this.audioRecorder.consumers.length;
            callback();
        }
    }

    /**
     * Called when a consumer has stopped
     */
    private onConsumerStop() {
        this.numberConsuming -= 1;

        // All consumers finished
        if (this.numberConsuming == 0) {
            var samples = this.storageConsumer.getSamples();

            this.storageConsumer.clear();

            this.clientResultFunction([samples]);
        }
    }

    /**
     * Stop recording with the device microphone
     * Does nothing if recording has yet to begin, or if the microphone is not yet ready.
     */
    public stop(onResult : Function) : any {
        if (this.currentlyRecording && this.audioRecorder != null) {
            this.clientResultFunction = onResult;

            // Stop recording
            this.audioRecorder.stop();
            this.currentlyRecording = false;
        }
    }


    /**
     * Find out if the program is currently recording
     * @returns {boolean} True if recording, false otherwise
     */
    public isRecording() : boolean {
        return this.currentlyRecording;
    }
}

export = Microphone;