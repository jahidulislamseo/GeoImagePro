import LocationSearch from "../LocationSearch";

export default function LocationSearchExample() {
  return (
    <LocationSearch
      onSearch={(query) => console.log("Searching for:", query)}
    />
  );
}
