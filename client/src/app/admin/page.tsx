
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getTeams, getPlayers, getMatches, getNews } from '@/lib/api';

export default async function AdminPage() {
    const [teams, players, matches, news] = await Promise.all([
        getTeams({ cache: 'no-store' }),
        getPlayers({ cache: 'no-store' }),
        getMatches({ cache: 'no-store' }),
        getNews({ cache: 'no-store' })
    ]);

    const data = { teams, players, matches, news };

    return <AdminDashboard data={data} />;
}
