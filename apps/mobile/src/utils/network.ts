import Constants from "expo-constants";
import { Platform } from "react-native";
import { env } from "@/env";

export const getApiUrl = () => {
	if (env.EXPO_PUBLIC_API_URL) {
		return env.EXPO_PUBLIC_API_URL;
	}

	// Resolve host machine IP in Expo development mode
	const debuggerHost = Constants.expoConfig?.hostUri;
	if (debuggerHost) {
		const localhost = debuggerHost.split(":")[0];
		return `http://${localhost}:3001`;
	}

	// Standard fallbacks for emulators
	if (Platform.OS === "android") {
		return "http://10.0.2.2:3001";
	}

	return "http://localhost:3001";
};
