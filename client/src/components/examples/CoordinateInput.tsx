import { useState } from "react";
import CoordinateInput from "../CoordinateInput";

export default function CoordinateInputExample() {
  const [lat, setLat] = useState(40.7128);
  const [lng, setLng] = useState(-74.006);

  return (
    <CoordinateInput
      latitude={lat}
      longitude={lng}
      onLatitudeChange={setLat}
      onLongitudeChange={setLng}
    />
  );
}
