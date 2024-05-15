import { FFmpeg } from "./@ffmpeg/ffmpeg/dist/esm/index.js";

window.onload = async (e) => {
    document.querySelector("#buttonPlay").onclick = async (e) => {
        let elemTextAbc = document.querySelector("#textAbc");
        let dataMidi = await runAbc2Midi (elemTextAbc.value);
        let dataRaw = await runMidi2Raw (dataMidi);
        let dataWav = await runRaw2Wav (dataRaw);
        let blobWav = new Blob ([dataWav],{type:"audio/wav"});
        let reader = new FileReader();
        reader.onload = (e) => {
            let audio = new Audio ();
            document.querySelector("#buttonStop").onclick = (e) => {
                audio.pause();
            };
            audio.src = reader.result;
            audio.play();
        };
        reader.readAsDataURL(blobWav);
    };
}

let abc2midi = null;
async function runAbc2Midi (textAbc) {
    const abcFilename = "file1.abc"
    const midiFilename = "file1.midi"
    if (abc2midi === null) {
        abc2midi = await createAbc2Midi({noInitialRun: true});
    }
    let encoder = new TextEncoder();
    let dataAbc = encoder.encode(textAbc);
    abc2midi.FS.writeFile(abcFilename,dataAbc);
    abc2midi.callMain([abcFilename, "-o", midiFilename]);
    let dataMidi = abc2midi.FS.readFile(midiFilename);
    return dataMidi;
}


let midi2raw = null;
async function runMidi2Raw (dataMidi) {
    const cfgPath = "freepats/timidity.cfg";
    const pianoPatPath = "freepats/Tone_000/000_Acoustic_Grand_Piano.pat";
    const midiFilename = "file1.midi";
    const rawFilename = "file1.raw";
    if (midi2raw === null) {
        midi2raw = await createMidi2Raw({noInitialRun: true});
        let dataPianoPat = await fetchFile(pianoPatPath);
        let dataCfg = await fetchFile(cfgPath);
        midi2raw.FS.mkdir("freepats");
        midi2raw.FS.mkdir("freepats/Tone_000");
        midi2raw.FS.writeFile(cfgPath,dataCfg);
        midi2raw.FS.writeFile(pianoPatPath,dataPianoPat);
    }
    midi2raw.FS.writeFile(midiFilename,dataMidi);
    midi2raw.callMain(["-cfg",cfgPath,"-o",rawFilename,midiFilename]);
    let dataRaw = midi2raw.FS.readFile(rawFilename);
    return dataRaw;
}


let ffmpeg = null;
async function runRaw2Wav (dataRaw) {
    const rawFilename = "file1.raw";
    const wavFilename = "file1.wav";
    if (ffmpeg === null) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        })
        ffmpeg.on("progress", ({ progress, time }) => {
            let message = `${progress * 100} %, time: ${time / 1000000} s`;
            console.log(message);
        });
        await ffmpeg.load({
            coreURL: "../../../core/dist/esm/ffmpeg-core.js",
        });
    }
    await ffmpeg.writeFile(rawFilename, dataRaw);
    console.log('Start transcoding');
    console.time('exec');
    await ffmpeg.exec(["-f","s16le","-ar","44.1k","-ac","2","-i",rawFilename,wavFilename]);
    console.timeEnd('exec');
    console.log('Complete transcoding');
    let dataWav = await ffmpeg.readFile(wavFilename);
    return dataWav;
//    downloadBlob(dataWav, wavFilename, 'audio/wav');
}

async function fetchFile(url) {
    let res = await fetch(url);
    let blob = await res.blob();
    let buff = await blob.arrayBuffer();
    let data = new Uint8Array(buff);
    return data;
}

function downloadBlob (data, filename, mimeType) {
  let blob = new Blob([data], {type: mimeType});
  let url = window.URL.createObjectURL(blob);
  let downloadURL = function(url) {
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  };
  downloadURL(url);
  setTimeout(function() {
  return window.URL.revokeObjectURL(url);
  }, 1000);
}
