// utils/idGenerator.js
export const generateId = () => {
  const timestamp = Date.now().toString(); // 13 digits
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6 digits
  
  // Combine to get exactly 19 digits
  return timestamp + random;
};

