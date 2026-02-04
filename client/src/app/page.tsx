export const dynamic = 'force-dynamic';
import Dashboard from '@/components/Dashboard';
import { getTeams, getPlayers, getMatches, getNews } from '@/lib/api';

// Mock data fetch for Server Component
async function getData() {
  try {
    const [teams, players, matches, news] = await Promise.all([
      getTeams({ cache: 'no-store' }),
      getPlayers({ cache: 'no-store' }),
      getMatches({ cache: 'no-store' }),
      getNews({ cache: 'no-store' })
    ]);

    return { teams, players, matches, news };
  } catch (error) {
    console.error("Data fetch error, running with empty data", error);
    return { teams: [], players: [], matches: [], news: [] };
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <Dashboard data={data} />
  );
}
