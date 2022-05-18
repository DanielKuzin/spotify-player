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
        <div>
          Artist:{" "}
          {album.artists.map((artist) => artist.name).join(", ").length > 50
            ? album.artists
                .map((artist) => artist.name)
                .join(", ")
                .slice(0, 50)
                .concat("...")
            : album.artists.map((artist) => artist.name).join(", ")}
        </div>
      </div>
    </div>
  );
}
