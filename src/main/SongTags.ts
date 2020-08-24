import NodeID3 from "node-id3";
import fs from "fs";
// import path from "path";

export async function fetchSongTag(path: string) {
  const songFile = await fs.promises.readFile(path);
  return NodeID3.read(songFile);
}

export function writeSongTags(tags: Record<string, any>, filePath: string) {
  NodeID3.write(tags, filePath);
}
