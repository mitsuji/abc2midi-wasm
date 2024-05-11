#!/bin/sh

gcc -c -DANSILIBS -O2 deps/abcmidi/parseabc.c    -obuild/parseabc.o
gcc -c -DANSILIBS -O2 deps/abcmidi/store.c       -obuild/store.o
gcc -c -DANSILIBS -O2 deps/abcmidi/genmidi.c     -obuild/genmidi.o
gcc -c -DANSILIBS -O2 deps/abcmidi/midifile.c    -obuild/midifile.o
gcc -c -DANSILIBS -O2 deps/abcmidi/queues.c      -obuild/queues.o
gcc -c -DANSILIBS -O2 deps/abcmidi/parser2.c     -obuild/parser2.o
gcc -c -DANSILIBS -O2 deps/abcmidi/stresspat.c   -obuild/stresspat.o
gcc -c -DANSILIBS -O2 deps/abcmidi/music_utils.c -obuild/music_utils.o
gcc -lm -obuild/abc2midi build/parseabc.o build/store.o build/genmidi.o build/midifile.o build/queues.o build/parser2.o build/stresspat.o build/music_utils.o
