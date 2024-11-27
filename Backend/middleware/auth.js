const auth = (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken || // कुकी में टोकन चेक करें
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null); // हेडर में टोकन चेक करें
console.log('token :==>',token);
        // अगर रूट `/logout` है, तो बिना टोकन के भी अनुरोध को आगे जाने दें
        if (!token && req.path === "/logout") {
            return next();
        }

        if (!token) {
            return res.status(401).json({
                message: "Access token not found. Please authenticate.",
                error: true,
                success: false,
            });
        }

        next()
        console.log("Token is:", token);

        // यहां टोकन सत्यापन (verification) लॉजिक जोड़ सकते हैं
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message || "An unexpected error occurred.",
            error: true,
            success: false,
        });
    }
};

export default auth
