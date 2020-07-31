import YoutubeMp3Downloader from 'youtube-mp3-downloader';

//Configure YoutubeMp3Downloader with your settings
const YDMp3 = new YoutubeMp3Downloader({
    "ffmpegPath": "L:/Libs/ffmpeg/bin/ffmpeg.exe",          // FFmpeg binary location
    "outputPath": "L:/DESARROLLO/Mujic/music",              // Output file location (default: the home directory)
    "youtubeVideoQuality": "highestaudio",                  // Desired video quality (default: highestaudio)
    "queueParallelism": 2,                                  // Download parallelism (default: 1)
    "progressTimeout": 2000                                 // Interval in ms for the progress reports (default: 1000)
});
 
//Download video and save as MP3 file


export default YDMp3;

// const videoUrl = new URL("https://www.youtube.com/watch?v=NpkDLCo8O8k");
// const videoId = videoUrl.searchParams.get("v");

// YD.download(videoId);

//  // @ts-ignore
// YD.on("finished", function(err, data) {
//     console.log(JSON.stringify(data));
// });

// // @ts-ignore
// YD.on("error", function(error) {
//     console.log(error);
// });

// // @ts-ignore
// YD.on("progress", function(progress) {
//     console.log(JSON.stringify(progress));
// });