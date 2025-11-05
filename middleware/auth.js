// middleware/auth.js

// Ensure the user is logged in
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/loginin");
}

// Ensure the logged-in user is the same as the resource owner
// (for example, when editing or deleting their own data)
function isAccountOwner(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/loginin");

  // Allow if the logged-in user matches the user ID in the URL
  if (req.user._id.toString() === req.params.id.toString()) return next();

  return res.status(403).send("Access denied. You can only modify your own account.");
}

module.exports = {
  isAuthenticated,
  isAccountOwner,
};
