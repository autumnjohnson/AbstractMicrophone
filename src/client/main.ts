// browserify.js (our library that clumps together all these javascript files)
// needs a "main file" to derive all dependencies from and package up.
// This is that file.

/// <reference path="../common/def/node.d.ts"/>

// Push the speech processor into the global namespace
(<any> window).WAVClip = require('./sound/SpeechProcessor')