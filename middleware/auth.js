export const mockAuth = (req, res, next) => {
    const user_id = req.headers["user_id"]
    const role = req.headers["role"]

    if (!user_id || !role) {
        return res.status(401).json({
            error: "Not logged in yet"
        })
    }

    req.user = {
        id: parseInt(user_id),
        role: role
    }

    next()
}

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Only admins can perform this action"
        })
    }
    next()
}

export const requireOwner = (req, res, next) => {
    if (req.user.role !== "owner") {
        return res.status(403).json({
            error: "Only owners can perform this action"
        })
    }
    next()
}