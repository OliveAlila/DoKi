"use client";

import {
	Button,
	Card,
	Grid,
	Group,
	Image,
	Stack,
	Text,
	Title,
	Divider,
	useMantineColorScheme,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
	const router = useRouter();

	return (
		<Group justify="space-between" py="lg">
			<Group gap="sm">
				<Image
					src="/shared/logo.png"
					alt="Doki Logo"
					w={50}
					h={50}
				/>

				<Title c="green.6">Doki</Title>
			</Group>

			<Group>
				<Button variant="subtle" onClick={() => router.push("/")}>
					Home
				</Button>

				<Button variant="subtle" onClick={() => router.push("/buyer")}>
					Marketplace
				</Button>

				
				<Button variant="subtle">
					About
				</Button>

				<Button
					color="green"
					onClick={() => {
						window.scrollTo({
							top: document.body.scrollHeight,
							behavior: "smooth",
						});
					}}
				>
					Contact
				</Button>
			</Group>
		</Group>
	);
}

export function HeroSection() {
	const router = useRouter();
	const { user, signOut } = useAuth();

	return (
		<Grid align="center" mt={50}>
			<Grid.Col span={{ base: 12, md: 6 }}>

				<Title size="3.5rem" fw={800}>
					Turning Organic Waste Into Valuable Resources
				</Title>

				<Text mt="lg" size="lg" c="dimmed">
					Doki connects farms, mills and sustainability-focused
					businesses through a transparent marketplace for
					agricultural waste.
				</Text>

				<Group mt="xl">
					{user ? (
						<>
							<Button
								size="md"
								color="green"
								onClick={() => router.push("/buyer")}
							>
								Explore Marketplace
							</Button>

							<Button
								size="md"
								variant="light"
								onClick={() => signOut()}
							>
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Button
								size="md"
								color="green"
								onClick={() => router.push("/sign-up")}
							>
								Get Started
							</Button>

							<Button
								size="md"
								variant="light"
								onClick={() => router.push("/sign-in")}
							>
								Sign In
							</Button>
						</>
					)}
				</Group>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 6 }}>
				<Image
					radius="xl"
					src="https://images.unsplash.com/photo-1464226184884-fa280b87c399"
					alt="Agriculture"
				/>
			</Grid.Col>
		</Grid>
	);
}

export function StatsSection() {
	return (
		<Grid mt={60}>
			<Grid.Col span={{ base: 12, md: 4 }}>
				<Card shadow="md" radius="xl" padding="xl" withBorder>
					<Title>150+</Title>
					<Text c="dimmed">Waste Listings</Text>
				</Card>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 4 }}>
				<Card shadow="md" radius="xl" padding="xl" withBorder>
					<Title>300+</Title>
					<Text c="dimmed">Successful Transactions</Text>
				</Card>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 4 }}>
				<Card shadow="md" radius="xl" padding="xl" withBorder>
					<Title>7+</Title>
					<Text c="dimmed">Regions Covered</Text>
				</Card>
			</Grid.Col>
		</Grid>
	);
}

export function FeaturesSection() {
	const features = [
		{
			title: "Marketplace",
			description:
				"Connect sellers and buyers of agricultural waste efficiently.",
		},
		{
			title: "Traceability",
			description:
				"Track every transaction with full transparency and accountability.",
		},
		{
			title: "AI Classification",
			description:
				"Classify organic waste instantly using intelligent AI tools.",
		},
	];

	return (
		<>
			<Title ta="center" mt={80}>
				Platform Features
			</Title>

			<Grid mt={30}>
				{features.map((feature) => (
					<Grid.Col
						key={feature.title}
						span={{ base: 12, md: 4 }}
					>
						<Card
							shadow="md"
							radius="xl"
							padding="xl"
							withBorder
						>
							<Title order={3}>{feature.title}</Title>

							<Text mt="md" c="dimmed">
								{feature.description}
							</Text>
						</Card>
					</Grid.Col>
				))}
			</Grid>
		</>
	);
}

/*export function HowItWorksSection() {
	return (
		<>
			<Title ta="center" mt={80}>
				How Doki Works
			</Title>

			<Grid mt={30}>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Card radius="xl" shadow="md" padding="xl" withBorder>
						<Title order={2}>1</Title>

						<Text mt="md">
							Sellers upload agricultural waste listings.
						</Text>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Card radius="xl" shadow="md" padding="xl" withBorder>
						<Title order={2}>2</Title>

						<Text mt="md">
							AI identifies and classifies the waste materials.
						</Text>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Card radius="xl" shadow="md" padding="xl" withBorder>
						<Title order={2}>3</Title>

						<Text mt="md">
							Buyers discover, negotiate and purchase resources.
						</Text>
					</Card>
				</Grid.Col>
			</Grid>
		</>
	);
}*/

export function CTASection() {
	const router = useRouter();
	const { colorScheme } = useMantineColorScheme();

	return (
		<Card
			mt={80}
			radius="xl"
			padding={50}
			withBorder
		>
			<Stack align="center">
				<Title ta="center">
					Ready to reduce waste and create value?
				</Title>

				<Text ta="center" c="dimmed">
					Join Doki and become part of the circular economy.
				</Text>

				<Button
					size="lg"
					color="green"
					onClick={() => router.push("/sign-up")}
				>
					Get Started Today
				</Button>
			</Stack>
		</Card>
	);
}

export function Footer() {
	return (
		<>
			<Divider my={50} />

			<Group justify="space-between" py="md">
				<Text size="sm">
					© 2026 Doki. All Rights Reserved.
				</Text>

				<Text size="sm">
					support@doki.com | +254 700 000 000
				</Text>
			</Group>
		</>
	);
}