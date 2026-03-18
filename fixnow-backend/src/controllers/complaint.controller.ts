import { Request, Response } from "express";
import * as complaintService from "../services/complaint.services";

export const createTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await complaintService.createTicket(req.body);

    return res.status(201).json({
      message: "Ticket created",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      message: "Create ticket failed"
    });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const tickets = await complaintService.getTickets(page, limit, {});

    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: "Get tickets failed"
    });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await complaintService.getTicketById(req.params.id as string);

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(500).json({
      message: "Get ticket failed"
    });
  }
};

export const processTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await complaintService.processTicket(
      req.params.id as string,
      req.body.adminId
    );

    return res.status(200).json({
      message: "Ticket processing",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      message: "Process ticket failed"
    });
  }
};

export const resolveTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await complaintService.resolveTicket(
      req.params.id as string,
      req.body.adminId
    );

    return res.status(200).json({
      message: "Ticket resolved",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      message: "Resolve ticket failed"
    });
  }
};

export const getCustomerTickets = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const tickets = await complaintService.getCustomerTickets(
      req.params.customerId as string,
      page,
      limit
    );

    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: "Get customer tickets failed"
    });
  }
};

export const getProviderTickets = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const tickets = await complaintService.getProviderTickets(
      req.params.providerId as string,
      page,
      limit
    );

    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: "Get provider tickets failed"
    });
  }
};