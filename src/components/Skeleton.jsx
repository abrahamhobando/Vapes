import '../styles/Skeleton.css';

const Skeleton = ({ variant = 'rect', width, height, className = '' }) => {
  const classes = `skeleton skeleton-${variant} ${className}`;
  
  return (
    <div 
      className={classes}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
};

export default Skeleton;

export const ProductCardSkeleton = () => (
  <div className="product-card skeleton-wrapper">
    <div className="product-image">
      <Skeleton variant="rect" height="200px" />
    </div>
    <div className="product-info">
      <Skeleton variant="text" width="70%" height="1.5rem" />
      <Skeleton variant="text" width="100%" height="1rem" className="mt-2" />
      <div className="product-price-row mt-3">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rect" width="80px" height="2rem" className="skeleton-button" />
      </div>
    </div>
  </div>
);