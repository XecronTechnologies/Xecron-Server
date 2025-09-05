export const validateEmailRequest = (req, res, next) => {
  const { from, to, subject, text } = req.body;
  
  if (!from || !to || !subject || !text) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: from, to, subject, text"
    });
  }
  
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(from) || !emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format"
    });
  }
  
  next();
};

export const validateFirebasePath = (req, res, next) => {
  const { path } = req.body;
  
  if (!path) {
    return res.status(400).json({
      success: false,
      error: "Path is required in request body"
    });
  }
  
  if (!Array.isArray(path)) {
    return res.status(400).json({
      success: false,
      error: "Path must be an array"
    });
  }
  
  console.log("Path validation passed:", path);
  next();
};

export const validateDocumentData = (req, res, next) => {
  const { data } = req.body;
  
  if (!data || typeof data !== "object") {
    return res.status(400).json({
      success: false,
      error: "Data must be an object"
    });
  }
  
  console.log("Data validation passed:", data);
  next();
};
export const validateDocumentId = (req, res, next) => {
  const { documentId } = req.body;
  
  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json({
      success: false,
      error: "Document ID is required and must be a string"
    });
  }
  
  next();
};

export const validateContactRequest = (req, res, next) => {
  const { user_email, user_name, subject, message } = req.body;
  
  if (!user_email || !user_name || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "All fields are required: email, name, subject, message"
    });
  }
  
  next();
};

export const validateSupabasePath = (req, res, next) => {
  const { path } = req.body;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ 
      success: false,
      error: "Path must be an array" 
    });
  }
  
  
  if (path.length === 0 || path.length > 2) {
    return res.status(400).json({ 
      success: false,
      error: "Path must have 1 or 2 segments" 
    });
  }
  
  next();
};