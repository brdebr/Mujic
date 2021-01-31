import NodeID3 from "node-id3";
import fs from "fs";
// import path from "path";

export interface AudioTag {
  album?: string;
  bpm?: number;
  genre?: string;
  date?: string;
  contentGroup?: string;
  title?: string;
  subtitle?: string;
  language?: string;
  length?: string;
  originalTitle?: string;
  originalArtist?: string;
  originalYear?: string;
  fileOwner?: string;
  artist?: string;
  size?: string;
  year?: string;
  userDefinedText?: [
    {
      description: string;
      value: string;
    }
  ];
  image?: {
    mime?: string;
    type?: {
      id: number;
      name: "front cover";
    };
    description?: string;
    imageBuffer?: any;
  };
  userDefinedUrl?: [
    {
      description: string;
      url: string;
    }
  ];
}

export async function fetchSongTag(path: string): Promise<AudioTag> {
  const songFile = await fs.promises.readFile(path);
  return NodeID3.read(songFile) as AudioTag;
}

export function writeSongTags(tags: Record<string, any>, filePath: string) {
  NodeID3.write(tags, filePath);
}
