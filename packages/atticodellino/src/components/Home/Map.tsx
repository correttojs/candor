import GoogleMapReact from "google-map-react";
import { useState } from "react";
import { FaMapMarker } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

import { useGlobal } from "../Layout";

const NodeMarker: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <FaMapMarker /> <p>{title}</p>
    </div>
  );
};

export const Map: React.FC<{ title: string }> = ({ title }) => {
  const { latitude, longitude } = useGlobal();
  const [isLoaded, setIsLoaded] = useState(false);

  const [ref, inView] = useInView({ triggerOnce: true });
  const { lat, lng } = {
    lat: parseFloat(latitude ?? ""),
    lng: parseFloat(longitude ?? ""),
  };
  return (
    // Important! Always set the container height explicitly
    <div ref={ref} style={{ height: "100vh", width: "100%" }}>
      {inView && (
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_MAP_KEY ?? "" }}
          defaultCenter={[lat, lng] as any}
          defaultZoom={16}
          onGoogleApiLoaded={({ map, maps }) => setIsLoaded(true)}
        >
          {isLoaded && <NodeMarker {...{ lat, lng }} title={title} />}
        </GoogleMapReact>
      )}
    </div>
  );
};
