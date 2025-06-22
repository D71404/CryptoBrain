
import { WarpBackground } from "@/components/ui/warp-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export function WarpBackgroundDemo() {
  return (
    <WarpBackground className="bg-gradient-to-br from-orange-100 to-amber-100">
      <Card className="w-80 bg-white/80 backdrop-blur-sm border-orange-200">
        <CardContent className="flex flex-col gap-2 p-4">
          <CardTitle className="text-orange-900">Congratulations on Your Promotion!</CardTitle>
          <CardDescription className="text-orange-700">
            Your hard work and dedication have paid off. We&apos;re thrilled to
            see you take this next step in your career. Keep up the fantastic
            work!
          </CardDescription>
        </CardContent>
      </Card>
    </WarpBackground>
  );
}
