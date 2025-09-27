import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={onClick}
      >
        <ChevronLeft className="h-6 w-6 " />
      </Button>
    </div>
  );
}
