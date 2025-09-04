interface UserProps{
    users: { name: string }[]
    meName: string
}

export const UserList = ({ users, meName }: UserProps) => {
    return (
        <div className="bg-neutral-900 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Users</h3>
                <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-lg">Members</span>
            </div>
            <ul className="space-y-1 text-sm">
                {users.map((u, idx) => (
                <li key={idx}>
                    {u.name}
                    {u.name === meName && <span className="text-xs text-neutral-400 ml-1">(you)</span>}
                </li>
                ))}
                {users.length === 0 && (
                <li className="text-neutral-400 text-sm">No users yet. Waiting for friends…</li>
                )}
            </ul>
            </div>
    )
}