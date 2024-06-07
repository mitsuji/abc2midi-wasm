const CACHE_NAME = "v1";

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};

const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  const responseFromNetwork = await fetch(request);
  putInCache(request, responseFromNetwork.clone());
  return responseFromNetwork;
};

self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});



//const addResourcesToCache = async () => {
//    const cache = await caches.open(CACHE_NAME);
//    await cache.addAll([
//        "/crotchet",
//    ]);
//    await cache.addAll([
//        "/crotchet/freepats/Drum_000/025_Snare_Roll.pat",
//        "/crotchet/freepats/Drum_000/026_Snap.pat",
//        "/crotchet/freepats/Drum_000/027_High_Q.pat",
//        "/crotchet/freepats/Drum_000/031_Sticks.pat",
//        "/crotchet/freepats/Drum_000/032_Square_Click.pat",
//        "/crotchet/freepats/Drum_000/033_Metronome_Click.pat",
//        "/crotchet/freepats/Drum_000/034_Metronome_Bell.pat",
//        "/crotchet/freepats/Drum_000/035_Kick_1.pat",
//        "/crotchet/freepats/Drum_000/036_Kick_2.pat",
//        "/crotchet/freepats/Drum_000/037_Stick_Rim.pat",
//        "/crotchet/freepats/Drum_000/038_Snare_1.pat",
//        "/crotchet/freepats/Drum_000/039_Clap_Hand.pat",
//        "/crotchet/freepats/Drum_000/040_Snare_2.pat",
//        "/crotchet/freepats/Drum_000/041_Tom_Low_2.pat",
//        "/crotchet/freepats/Drum_000/042_Hi-Hat_Closed.pat",
//        "/crotchet/freepats/Drum_000/043_Tom_Low_1.pat",
//        "/crotchet/freepats/Drum_000/044_Hi-Hat_Pedal.pat",
//        "/crotchet/freepats/Drum_000/045_Tom_Mid_2.pat",
//        "/crotchet/freepats/Drum_000/046_Hi-Hat_Open.pat",
//        "/crotchet/freepats/Drum_000/047_Tom_Mid_1.pat",
//        "/crotchet/freepats/Drum_000/048_Tom_High_2.pat",
//        "/crotchet/freepats/Drum_000/049_Cymbal_Crash_1.pat",
//        "/crotchet/freepats/Drum_000/050_Tom_High_1.pat",
//        "/crotchet/freepats/Drum_000/051_Cymbal_Ride_1.pat",
//        "/crotchet/freepats/Drum_000/052_Cymbal_Chinese.pat",
//        "/crotchet/freepats/Drum_000/053_Cymbal_Ride_Bell.pat",
//        "/crotchet/freepats/Drum_000/054_Tombourine.pat",
//        "/crotchet/freepats/Drum_000/055_Cymbal_Splash.pat",
//        "/crotchet/freepats/Drum_000/056_Cow_Bell.pat",
//        "/crotchet/freepats/Drum_000/057_Cymbal_Crash_2.pat",
//        "/crotchet/freepats/Drum_000/058_Vibra-Slap.pat",
//        "/crotchet/freepats/Drum_000/059_Cymbal_Ride_2.pat",
//        "/crotchet/freepats/Drum_000/060_Bongo_High.pat",
//        "/crotchet/freepats/Drum_000/061_Bongo_Low.pat",
//        "/crotchet/freepats/Drum_000/062_Conga_High_1_Mute.pat",
//        "/crotchet/freepats/Drum_000/063_Conga_High_2_Open.pat",
//        "/crotchet/freepats/Drum_000/064_Conga_Low.pat",
//        "/crotchet/freepats/Drum_000/065_Timbale_High.pat",
//        "/crotchet/freepats/Drum_000/066_Timbale_Low.pat",
//        "/crotchet/freepats/Drum_000/067_Agogo_High.pat",
//        "/crotchet/freepats/Drum_000/068_Agogo_Low.pat",
//        "/crotchet/freepats/Drum_000/069_Cabasa.pat",
//        "/crotchet/freepats/Drum_000/070_Maracas.pat",
//        "/crotchet/freepats/Drum_000/071_Whistle_1_High_Short.pat",
//        "/crotchet/freepats/Drum_000/072_Whistle_2_Low_Long.pat",
//        "/crotchet/freepats/Drum_000/073_Guiro_1_Short.pat",
//        "/crotchet/freepats/Drum_000/074_Guiro_2_Long.pat",
//        "/crotchet/freepats/Drum_000/075_Claves.pat",
//        "/crotchet/freepats/Drum_000/076_Wood_Block_1_High.pat",
//        "/crotchet/freepats/Drum_000/077_Wood_Block_2_Low.pat",
//        "/crotchet/freepats/Drum_000/078_Cuica_1_Mute.pat",
//        "/crotchet/freepats/Drum_000/079_Cuica_2_Open.pat",
//        "/crotchet/freepats/Drum_000/080_Triangle_1_Mute.pat",
//        "/crotchet/freepats/Drum_000/081_Triangle_2_Open.pat",
//        "/crotchet/freepats/Drum_000/082_Shaker.pat",
//        "/crotchet/freepats/Drum_000/084_Belltree.pat",
//    ]);
//    await cache.addAll([
//        "/crotchet/freepats/Tone_000/000_Acoustic_Grand_Piano.pat",
//        "/crotchet/freepats/Tone_000/001_Acoustic_Brite_Piano.pat",
//        "/crotchet/freepats/Tone_000/002_Electric_Grand_Piano.pat",
//        "/crotchet/freepats/Tone_000/004_Electric_Piano_1_Rhodes.pat",
//        "/crotchet/freepats/Tone_000/005_Electric_Piano_2_Chorused_Yamaha_DX.pat",
//        "/crotchet/freepats/Tone_000/006_Harpsichord.pat",
//        "/crotchet/freepats/Tone_000/007_Clavinet.pat",
//        "/crotchet/freepats/Tone_000/008_Celesta.pat",
//        "/crotchet/freepats/Tone_000/009_Glockenspiel.pat",
//        "/crotchet/freepats/Tone_000/013_Xylophone.pat",
//        "/crotchet/freepats/Tone_000/014_Tubular_Bells.pat",
//        "/crotchet/freepats/Tone_000/015_Dulcimer.pat",
//        "/crotchet/freepats/Tone_000/016_Hammond_Organ.pat",
//        "/crotchet/freepats/Tone_000/019_Church_Organ.pat",
//        "/crotchet/freepats/Tone_000/021_Accordion.pat",
//        "/crotchet/freepats/Tone_000/023_Tango_Accordion.pat",
//        "/crotchet/freepats/Tone_000/024_Nylon_Guitar.pat",
//        "/crotchet/freepats/Tone_000/025_Steel_Guitar.pat",
//        "/crotchet/freepats/Tone_000/026_Jazz_Guitar.pat",
//        "/crotchet/freepats/Tone_000/027_Clean_Electric_Guitar.pat",
//        "/crotchet/freepats/Tone_000/028_Muted_Electric_Guitar.pat",
//        "/crotchet/freepats/Tone_000/029_Overdriven_Guitar.pat",
//        "/crotchet/freepats/Tone_000/030_Distortion_Guitar.pat",
//        "/crotchet/freepats/Tone_000/032_Acoustic_Bass.pat",
//        "/crotchet/freepats/Tone_000/033_Finger_Bass.pat",
//        "/crotchet/freepats/Tone_000/034_Pick_Bass.pat",
//        "/crotchet/freepats/Tone_000/035_Fretless_Bass.pat",
//        "/crotchet/freepats/Tone_000/036_Slap_Bass_1.pat",
//        "/crotchet/freepats/Tone_000/037_Slap_Bass_2.pat",
//        "/crotchet/freepats/Tone_000/038_Synth_Bass_1.pat",
//        "/crotchet/freepats/Tone_000/040_Violin.pat",
//        "/crotchet/freepats/Tone_000/042_Cello.pat",
//        "/crotchet/freepats/Tone_000/044_Tremolo_Strings.pat",
//        "/crotchet/freepats/Tone_000/045_Pizzicato_Strings.pat",
//        "/crotchet/freepats/Tone_000/046_Harp.pat",
//        "/crotchet/freepats/Tone_000/047_Timpani.pat",
//        "/crotchet/freepats/Tone_000/048_String_Ensemble_1_Marcato.pat",
//        "/crotchet/freepats/Tone_000/053_Voice_Oohs.pat",
//        "/crotchet/freepats/Tone_000/056_Trumpet.pat",
//        "/crotchet/freepats/Tone_000/057_Trombone.pat",
//        "/crotchet/freepats/Tone_000/058_Tuba.pat",
//        "/crotchet/freepats/Tone_000/059_Muted_Trumpet.pat",
//        "/crotchet/freepats/Tone_000/060_French_Horn.pat",
//        "/crotchet/freepats/Tone_000/061_Brass_Section.pat",
//        "/crotchet/freepats/Tone_000/064_Soprano_Sax.pat",
//        "/crotchet/freepats/Tone_000/065_Alto_Sax.pat",
//        "/crotchet/freepats/Tone_000/066_Tenor_Sax.pat",
//        "/crotchet/freepats/Tone_000/067_Baritone_Sax.pat",
//        "/crotchet/freepats/Tone_000/068_Oboe.pat",
//        "/crotchet/freepats/Tone_000/069_English_Horn.pat",
//        "/crotchet/freepats/Tone_000/070_Bassoon.pat",
//        "/crotchet/freepats/Tone_000/071_Clarinet.pat",
//        "/crotchet/freepats/Tone_000/072_Piccolo.pat",
//        "/crotchet/freepats/Tone_000/073_Flute.pat",
//        "/crotchet/freepats/Tone_000/074_Recorder.pat",
//        "/crotchet/freepats/Tone_000/075_Pan_Flute.pat",
//        "/crotchet/freepats/Tone_000/076_Bottle_Blow.pat",
//        "/crotchet/freepats/Tone_000/079_Ocarina.pat",
//        "/crotchet/freepats/Tone_000/080_Square_Wave.pat",
//        "/crotchet/freepats/Tone_000/084_Charang.pat",
//        "/crotchet/freepats/Tone_000/088_New_Age.pat",
//        "/crotchet/freepats/Tone_000/094_Halo_Pad.pat",
//        "/crotchet/freepats/Tone_000/095_Sweep_Pad.pat",
//        "/crotchet/freepats/Tone_000/098_Crystal.pat",
//        "/crotchet/freepats/Tone_000/101_Goblins--Unicorn.pat",
//        "/crotchet/freepats/Tone_000/102_Echo_Voice.pat",
//        "/crotchet/freepats/Tone_000/104_Sitar.pat",
//        "/crotchet/freepats/Tone_000/114_Steel_Drums.pat",
//        "/crotchet/freepats/Tone_000/115_Wood_Block.pat",
//        "/crotchet/freepats/Tone_000/120_Guitar_Fret_Noise.pat",
//        "/crotchet/freepats/Tone_000/122_Seashore.pat",
//        "/crotchet/freepats/Tone_000/125_Helicopter.pat",
//    ]);
//};
//
//self.addEventListener("install", (event) => {
//    event.waitUntil(addResourcesToCache());
//});


