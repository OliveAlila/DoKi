"use client";

import { Container } from "@mantine/core";

import {
	Navbar,
	HeroSection,
	StatsSection,
	FeaturesSection,
	CTASection,
	Footer,
} from "@/components/layout/HomePageShell";

export default function HomePage() {
	return (
		<Container size="xl">
			<Navbar />

			<HeroSection />

			<StatsSection />

			<FeaturesSection />

		

			<CTASection />

			<Footer />
		</Container>
	);
}