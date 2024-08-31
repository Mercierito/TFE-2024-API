//401 Unauthorized
//403 forbidden

module.exports=function role(requiredRole){
    return function(req,res,next){
        //console.log('Role role middlewere: ',req.decodedToken.role)
        if(req.decodedToken.isWorker){
            if(req.decodedToken.role>=requiredRole){
                next()
            }else{
                res.status(403).send("Forbidden, you don't have permission to access this")
            }
        }
    }
    
}