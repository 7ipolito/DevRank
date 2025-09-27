import ChallengeDetailsView from "@/views/ChallengeDetails/page";

interface ChallengeDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ChallengeDetailsPage({ params }: ChallengeDetailsPageProps) {
  return <ChallengeDetailsView challengeId={params.id} />;
}
