import React from "react";

export default function AlbumSearchResult({ album, chooseAlbum }) {
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={() => {
        chooseAlbum(album.id, album.albumImage, album.title);
      }}
    >
      <img
        src={album.albumImage}
        style={{ height: "64px", width: "64px" }}
        alt=""
      />
      <div className="ms-3">
        <div>{album.title}</div>
        <div className="text-muted">total tracks: {album.totalTracks}</div>
        <a href={album.spotifyUri}>Open playlist in Spotify</a>
      </div>
    </div>
  );
}
