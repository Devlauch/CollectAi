import { Cashfree, CFEnvironment } from "cashfree-pg";

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

Cashfree.XEnvironment =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

export default Cashfree;