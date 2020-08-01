import YoutubeMp3Downloader from "youtube-mp3-downloader";

export function buildDownloader(ffmpegPath: string, outputPath: string) {
  return new YoutubeMp3Downloader({
    ffmpegPath,
    outputPath,
    youtubeVideoQuality: "highestaudio",
    queueParallelism: 1,
    progressTimeout: 1000
  });
}
