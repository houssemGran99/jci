export const dynamic = 'force-dynamic';
import Dashboard from '@/components/Dashboard';
import { getTeams, getPlayers, getMatches } from '@/lib/api';

// Mock data fetch for Server Component
async function getData() {
  try {
    const [teams, players, matches] = await Promise.all([
      getTeams({ cache: 'no-store' }),
      getPlayers({ cache: 'no-store' }),
      getMatches({ cache: 'no-store' })
    ]);

    return { teams, players, matches };
  } catch (error) {
    console.error("Data fetch error, running with empty data", error);
    return { teams: [], players: [], matches: [] };
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <Dashboard data={data} />
  );
}
