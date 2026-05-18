const LoadingSpinner = ({ height = 'h-64' }) => {
    return (
        <div className={`flex justify-center items-center ${height}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
        </div>
    );
};

export default LoadingSpinner;