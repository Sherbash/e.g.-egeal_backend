import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CourseRoutes } from "../modules/course/course.route";
import { AffiliateRoutes } from "../modules/affiliate/affiliate.route";
import { ChatRoutes } from "../modules/chat/chat.route";
import { ToolRoutes } from "../modules/tool/tool.routes";
import { PromotionRoutes } from "../modules/promotion/promotion.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { GiveawayRoutes } from "../modules/giveaway/giveaway.routes";
import { ParticipantRoutes } from "../modules/participant/participant.routes";
import { reviewRouter } from "../modules/reviews/review.router";
import { FounderRoutes } from "../modules/founder/founder.routes";
import { InfluencerRoutes } from "../modules/influencer/influencer.routes";
import { PayoutRoutes } from "../modules/payout/payout.routes";
import { StoryRoutes } from "../modules/storyPoll/storyPoll.route";
import { GlobalReviewRoutes } from "../modules/global-review/global-review.router";
import { CommentRoutes } from "../modules/global-comment/comment.router";
import { EmailSubscriptionRoutes } from "../modules/subscription/subscription.route";
import { WaitlistRoutes } from "../modules/waitlist/waitlist.route";
import { CouponRoutes } from "../modules/coupon/coupon.route";
import { ReputationRoutes } from "../modules/influencer/Reputation/reputation.route";
const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/tools",
    route: ToolRoutes,
  },
  {
    path: "/affiliates",
    route: AffiliateRoutes,
  },
  { path: "/chat", route: ChatRoutes },
  { path: "/promotion", route: PromotionRoutes },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/giveaway",
    route: GiveawayRoutes,
  },
  {
    path: "/participant",
    route: ParticipantRoutes,
  },

  {
    path: "/reviews",
    route: reviewRouter,
  },
  {
    path: "/review",
    route: GlobalReviewRoutes,
  },
  {
    path: "/founders",
    route: FounderRoutes,
  },
  {
    path: "/influencers",
    route: InfluencerRoutes,
  },
  {
    path: "/payouts",
    route: PayoutRoutes,
  },
  {
    path: "/story",
    route: StoryRoutes,
  },
  {
    path: "/comments",
    route: CommentRoutes,
  },
  {
    path: "/email",
    route: EmailSubscriptionRoutes,
  },
  {
    path: "/waitlist",
    route: WaitlistRoutes,
  },
  {
    path: "/coupon",
    route: CouponRoutes,
  },{
    path: "/reputation",
    route: ReputationRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
