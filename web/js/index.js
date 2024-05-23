
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

let abcm2ps = null;
async function runAbcm2Ps (textAbc) {
    const abcFilename = "music1.abc"
    const svgFilename = "music1"
//    if (abcm2ps === null) {
//        abcm2ps = await createAbcm2Ps();
//    }
    abcm2ps = await createAbcm2Ps();
    let encoder = new TextEncoder();
    let dataAbc = encoder.encode(textAbc);
    abcm2ps.FS.writeFile(abcFilename,dataAbc);
    abcm2ps.callMain([abcFilename, "-g", "-O", svgFilename]);
    let dataSvg = abcm2ps.FS.readFile(svgFilename + "001.svg");
    return dataSvg;
}


let abc2midi = null;
async function runAbc2Midi (textAbc) {
    const abcFilename = "music1.abc"
    const midiFilename = "music1.midi"
    if (abc2midi === null) {
        abc2midi = await createAbc2Midi();
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
    const midiFilename = "music1.midi";
    const rawFilename = "music1.raw";
    if (midi2raw === null) {
        midi2raw = await createMidi2Raw();
        let dataPianoPat = await fetchFile(pianoPatPath);
        let dataCfg = await fetchFile(cfgPath);
        midi2raw.FS.mkdir("freepats");
        midi2raw.FS.mkdir("freepats/Tone_000");
        midi2raw.FS.writeFile(cfgPath,dataCfg);
        midi2raw.FS.writeFile(pianoPatPath,dataPianoPat);
    }
    midi2raw.FS.writeFile(midiFilename,dataMidi);
    midi2raw.callMain(["-cfg",cfgPath,"-o",rawFilename,midiFilename, "-r", "44100", "-s", "16", "-c", "2"]);
    let dataRaw = midi2raw.FS.readFile(rawFilename);
    return dataRaw;
}


let raw2wav = null;
async function runRaw2Wav (dataRaw) {
    const rawFilename = "music1.raw"
    const wavFilename = "music1.wav"
    if (raw2wav === null) {
        raw2wav = await createRaw2Wav();
    }
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

