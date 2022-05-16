import React from "react";

export default function TrackSearchResult({ track, chooseTrack }) {
  function handlePlay() {
    chooseTrack(track);
  }
  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <div className="ms-3">
        <div>{track.name}</div>
        <div className="text-muted">{track.artists[0].name}</div>
      </div>
    </div>
  );
}
