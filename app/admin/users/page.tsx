import { createClient } from '@/lib/supabase/server';
import { UserRoleSelect } from './user-role-select';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Manage Users</h1>
      
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-medium text-gray-500">User</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profiles?.map((profile: any) => (
              <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                          {profile.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{profile.full_name || 'Unnamed'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{profile.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <UserRoleSelect userId={profile.id} initialRole={profile.role} />
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
