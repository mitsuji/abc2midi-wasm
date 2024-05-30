
window.onload = async (e) => {
    let elemTextAbc = document.querySelector("#textAbc");
    let updateScore = async () => {
        let dataSvg = await runAbcm2Ps (elemTextAbc.value);
        let blobSvg = new Blob ([dataSvg],{type:"image/svg+xml"});
        let reader = new FileReader();
        reader.onload = (e) => {
            let imageSvg = document.querySelector("#imageSvg");
            imageSvg.src = reader.result;
            let downloadSvg = document.querySelector("#downloadSvg");
            downloadSvg.download = "music1.svg";
            downloadSvg.href = reader.result;
        };
        reader.readAsDataURL(blobSvg);
    }
    updateScore();

    elemTextAbc.oninput = async (e) => {
        updateScore();
    };
    document.querySelector("#buttonEncode").onclick = async (e) => {
        let dataMidi = await runAbc2Midi (elemTextAbc.value);
        {
            let blobMidi = new Blob ([dataMidi],{type:"audio/midi"});
            let reader = new FileReader();
            reader.onload = (e) => {
                let downloadMidi = document.querySelector("#downloadMidi");
                downloadMidi.download = "music1.midi";
                downloadMidi.href = reader.result;
            };
            reader.readAsDataURL(blobMidi);
        }
        let dataPcm = await runMidi2Raw (dataMidi);
        {
            let blobPcm = new Blob ([dataPcm],{type:"audio/pcm;rate=44100;bits=16;channels=2"});
            let reader = new FileReader();
            reader.onload = (e) => {
                let downloadPcm = document.querySelector("#downloadPcm");
                downloadPcm.download = "music1.raw";
                downloadPcm.href = reader.result;
            };
            reader.readAsDataURL(blobPcm);
        }
        let dataWav = await runRaw2Wav (dataPcm);
        {
            let blobWav = new Blob ([dataWav],{type:"audio/wav"});
            let reader = new FileReader();
            reader.onload = (e) => {
                let downloadWav = document.querySelector("#downloadWav");
                downloadWav.download = "music1.wav";
                downloadWav.href = reader.result;
                let audio = document.querySelector("#audioWav");
                audio.src = reader.result;
                audio.play();
            };
            reader.readAsDataURL(blobWav);
        }
    };
}



const timidityCfgPath = "freepats/timidity.cfg";
//const timidityCfgPath = "freepats/timidity1.cfg";
//
// [TODO] loading message
//
let abc2midi = await createAbc2Midi();
let midi2raw = await createMidi2Raw();
{
    midi2raw.FS.mkdir("freepats");
    midi2raw.FS.mkdir("freepats/Drum_000");
    midi2raw.FS.mkdir("freepats/Tone_000");
    let dataCfg = await fetchFile(timidityCfgPath);
    midi2raw.FS.writeFile(timidityCfgPath,dataCfg);
    {
        let lineRE = new RegExp(/^\s\d+\s([^\s]+)(\s.+)?/);
        let decoder = new TextDecoder();
        let textCfg = decoder.decode(dataCfg);
        let textCfgLines = textCfg.split("\n");
        for (let i in textCfgLines) {
            let line = textCfgLines[i];
            let lineMatches = lineRE.exec(line);
            if (lineMatches) {
                let patFilename = "freepats/" + lineMatches[1];
                let dataPat = await fetchFile(patFilename);
                midi2raw.FS.writeFile(patFilename,dataPat);
            }
        }
        let timidityCfg = readTimidityCfg(dataCfg);
        console.log(timidityCfg);
    }
}
let raw2wav = await createRaw2Wav();


//
//[TODO] reuse instance
//
//let abcm2ps = null;
async function runAbcm2Ps (textAbc) {
    const abcFilename = "music1.abc"
    const svgFilename = "music1"
//    if (abcm2ps === null) {
//        abcm2ps = await createAbcm2Ps();
//    }
    let abcm2ps = await createAbcm2Ps();
    let encoder = new TextEncoder();
    let dataAbc = encoder.encode(textAbc);
    abcm2ps.FS.writeFile(abcFilename,dataAbc);
    abcm2ps.callMain([abcFilename, "-g", "-O", svgFilename]);
    let dataSvg = abcm2ps.FS.readFile(svgFilename + "001.svg");
    return dataSvg;
}


async function runAbc2Midi (textAbc) {
    const abcFilename = "music1.abc"
    const midiFilename = "music1.midi"
    let encoder = new TextEncoder();
    let dataAbc = encoder.encode(textAbc);
    abc2midi.FS.writeFile(abcFilename,dataAbc);
    abc2midi.callMain([abcFilename, "-o", midiFilename]);
    let dataMidi = abc2midi.FS.readFile(midiFilename);
    return dataMidi;
}


async function runMidi2Raw (dataMidi) {
    const midiFilename = "music1.midi";
    const rawFilename = "music1.raw";
    midi2raw.FS.writeFile(midiFilename,dataMidi);
    midi2raw.callMain(["-cfg",timidityCfgPath,"-o",rawFilename,midiFilename, "-r", "44100", "-s", "16", "-c", "2"]);
    let dataRaw = midi2raw.FS.readFile(rawFilename);
    return dataRaw;
}


async function runRaw2Wav (dataRaw) {
    const rawFilename = "music1.raw"
    const wavFilename = "music1.wav"
    raw2wav.FS.writeFile(rawFilename,dataRaw);
    raw2wav.callMain([rawFilename,wavFilename,"44100","16","2"]);
    let dataWav = raw2wav.FS.readFile(wavFilename);
    return dataWav;
}



async function fetchFile(url) {
    let res = await fetch(url);
    let blob = await res.blob();
    let buff = await blob.arrayBuffer();
    let data = new Uint8Array(buff);
    return data;
}


function readTimidityCfg(dataCfg) {
    const dirRE     = new RegExp(/^dir\s([^\s]+)$/);
    const drumsetRE = new RegExp(/^drumset\s(\d+)$/);
    const bankRE    = new RegExp(/^bank\s(\d+)$/);
    const patRE     = new RegExp(/^\s(\d+)\s([^\s]+)(\s.*)?$/);

    let decoder = new TextDecoder();
    let textCfg = decoder.decode(dataCfg);
    let textCfgLines = textCfg.split("\n");
    let drumset = {};
    let bank = {};
    let pats;
    for (let i in textCfgLines) {
        let line = textCfgLines[i];

        if (dirRE.test(line)) {
            continue;
        }

        if (drumsetRE.test(line)) {
            pats = drumset;
            continue;
        }

        if (bankRE.test(line)) {
            pats = bank;
            continue;
        }

        let patMatches = patRE.exec(line);
        if (patMatches) {
            let key = patMatches[1];
            let filename = patMatches[2];
            pats[key] = filename;
            continue;
        }

    }
    return {drumset:drumset,bank:bank};
}
