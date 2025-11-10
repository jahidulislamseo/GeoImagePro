import SearchHistory from "../SearchHistory";

export default function SearchHistoryExample() {
  const mockHistory = [
    {
      id: "1",
      location: "New York City, USA",
      coordinates: { lat: 40.7128, lng: -74.006 },
      timestamp: new Date(),
    },
    {
      id: "2",
      location: "Paris, France",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      location: "Tokyo, Japan",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      timestamp: new Date(Date.now() - 172800000),
    },
  ];

  return (
    <div className="max-w-md">
      <SearchHistory
        history={mockHistory}
        onSelectLocation={(item) => console.log("Selected:", item.location)}
      />
    </div>
  );
}
