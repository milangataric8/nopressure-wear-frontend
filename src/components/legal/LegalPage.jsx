const LegalPage = ({ title, children/*, lastUpdated*/ }) => (
    <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-2">{title}</h1>
        {/*{lastUpdated && (*/}
        {/*    <p className="text-xs text-gray-400 mb-8">Last updated: {lastUpdated}</p>*/}
        {/*)}*/}
        <div className="prose prose-sm max-w-3xl text-gray-700 leading-relaxed space-y-4 break-words">
            {children}
        </div>
    </div>
);

export default LegalPage;
