#!/bin/sh

emcc -c -DANSILIBS -O3 deps/abcmidi/parseabc.c    -obuild/parseabc.o
emcc -c -DANSILIBS -O3 deps/abcmidi/store.c       -obuild/store.o
emcc -c -DANSILIBS -O3 deps/abcmidi/genmidi.c     -obuild/genmidi.o
emcc -c -DANSILIBS -O3 deps/abcmidi/midifile.c    -obuild/midifile.o
emcc -c -DANSILIBS -O3 deps/abcmidi/queues.c      -obuild/queues.o
emcc -c -DANSILIBS -O3 deps/abcmidi/parser2.c     -obuild/parser2.o
emcc -c -DANSILIBS -O3 deps/abcmidi/stresspat.c   -obuild/stresspat.o
emcc -c -DANSILIBS -O3 deps/abcmidi/music_utils.c -obuild/music_utils.o
emcc -obuild/abc2midi.html build/parseabc.o build/store.o build/genmidi.o build/midifile.o build/queues.o build/parser2.o build/stresspat.o build/music_utils.o --shell-file html_template/shell_minimal.html
