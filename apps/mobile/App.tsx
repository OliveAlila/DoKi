import "./global.css";
import "./src/lib/nativewind-setup"; // Register className → style interop for all native components
import { StatusBar } from "expo-status-bar";
import CameraScreen from "./src/screens/CameraScreen";

export default function App() {
	return (
		<>
			<CameraScreen />
			<StatusBar style="light" />
		</>
	);
}
