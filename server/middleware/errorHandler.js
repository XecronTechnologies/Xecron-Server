export const errorHandler = (error, req, res, next) => {
  console.error("Unhandled error:", error);
  
  res.status(500).json({
    success: false,
    error: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};