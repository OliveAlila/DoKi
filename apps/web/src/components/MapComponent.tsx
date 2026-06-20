"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Green marker for sellers
const sellerIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Blue marker for buyers
const buyerIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export type MapPin = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
	type: "seller" | "buyer";
	details?: string;
};

interface MapComponentProps {
	pins: MapPin[];
}

export default function MapComponent({ pins }: MapComponentProps) {
	return (
		<div
			style={{
				height: "400px",
				width: "100%",
				borderRadius: "12px",
				overflow: "hidden",
			}}
			className="border border-zinc-200 shadow-inner"
		>
			<MapContainer
				center={[-1.15, 36.85]} // Center around Kiambu/Nairobi
				zoom={9.5}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{pins.map((pin) => (
					<Marker
						key={`${pin.type}-${pin.id}`}
						position={[pin.latitude, pin.longitude]}
						icon={pin.type === "seller" ? sellerIcon : buyerIcon}
					>
						<Popup>
							<div className="p-1 font-sans">
								<h4 className="font-bold text-sm text-zinc-900">{pin.name}</h4>
								<p className="text-[11px] text-zinc-500 mb-1">{pin.address}</p>
								<div className="border-t border-zinc-100 pt-1 mt-1">
									<span
										className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mb-1 ${
											pin.type === "seller"
												? "bg-emerald-100 text-emerald-800"
												: "bg-sky-100 text-sky-800"
										}`}
									>
										{pin.type === "seller" ? "Producer" : "Offtaker"}
									</span>
									{pin.details && (
										<p className="text-xs text-zinc-700 font-medium leading-tight">
											{pin.details}
										</p>
									)}
								</div>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}
