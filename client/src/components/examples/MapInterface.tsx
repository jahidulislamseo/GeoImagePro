import MapInterface from "../MapInterface";

export default function MapInterfaceExample() {
  return (
    <MapInterface
      latitude={40.7128}
      longitude={-74.006}
      onLocationChange={(lat, lng) => console.log("Location changed:", lat, lng)}
    />
  );
}
