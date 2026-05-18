const StatusBadge = ({ active }) => {
    return (
        <span className={`text-xs font-semibold uppercase px-2 py-1 ${
            active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
        }`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );
};

export default StatusBadge;