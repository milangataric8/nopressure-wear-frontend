import Pagination from '../common/Pagination';

/**
 * One column/row definition rendered two ways: a real <table> at md and above,
 * a stack of cards below that. Keeps the desktop table markup identical to the
 * hand-written tables it replaces so there is only ever one source of truth.
 *
 * Column shape:
 *   {
 *     key: 'status',
 *     label: t('order.status'),
 *     render: (row) => <StatusBadge ... />,   // JSX — badges/images/prices work in both layouts
 *     primary: true,        // exactly one column; becomes the mobile card title
 *     hideOnMobile: true,   // drop low-value columns from the card
 *     headerClassName, cellClassName    // optional per-column desktop overrides
 *   }
 *
 * `actions(row)` renders trailing action buttons — right-aligned cell on desktop,
 * a wrapped row with tap-sized padding on mobile.
 */
const ResponsiveTable = ({
    columns,
    rows,
    rowKey,
    actions,
    onRowClick,
    emptyMessage,
    page,
    totalPages,
    setPage,
    cellClassName = 'px-4 py-3',
    // Full-width block in the mobile card, below the field list. For controls that can't
    // live in a right-aligned <dd> (e.g. a <select>). Pair with `hideOnMobile` on the
    // matching desktop column so it isn't shown twice.
    mobileExtra,
}) => {
    if (!rows || rows.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-10">{emptyMessage}</p>;
    }

    const primary = columns.find(c => c.primary);
    const mobileRest = columns.filter(c => c !== primary && !c.hideOnMobile);

    return (
        <div className="border border-gray-200">
            {/* Desktop */}
            <div className="hidden md:block">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${cellClassName} ${col.headerClassName || ''}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && <th className={cellClassName} />}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr
                                key={rowKey(row)}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={`border-b border-gray-100 transition-colors ${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                            >
                                {columns.map(col => (
                                    <td key={col.key} className={`${cellClassName} text-xs ${col.cellClassName || ''}`}>
                                        {col.render(row)}
                                    </td>
                                ))}
                                {actions && (
                                    <td className={cellClassName} onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-3 justify-end">{actions(row)}</div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
                {rows.map(row => (
                    <div
                        key={rowKey(row)}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={`px-4 py-4 space-y-2 ${onRowClick ? 'active:bg-gray-50' : ''}`}
                    >
                        {primary && (
                            <div className="text-sm font-semibold text-black break-words">
                                {primary.render(row)}
                            </div>
                        )}
                        {mobileRest.length > 0 && (
                            <dl className="space-y-1">
                                {mobileRest.map(col => (
                                    <div key={col.key} className="flex items-start justify-between gap-3">
                                        <dt className="text-xs text-gray-400 flex-shrink-0">{col.label}</dt>
                                        <dd className="text-xs text-black text-right min-w-0 break-words">{col.render(row)}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {mobileExtra && (
                            <div onClick={e => e.stopPropagation()}>{mobileExtra(row)}</div>
                        )}
                        {actions && (
                            <div
                                className="flex flex-wrap gap-x-6 gap-y-1 pt-1 [&_button]:py-3"
                                onClick={e => e.stopPropagation()}
                            >
                                {actions(row)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {setPage && totalPages > 0 && (
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            )}
        </div>
    );
};

export default ResponsiveTable;
