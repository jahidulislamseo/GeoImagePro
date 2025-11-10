import UploadZone from "../UploadZone";

export default function UploadZoneExample() {
  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
  };

  return <UploadZone onFilesSelected={handleFilesSelected} />;
}
