import { Types } from "mongoose";
import AppError from "../../errors/appError";
import status from "http-status";
import { StoryModel } from "./storyPoll.model";
import { IStory } from "./storyPoll.interface";

/**
 * Create a new story
 */
const createStory = async (payload: IStory) => {
  console.log("payload", payload);
  // Validate authorId exists (optional, if not using ref/populate)
  if (!payload.authorId) {
    throw new AppError(status.BAD_REQUEST, "Author ID is required");
  }

  const story = await StoryModel.create(payload);
  return story;
};

/**
 * Get a story by ID
 */
const getStoryById = async (storyId: string) => {
  const story = await StoryModel.findById(storyId).populate(
    "authorId",
    "firstName lastName email"
  );
  if (!story) {
    throw new AppError(status.NOT_FOUND, "Story not found");
  }
  return story;
};

/**
 * Update a story (only by author or admin)
 */
const updateStory = async (
  storyId: string,
  payload: Partial<IStory>,
  userId: string,
  userRole: string
) => {
  const story = await StoryModel.findById(storyId);
  if (!story) {
    throw new AppError(status.NOT_FOUND, "Story not found");
  }

  // Check ownership or admin role
  if (story.authorId.toString() !== userId && userRole !== "admin") {
    throw new AppError(status.FORBIDDEN, "Not authorized to update this story");
  }

  const updatedStory = await StoryModel.findByIdAndUpdate(storyId, payload, {
    new: true,
    runValidators: true,
  });
  if (!updatedStory) {
    throw new AppError(status.NOT_FOUND, "Story not found");
  }

  return updatedStory;
};

/**
 * Delete a story (only by author or admin)
 */
const deleteStory = async (
  storyId: string,
  userId: string,
  userRole: string
) => {
  const story = await StoryModel.findById(storyId);
  if (!story) {
    throw new AppError(status.NOT_FOUND, "Story not found");
  }

  // Check ownership or admin role
  if (story.authorId.toString() !== userId && userRole !== "admin") {
    throw new AppError(status.FORBIDDEN, "Not authorized to delete this story");
  }

  const result = await story.deleteOne();

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Story isn't deleted");
  }
  return null;
};

/**
 * Vote on a poll choice in a story
 */
const voteOnPoll = async (
  storyId: string,
  pollChoiceIndex: number,
  userId: string
) => {
  const story = await StoryModel.findById(storyId);
  if (!story) throw new Error("Story not found");

  if (pollChoiceIndex < 0 || pollChoiceIndex >= story.pollChoices.length) {
    throw new Error("Invalid poll choice index");
  }

  // Remove the user from any previous vote
  story.pollChoices.forEach((choice) => {
    choice.voters = choice.voters.filter(
      (_id) => _id.toString() !== userId.toString()
    );
  });

  // Add the user to the selected choice voters array
  story.pollChoices[pollChoiceIndex].voters.push(
    userId as unknown as Types.ObjectId
  );

  await story.save();

  console.log("story", story)
  // Return with counts
  return story.pollChoices.map((choice) => ({
    text: choice.text,
    votes: choice.voters.length,
  }));
};

export const StoryService = {
  createStory,
  getStoryById,
  updateStory,
  deleteStory,
  voteOnPoll,
};
