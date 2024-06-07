
window.onload = async (e) => {
    if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("./sw.js", { scope: "./", });
    }

    let elemDivToast = document.querySelector("#divToast");
    let elemTextAbc = document.querySelector("#textAbc");
    let elemButtonEncode = document.querySelector("#buttonEncode");

    let showToast = (message) => {
        elemDivToast.querySelector(".message").innerHTML = message;
        elemDivToast.style.visibility="visible";
    };
    let hideToast = () => {
        elemDivToast.querySelector(".message").innerHTML = "";
        elemDivToast.style.visibility="hidden";
    };
    hideToast();
    let withToast = async (proc) => {
        try {
            await proc();
        } catch (e) {
            hideToast();
            throw e;
        }
        hideToast();
    }


    showToast("now loading...");
    withToast(async () => {
        await crotchet.init((total,index,filename) => {
            let message = "loading " + index + "/" + total + " " + filename;
            showToast(message);
        });
    });

    let updateScore = async () => {
        let dataSvg = await crotchet.runAbcm2Ps (elemTextAbc.value);
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
    };
    await updateScore();

    elemTextAbc.oninput = async (e) => {
        await updateScore();
    };
    elemButtonEncode.onclick = async (e) => {
        withToast(async () => {
            showToast("now encoding...");
            showToast("now converting ABC to MIDI...");
            let dataMidi = await crotchet.runAbc2Midi (elemTextAbc.value, (total,index,filename) => {
                let message = "loading " + index + "/" + total + " " + filename;
                showToast(message);
            });
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
            showToast("now converting MIDI to PCM...");
            let dataPcm = await crotchet.runMidi2Raw (dataMidi);
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
            showToast("now converting PCN to WAV...");
            let dataWav = await crotchet.runRaw2Wav (dataPcm);
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
        });
    };
}



const timidityCfgPath = "freepats/timidity.cfg";

const crotchet = {
    abc2midi: undefined,
    timidityCfg: undefined,
    midi2raw: undefined,
    raw2wav: undefined,
    init: async function (onprogress) {
        this.abc2midi = await createAbc2Midi();
        let dataCfg = await fetchFile(timidityCfgPath);
        this.timidityCfg = readTimidityCfg(dataCfg);
        this.midi2raw = await createMidi2Raw();
        this.midi2raw.FS.mkdir("freepats");
        this.midi2raw.FS.mkdir("freepats/Drum_000");
        this.midi2raw.FS.mkdir("freepats/Tone_000");
        this.midi2raw.FS.writeFile(timidityCfgPath,dataCfg);
        // load drumset pats
        let filenames = Object.values(this.timidityCfg.drumset);
        for (let i in filenames) {
            let filename = filenames[i];
            onprogress(filenames.length,i,filename);
            let patFilename = "freepats/" + filename;
            let dataPat = await fetchFile(patFilename);
            this.midi2raw.FS.writeFile(patFilename,dataPat);
        }
        this.raw2wav = await createRaw2Wav();
    },
    runAbcm2Ps: async function (textAbc) {
        const abcFilename = "music1.abc"
        const svgFilename = "music1"
        //
        //[TODO] reuse instance
        //
        let abcm2ps = await createAbcm2Ps();
        let encoder = new TextEncoder();
        let dataAbc = encoder.encode(textAbc);
        abcm2ps.FS.writeFile(abcFilename,dataAbc);
        abcm2ps.callMain([abcFilename, "-g", "-O", svgFilename]);
        let dataSvg = abcm2ps.FS.readFile(svgFilename + "001.svg");
        return dataSvg;
    },
    runAbc2Midi: async function (textAbc,onprogress) {
        const abcFilename = "music1.abc"
        const midiFilename = "music1.midi"
        let patNums = patsFromAbcText(textAbc);
        // load bank pats
        for (let i in patNums) {
            let patNum = patNums[i];
            let filename = this.timidityCfg.bank[patNum];
            if (filename) {
                let patFilename = "freepats/" + filename;
                onprogress(patNums.length,i,filename);
                let dataPat = await fetchFile(patFilename);
                this.midi2raw.FS.writeFile(patFilename,dataPat);
            }
        }
        let encoder = new TextEncoder();
        let dataAbc = encoder.encode(textAbc);
        this.abc2midi.FS.writeFile(abcFilename,dataAbc);
        this.abc2midi.callMain([abcFilename, "-o", midiFilename]);
        let dataMidi = this.abc2midi.FS.readFile(midiFilename);
        return dataMidi;
    },
    runMidi2Raw: async function (dataMidi) {
        const midiFilename = "music1.midi";
        const rawFilename = "music1.raw";
        this.midi2raw.FS.writeFile(midiFilename,dataMidi);
        this.midi2raw.callMain(["-cfg",timidityCfgPath,"-o",rawFilename,midiFilename, "-r", "44100", "-s", "16", "-c", "2"]);
        let dataRaw = this.midi2raw.FS.readFile(rawFilename);
        return dataRaw;
    },
    runRaw2Wav: async function (dataRaw) {
        const rawFilename = "music1.raw"
        const wavFilename = "music1.wav"
        this.raw2wav.FS.writeFile(rawFilename,dataRaw);
        this.raw2wav.callMain([rawFilename,wavFilename,"44100","16","2"]);
        let dataWav = this.raw2wav.FS.readFile(wavFilename);
        return dataWav;
    },
};



async function fetchFile(url) {
    let res = await fetch(url);
    let blob = await res.blob();
    let buff = await blob.arrayBuffer();
    let data = new Uint8Array(buff);
    return data;
}


function patsFromAbcText(textAbc) {
    let getPatNum = (matches) => {
        let patNum;
        if (matches[2]){
            if (matches[4]){
                patNum = matches[4]; // "program c n"
            } else {
                patNum = matches[2]; // "program n"
            }
        } else if (matches[5]) {
            patNum = matches[5]; // "chordprog n"
        } else if (matches[6]) {
            patNum = matches[6]; // "bassprog n"
        }
        return patNum;
    };

    let patNums = {0:undefined}; // piano only
    let lines = textAbc.split("\n");
    for (let line of lines) {

        // "%%MIDI program n"
        // "%%MIDI program c n"
        // "%%MIDI chordprog n"
        // "%%MIDI bassprog n"
        let commandMatches = line.match(/^\%\%MIDI\s(program\s(\d+)(\s(\d+))?|chordprog\s(\d+)|bassprog\s(\d+))$/);
        if(commandMatches) {
            let patNum = getPatNum(commandMatches);
            patNums[patNum] = undefined; // key only
        }

        // [I: MIDI = program n MIDI=program c n MIDI=chordprog n MIDI=bassprog n]
        let arrInlineMatches = line.matchAll(/\[I\:([^\]]+)\]/g);
        if(arrInlineMatches) {
            for (let inlineMatches of arrInlineMatches) {
                let commands = inlineMatches[1];
                let arrCommandMatches
                    = commands.matchAll(/\s?MIDI\s?=\s?(program\s(\d+)(\s(\d+))?|chordprog\s(\d+)|bassprog\s(\d+))/g);
                if(arrCommandMatches) {
                    for (let commandMatches of arrCommandMatches) {
                        let patNum = getPatNum(commandMatches);
                        patNums[patNum] = undefined; // key only
                    }
                }
            }
        }

    }
    return Object.keys(patNums);
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
    for (let line of textCfgLines) {

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
