import { Router } from "express";
import * as complaintController from "../controllers/complaint.controller";

const router = Router();

/*
Customer
*/

router.post("/tickets", complaintController.createTicket);

router.get("/tickets/customer/:customerId", complaintController.getCustomerTickets);

/*
Provider
*/

router.get("/tickets/provider/:providerId", complaintController.getProviderTickets);

/*
Admin
*/

router.get("/tickets", complaintController.getTickets);

router.get("/tickets/:id", complaintController.getTicketById);

router.patch("/tickets/:id/process", complaintController.processTicket);

router.patch("/tickets/:id/resolve", complaintController.resolveTicket);

export default router;