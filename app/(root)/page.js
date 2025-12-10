"use client";

import AlbumCard from "@/components/cards/album";
import ArtistCard from "@/components/cards/artist";
import SongCard from "@/components/cards/song";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getSongsByQuery, searchAlbumByQuery } from "@/lib/fetch";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [albums, setAlbums] = useState([]);

  const getSongs = async (e, type) => {
    const get = await getSongsByQuery(e);
    const data = await get.json();
    if (type === "latest") setLatest(data.data.results);
    if (type === "popular") setPopular(data.data.results);
  };

  const getAlbum = async () => {
    const get = await searchAlbumByQuery("latest");
    const data = await get.json();
    setAlbums(data.data.results);
  };

  useEffect(() => {
    getSongs("latest", "latest");
    getSongs("trending", "popular");
    getAlbum();
  }, []);

  return (
    <main className="px-6 py-6 md:px-20 lg:px-32 space-y-16">

      {/* GREETING */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-semibold bg-gradient-to-br from-white via-white/70 to-white/40 bg-clip-text text-transparent">
          Welcome Pookie !!
        </h1>
      </motion.div>

      {/* SONGS SECTION */}
      <Section title="Songs" subtitle="Top new released songs.">
        <ScrollArea className="rounded-lg glass p-3">
          <div className="flex gap-4">
            {latest.length
              ? latest.map((song) => (
                  <SongCard
                    key={song.id}
                    image={song.image[2].url}
                    title={song.name}
                    artist={song.artists.primary[0].name}
                    id={song.id}
                    song={song}
                  />
                ))
              : Array.from({ length: 10 }).map((_, i) => <SongCard key={i} />)}
          </div>
          <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>
      </Section>

      {/* ALBUMS SECTION */}
      <Section title="Albums" subtitle="Top new released albums.">
        <ScrollArea className="rounded-lg glass p-3">
          <div className="flex gap-4">
            {albums.length
              ? albums.map((song) => (
                  <AlbumCard
                    key={song.id}
                    lang={song.language}
                    image={song.image[2].url}
                    title={song.name}
                    artist={song.artists.primary[0].name}
                    id={song.id}
                  />
                ))
              : Array.from({ length: 10 }).map((_, i) => <SongCard key={i} />)}
          </div>
          <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>
      </Section>

      {/* ARTISTS SECTION */}
      <Section title="Artists" subtitle="Most searched artists.">
        <ScrollArea className="rounded-lg glass p-3">
          <div className="flex gap-4">
            {latest.length
              ? [...new Set(latest.map((a) => a.artists.primary[0].id))].map(
                  (id) => (
                    <ArtistCard
                      key={id}
                      id={id}
                      image={
                        latest.find(
                          (a) => a.artists.primary[0].id === id
                        ).artists.primary[0].image[2]?.url ||
                        `https://az-avatar.vercel.app/api/avatar/?bgColor=0f0f0f&fontSize=60&text=${
                          latest
                            .find((a) => a.artists.primary[0].id === id)
                            .artists.primary[0].name[0]
                            .toUpperCase() || "UN"
                        }`
                      }
                      name={
                        latest.find((a) => a.artists.primary[0].id === id)
                          .artists.primary[0].name
                      }
                    />
                  )
                )
              : Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid gap-2">
                    <Skeleton className="h-[100px] w-[100px] rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
          </div>

          <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>
      </Section>

      {/* TRENDING SECTION */}
      <Section title="Trending" subtitle="Most played songs this week.">
        <ScrollArea className="rounded-lg glass p-3">
          <div className="flex gap-4">
            {popular.length
              ? popular.map((song) => (
                  <SongCard
                    key={song.id}
                    id={song.id}
                    image={song.image[2].url}
                    title={song.name}
                    artist={song.artists.primary[0].name}
                    song={song}
                  />
                ))
              : Array.from({ length: 10 }).map((_, i) => <SongCard key={i} />)}
          </div>

          <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>
      </Section>
    </main>
  );
}

/* SECTION WRAPPER - Reusable */
function Section({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-xs opacity-60">{subtitle}</p>
      </div>

      {children}
    </motion.div>
  );
}
