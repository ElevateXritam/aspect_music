"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  ExternalLink,
  Play,
  Repeat,
  Repeat1,
  X,
} from "lucide-react";
import { Slider } from "../ui/slider";
import { getSongsById } from "@/lib/fetch";
import Link from "next/link";
import { useMusicProvider } from "@/hooks/use-context";
import { Skeleton } from "../ui/skeleton";
import { IoPause } from "react-icons/io5";

export default function Player() {
  const [data, setData] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [isLooping, setIsLooping] = useState(false);

  const { music, setMusic, current, setCurrent } = useMusicProvider();

  /* =========================
     MEDIA SESSION (FIX)
     ========================= */
  const setMediaSession = (song) => {
    if (!("mediaSession" in navigator) || !song) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist: song.artists?.primary?.[0]?.name || "",
      album: song.album?.name || "Aspect Music",
      artwork: [
        { src: song.image?.[0]?.url, sizes: "96x96", type: "image/png" },
        { src: song.image?.[1]?.url, sizes: "128x128", type: "image/png" },
        { src: song.image?.[2]?.url, sizes: "256x256", type: "image/png" },
        { src: song.image?.[2]?.url, sizes: "512x512", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
  };

  /* ========================= */

  const getSong = async () => {
    const res = await getSongsById(music);
    const json = await res.json();
    const song = json.data[0];

    setData(song);
    setMediaSession(song); // 🔥 MAIN FIX

    const url =
      song.downloadUrl?.[2]?.url ||
      song.downloadUrl?.[1]?.url ||
      song.downloadUrl?.[0]?.url;

    setAudioURL(url);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
  };

  const handleSeek = (val) => {
    audioRef.current.currentTime = val[0];
    setCurrentTime(val[0]);
  };

  const loopSong = () => {
    audioRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  useEffect(() => {
    if (!music) return;

    getSong();

    if (current) {
      audioRef.current.currentTime = current;
    }

    const onTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      setCurrent(audioRef.current.currentTime);
    };

    audioRef.current.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [music]);

  return (
    <main>
      <audio
        ref={audioRef}
        src={audioURL}
        autoPlay
        preload="metadata"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={() =>
          setDuration(audioRef.current.duration || 0)
        }
      />

      {music && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg max-w-[500px] mx-auto">
          {!duration ? (
            <Skeleton className="h-1 w-full" />
          ) : (
            <Slider
              value={[currentTime]}
              max={duration}
              onValueChange={handleSeek}
              className="w-full"
            />
          )}

          <div className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src={data?.image?.[1]?.url}
                className="h-12 w-12 rounded-md"
                alt=""
              />
              <div>
                <Link href={`/${music}`} className="text-sm font-medium">
                  {data?.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {data?.artists?.primary?.[0]?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant={isLooping ? "secondary" : "ghost"} onClick={loopSong}>
                {isLooping ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </Button>

              <Button size="icon" onClick={togglePlayPause}>
                {playing ? <IoPause size={18} /> : <Play size={18} />}
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                  setMusic(null);
                  setCurrent(0);
                  audioRef.current.pause();
                  audioRef.current.src = "";
                }}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
