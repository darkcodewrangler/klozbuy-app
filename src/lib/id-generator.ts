import { SnowflakeIdGenerator } from "@green-auth/snowflake-unique-id";
import { createId, init } from "@paralleldrive/cuid2";

export const generateUniqueId = () => {
  return init({ length: 36 })();
};
export const generateUrlSafeId = (length = 8) => {
  return init({ length })();
};
