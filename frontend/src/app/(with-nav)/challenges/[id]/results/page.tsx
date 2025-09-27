import ChallengeResultsView from "@/views/ChallengeResults/page";

interface ChallengeResultsPageProps {
  params: {
    id: string;
  };
}

export default function ChallengeResultsPage({ params }: ChallengeResultsPageProps) {
  return <ChallengeResultsView challengeId={params.id} />;
}
