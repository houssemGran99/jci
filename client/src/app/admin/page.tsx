
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getTeams, getPlayers, getMatches } from '@/lib/api';

export default async function AdminPage() {
    const [teams, players, matches] = await Promise.all([
        getTeams({ cache: 'no-store' }),
        getPlayers({ cache: 'no-store' }),
        getMatches({ cache: 'no-store' })
    ]);

    const data = { teams, players, matches };

    return <AdminDashboard data={data} />;
}
