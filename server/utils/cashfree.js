import { Cashfree } from "cashfree-pg";

cashhfree.XClientId = process.env.CASHFREE_APP_ID;
cashhfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

Cashfree.XEnvironment = 
    process.env.CASHFREE_ENV === "PRODUCTION"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.TEST;

export default Cashfree;