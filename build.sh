#!/bin/sh

emcc -c -DANSILIBS -O3 deps/abcmidi/parseabc.c    -obuild/parseabc.o
emcc -c -DANSILIBS -O3 deps/abcmidi/store.c       -obuild/store.o
emcc -c -DANSILIBS -O3 deps/abcmidi/genmidi.c     -obuild/genmidi.o
emcc -c -DANSILIBS -O3 deps/abcmidi/midifile.c    -obuild/midifile.o
emcc -c -DANSILIBS -O3 deps/abcmidi/queues.c      -obuild/queues.o
emcc -c -DANSILIBS -O3 deps/abcmidi/parser2.c     -obuild/parser2.o
emcc -c -DANSILIBS -O3 deps/abcmidi/stresspat.c   -obuild/stresspat.o
emcc -c -DANSILIBS -O3 deps/abcmidi/music_utils.c -obuild/music_utils.o
emcc -obuild/abc2midi.js build/parseabc.o build/store.o build/genmidi.o build/midifile.o build/queues.o build/parser2.o build/stresspat.o build/music_utils.o -sEXPORTED_RUNTIME_METHODS=FS,callMain -sMODULARIZE -sEXPORT_NAME=createAbc2Midi
cp build/abc2midi.js web/abc2midi.js
cp build/abc2midi.wasm web/abc2midi.wasm

emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/common.c     -obuild/common.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/instrum.c    -obuild/instrum.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/mix.c        -obuild/mix.o  
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/output.c     -obuild/output.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/playmidi.c   -obuild/playmidi.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/readmidi.c   -obuild/readmidi.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/resample.c   -obuild/resample.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/stream.c     -obuild/stream.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/tables.c     -obuild/tables.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/src/timidity.c   -obuild/timidity.o
emcc -c -O3 -Ideps/libtimidity-0.2.7/src deps/libtimidity-0.2.7/tests/midi2raw.c -obuild/midi2raw.o
emcc -obuild/midi2raw.js build/common.o build/instrum.o build/mix.o build/output.o build/playmidi.o build/readmidi.o build/resample.o build/stream.o build/tables.o build/timidity.o build/midi2raw.o -sEXPORTED_RUNTIME_METHODS=FS,callMain -sMODULARIZE -sEXPORT_NAME=createMidi2Raw
cp build/midi2raw.js web/midi2raw.js
cp build/midi2raw.wasm web/midi2raw.wasm

emcc -O3 -obuild/raw2wav.js deps/raw2wav/raw2wav.c -sEXPORTED_RUNTIME_METHODS=FS,callMain -sMODULARIZE -sEXPORT_NAME=createRaw2Wav
cp build/raw2wav.js web/raw2wav.js
cp build/raw2wav.wasm web/raw2wav.wasm
