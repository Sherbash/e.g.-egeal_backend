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
  {  path: "/chat",
    route: ChatRoutes,
  },
  {  path: "/promotion",
    route: PromotionRoutes,
  },
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
  }
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
