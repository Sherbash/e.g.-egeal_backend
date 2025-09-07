import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GiveawayRuleService } from "./giveawayRule.service";
import status from "http-status";

// Create a new rule
const createRule = catchAsync(async (req: Request, res: Response) => {
  const { ruleTitle } = req.body 

  const newRule = await GiveawayRuleService.createRule({
    ruleTitle,
  }) 
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Rule created successfully",
    data: newRule,
  });
});

// Get all rules
const getAllRules = catchAsync(async (req: Request, res: Response) => {
  const rules = await GiveawayRuleService.getAllRules();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rules fetched successfully",
    data: rules,
  });
});

export const GiveawayRuleController = {
  createRule,
  getAllRules,
};
