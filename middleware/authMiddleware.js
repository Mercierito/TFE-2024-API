const jwt=require('jsonwebtoken');

const authMiddleware={
    auth:function(req,res,next){
        const token=req.header('x-auth-token')
        if(!token)return res.status(401).send('Access denied. No token provided')
        try{
            const decoded=jwt.verify(token,'privateKey')
            req.decodedToken=decoded
            next()
        }catch (error){
            res.status(400).send('Invalid Token')
        }
    },
    role: function (requiredRole) {
        return function (req, res, next) {
            const { decodedToken } = req;
            if (!decodedToken || !decodedToken.isWorker) {
                return res.status(403).send("Forbidden. Insufficient permissions.");
            }

            if (decodedToken.role >= requiredRole) {
                return next();
            }
            
            return res.status(403).send("Forbidden. Insufficient role level.");
        };
    }
}

module.exports=authMiddleware;