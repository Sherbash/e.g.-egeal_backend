import { RuleModel } from "./giveawayRule.model";

const createRule = async (ruleData: { ruleTitle: string }) => {
  const newRule = await RuleModel.create({
    ruleTitle: ruleData.ruleTitle,
  });

  return newRule;
};

// GET - Get all rules
const getAllRules = async () => {
  let rules = await RuleModel.find().sort({ createdAt: -1 });

  if (rules.length === 0) {
    const defaultRules = [
      {
        ruleTitle: "Extra 5x entries for following Eagle social media",
      },
    ];
    rules = await RuleModel.insertMany(defaultRules);
  }

  return rules;
};

export const GiveawayRuleService = {
  createRule,
  getAllRules,
};
