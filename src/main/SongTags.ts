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
  comment?: {
    language: string;
    text: string;
  };
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
  unsynchronizedLyrics?: {
    language: "eng" | "spa" | "jap";
    text: string;
  };
  raw?: object;
}

export const GENRE_COLORS_ARRAY = [
  "#6b0711",
  "#00796B",
  "#34425a",
  "#2979FF",
  "#1A237E",
  "#C5CAE9",
  "#382881",
  "#B39DDB",
  "#F06292",
  "#a3b158",
  "#4f88a3",
  "#cc5c34",
  "#798824",
  "#C6FF00",
  "#2E7D32",
  "#ce21bf",
  "#2a8f2f",
  "#e4e125",
  "#1cf1f1",
  "#c21111"
];

export async function fetchSongTag(path: string): Promise<AudioTag> {
  const songFile = await fs.promises.readFile(path);
  return NodeID3.read(songFile) as AudioTag;
}

export function writeSongTags(tags: Record<string, any>, filePath: string) {
  NodeID3.write(tags, filePath);
}

export function updateSongTags(tags: Record<string, any>, filePath: string) {
  NodeID3.update(tags, filePath);
}
