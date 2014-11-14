/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [(process.env.SALESFETCH_URL || "Salesfetch (no URL)").replace(/https?\:\/\//, '')],
  /**
   * Your New Relic license key.
   */
  agent_enabled: "NEW_RELIC_LICENSE_KEY" in process.env,
};
