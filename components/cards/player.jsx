"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  ExternalLink,
  Link2Icon,
  Pause,
  PauseCircle,
  Play,
  Repeat,
  Repeat1,
  X,
} from "lucide-react";
import { Slider } from "../ui/slider";
import { getSongsById } from "@/lib/fetch";
import Link from "next/link";
import { MusicContext, useMusicProvider } from "@/hooks/use-context";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { IoPause } from "react-icons/io5";

export default function Player() {
  const [data, setData] = useState([]);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [isLooping, setIsLooping] = useState(false);
  const { music, setMusic, current, setCurrent } = useMusicProvider();

  const getSong = async () => {
    const get = await getSongsById(music);
    const data = await get.json();
    setData(data.data[0]);
    if (data?.data[0]?.downloadUrl[2]?.url) {
      setAudioURL(data?.data[0]?.downloadUrl[2]?.url);
    } else if (data?.data[0]?.downloadUrl[1]?.url) {
      setAudioURL(data?.data[0]?.downloadUrl[1]?.url);
    } else {
      setAudioURL(data?.data[0]?.downloadUrl[0]?.url);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    const seekTime = e[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const loopSong = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setIsLooping(!isLooping);
  };

  useEffect(() => {
    if (music) {
      getSong();
      if (current) {
        audioRef.current.currentTime = parseFloat(current + 1);
      }
      setPlaying(
        (localStorage.getItem("p") == "true" && true) ||
          (!localStorage.getItem("p") && true),
      );
      const handleTimeUpdate = () => {
        try {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration);
          setCurrent(audioRef.current.currentTime);
        } catch (e) {
          setPlaying(false);
        }
      };
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        }
      };
    }
  }, [music]);
  return (
  <main>
    <audio
      autoPlay={playing}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onLoadedData={() => setDuration(audioRef.current.duration)}
      src={audioURL}
      ref={audioRef}
    />

    {music && (
      <div className="
        fixed bottom-0 left-0 right-0 z-50
        mx-auto max-w-[520px]
        glass fluid-shadow float-soft
        border border-border
        rounded-t-xl md:rounded-xl
        backdrop-blur-xl
        bg-background/70
        overflow-hidden
      ">
        {/* Progress bar */}
        <div className="w-full liquid-shimmer">
          {!duration ? (
            <Skeleton className="h-1 w-full" />
          ) : (
            <Slider
              thumbClassName="hidden"
              trackClassName="h-1 transition-all rounded-none"
              onValueChange={handleSeek}
              value={[currentTime]}
              max={duration}
              className="w-full"
            />
          )}
        </div>

        {/* Player content */}
        <div className="grid gap-2 p-3 pt-2">
          <div className="flex items-center justify-between gap-3">

            {/* Song info */}
            <div className="relative flex items-center gap-3 w-full">
              <img
                src={data.image ? data?.image[1]?.url : ""}
                alt={data?.name}
                className="
                  h-12 w-12 rounded-lg
                  bg-secondary
                  shimmer
                  transition-all
                  hover:scale-105
                "
              />

              {/* Glow background */}
              <img
                src={data.image ? data?.image[1]?.url : ""}
                alt=""
                className="
                  absolute inset-0 -z-10
                  opacity-30 blur-3xl
                  hidden dark:block
                "
              />

              <div className="min-w-0">
                {!data?.name ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <Link
                    href={`/${music}`}
                    className="
                      flex items-center gap-1
                      font-medium text-sm
                      liquid-text
                      hover:opacity-80
                    "
                  >
                    <span className="truncate max-w-[180px]">
                      {data?.name}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </Link>
                )}

                {!data?.artists?.primary[0]?.name ? (
                  <Skeleton className="h-3 w-14 mt-1" />
                ) : (
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {data?.artists?.primary[0]?.name}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                className="glass hover:scale-110 transition"
                variant={!isLooping ? "ghost" : "secondary"}
                onClick={loopSong}
              >
                {!isLooping ? (
                  <Repeat className="h-3.5 w-3.5" />
                ) : (
                  <Repeat1 className="h-3.5 w-3.5" />
                )}
              </Button>

              <Button
                size="icon"
                className="
                  glass liquid-glow
                  hover:scale-125
                  transition-all
                "
                onClick={togglePlayPause}
              >
                {playing ? (
                  <IoPause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="icon"
                className="glass hover:scale-110 transition"
                variant="secondary"
                onClick={() => {
                  setMusic(null);
                  setCurrent(0);
                  localStorage.clear();
                  audioRef.current.currentTime = 0;
                  audioRef.current.src = null;
                  setAudioURL(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </main>
);
