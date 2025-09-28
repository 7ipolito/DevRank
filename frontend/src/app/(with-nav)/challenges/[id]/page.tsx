import ChallengeDetailsView from "@/views/ChallengeDetails/page";

interface ChallengeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChallengeDetailsPage({ params }: ChallengeDetailsPageProps) {
  const { id } = await params;
  return <ChallengeDetailsView challengeId={id} />;
}
