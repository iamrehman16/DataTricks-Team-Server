import jwt from 'jsonwebtoken';

const authenticateToken = async (req,res,next)=>{
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        res.status(401).json({message:'Access token required'});
    }

    jwt.verify(token,'SECRET',(err,decode)=>{
        if(err){
            res.status(403).json({message:"Invalid or expired token"});
        }
        req.user = decode;
        next();
    })
}

export default authenticateToken;