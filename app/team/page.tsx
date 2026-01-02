import { getTeam } from "@/app/actions/team-actions";
import TeamPageClient from "@/components/TeamPageClient";

export default async function TeamPage() {
    const team = await getTeam();

    return <TeamPageClient initialTeam={team} />;
}
