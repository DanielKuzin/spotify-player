import React from "react";

export default function PlaylistSearchResult({ playlist, choosePlaylist }) {
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={() => {
        choosePlaylist(playlist.id, playlist.playlistImage, playlist.title);
      }}
    >
      <img
        src={playlist.playlistImage}
        style={{ height: "64px", width: "64px" }}
        alt=""
      />
      <div className="ms-3">
        <div>{playlist.title}</div>
        <div className="text-muted">total tracks: {playlist.totalTracks}</div>
      </div>
    </div>
  );
}
