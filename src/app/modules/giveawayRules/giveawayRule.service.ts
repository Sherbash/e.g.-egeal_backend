import { RuleModel } from "./giveawayRule.model";

const createRule = async (ruleData: {
  ruleTitle: string;
  imageUrl: string | null;
}) => {
  const newRule = await RuleModel.create({
    ruleTitle: ruleData.ruleTitle,
    imageUrl: null,
  });
  
  return newRule;
};

// GET - Get all rules
 const getAllRules = async () => {
  const rules = await RuleModel.find().sort({ createdAt: -1 });
  return rules;
};

export const GiveawayRuleService = {
  createRule,
  getAllRules,
};