const AdminPageHeader = ({ title, subtitle, buttonLabel, onButtonClick, showButton = true }) => {
    return (
        <div className="flex items-center justify-between mb-10">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
            {showButton && buttonLabel && (
                <button
                    onClick={onButtonClick}
                    className="bg-black text-white text-sm font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-gray-800 transition-colors"
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
};

export default AdminPageHeader;