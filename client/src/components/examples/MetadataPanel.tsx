import { useState } from "react";
import MetadataPanel from "../MetadataPanel";

export default function MetadataPanelExample() {
  const [lat, setLat] = useState(40.7128);
  const [lng, setLng] = useState(-74.006);
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [documentName, setDocumentName] = useState("");

  return (
    <div className="max-w-md">
      <MetadataPanel
        latitude={lat}
        longitude={lng}
        keywords={keywords}
        description={description}
        documentName={documentName}
        onLatitudeChange={setLat}
        onLongitudeChange={setLng}
        onKeywordsChange={setKeywords}
        onDescriptionChange={setDescription}
        onDocumentNameChange={setDocumentName}
        onWriteExif={() => console.log("Write EXIF clicked")}
        onDownload={() => console.log("Download clicked")}
        onClear={() => {
          setKeywords("");
          setDescription("");
          setDocumentName("");
        }}
      />
    </div>
  );
}
