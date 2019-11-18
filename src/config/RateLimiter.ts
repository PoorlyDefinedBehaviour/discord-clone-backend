import RateLimiter from "express-rate-limit";

const rate_limiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});

export default rate_limiter;
