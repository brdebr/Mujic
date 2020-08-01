import AdmZip from 'adm-zip';
import fetch from 'node-fetch';

const ffmpegUrl = 'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20200730-134a48a-win64-static.zip'

export async function downloadFfmpeg(path: string){
    const response = await fetch(ffmpegUrl)
    const buffer = await response.buffer();
    let zip = new AdmZip(buffer);
    let zipEntries = zip.getEntries();
    zipEntries.forEach((entry) => {
        if (entry.entryName.match(/ffmpeg.exe/i)){
            zip.extractEntryTo(entry.entryName, path, false, true)
        }
    });
}
