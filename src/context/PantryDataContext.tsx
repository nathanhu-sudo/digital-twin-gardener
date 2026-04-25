import { createContext, useContext, ReactNode } from "react";
import { usePantry } from "@/hooks/usePantry";
import { useGamification } from "@/hooks/useGamification";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { useCommunityImpact } from "@/hooks/useCommunityImpact";
import { useProfile } from "@/hooks/useProfile";

type PantryData = {
  pantry: ReturnType<typeof usePantry>;
  gamification: ReturnType<typeof useGamification>;
  challenges: ReturnType<typeof useWeeklyChallenges>;
  community: ReturnType<typeof useCommunityImpact>;
  profile: ReturnType<typeof useProfile>;
};

const Ctx = createContext<PantryData | null>(null);

export function PantryDataProvider({ children }: { children: ReactNode }) {
  const pantry = usePantry();
  const gamification = useGamification();
  const challenges = useWeeklyChallenges();
  const community = useCommunityImpact();
  const profile = useProfile();
  return (
    <Ctx.Provider value={{ pantry, gamification, challenges, community, profile }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePantryData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePantryData must be used inside PantryDataProvider");
  return v;
}

