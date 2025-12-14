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
  const [data, setData] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [isLooping, setIsLooping] = useState(false);
  const { music, setMusic, current, setCurrent } = useMusicProvider();

  const getSong = async () => {
    const get = await getSongsById(music);
    const res = await get.json();
    setData(res.data[0]);
    const urls = res.data[0]?.downloadUrl;
    setAudioURL(urls?.[2]?.url || urls?.[1]?.url || urls?.[0]?.url);
  };

  const togglePlayPause = () => {
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const loopSong = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setIsLooping(!isLooping);
  };

  const handleSeek = (e) => {
    audioRef.current.currentTime = e[0];
    setCurrentTime(e[0]);
  };

  useEffect(() => {
    if (!music) return;
    getSong();
    if (current) audioRef.current.currentTime = current;
    setPlaying(true);

    const update = () => {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
      setCurrent(audioRef.current.currentTime);
    };

    audioRef.current.addEventListener("timeupdate", update);
    return () => audioRef.current?.removeEventListener("timeupdate", update);
  }, [music]);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioURL}
        autoPlay={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* FULL SCREEN PLAYER */}
      {music && isFullScreen && (
        <div className="fixed inset-0 z-[100] fluid-bg flex flex-col items-center justify-center p-6">
          <Button
            size="icon"
            className="absolute top-4 right-4 glass"
            onClick={() => setIsFullScreen(false)}
          >
            <X />
          </Button>

          <img
            src={data?.image?.[2]?.url}
            className="w-64 h-64 rounded-2xl glass float-soft"
          />

          <h1 className="mt-6 text-xl font-semibold liquid-text text-center">
            {data?.name}
          </h1>

          <p className="text-sm opacity-70 mb-6">
            {data?.artists?.primary?.[0]?.name}
          </p>

          <Slider
            value={[currentTime]}
            max={duration}
            onValueChange={handleSeek}
            className="w-full max-w-md glass"
          />

          <div className="flex gap-4 mt-6">
            <Button
              size="icon"
              className="glass"
              onClick={loopSong}
            >
              {isLooping ? <Repeat1 /> : <Repeat />}
            </Button>

            <Button
              size="icon"
              className="glass liquid-glow"
              onClick={togglePlayPause}
            >
              {playing ? <IoPause /> : <Play />}
            </Button>

            <Button
              size="icon"
              className="glass"
              onClick={() => {
                setMusic(null);
                setIsFullScreen(false);
              }}
            >
              <X />
            </Button>
          </div>
        </div>
      )}

      {/* MINI PLAYER */}
      {music && !isFullScreen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[520px] glass rounded-t-xl p-3">
          <Slider
            value={[currentTime]}
            max={duration}
            onValueChange={handleSeek}
            className="w-full"
          />

          <div className="flex items-center justify-between mt-2">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsFullScreen(true)}
            >
              <img
                src={data?.image?.[1]?.url}
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <p className="liquid-text text-sm truncate max-w-[160px]">
                  {data?.name}
                </p>
                <p className="text-xs opacity-70">
                  {data?.artists?.primary?.[0]?.name}
                </p>
              </div>
            </div>

            <Button size="icon" onClick={togglePlayPause}>
              {playing ? <IoPause /> : <Play />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
