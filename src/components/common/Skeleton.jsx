const Skeleton = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 ${className}`}></div>
    );
};

export default Skeleton;