// import { Request, Response } from "express";
// import requestService from "../services/request.service";

// class RequestController {
//   async create(req: Request, res: Response) {
//     try {
//       const data = {
//         ...req.body,
//         customerId: req.user._id, // lấy từ auth middleware
//       };

//       const result = await requestService.createRequest(data);
//       res.status(201).json(result);
//     } catch (err) {
//       res.status(500).json({ message: "Create request failed", err });
//     }
//   }

//   async createUrgent(req: Request, res: Response) {
//     try {
//       const data = {
//         ...req.body,
//         customerId: req.user._id,
//       };

//       const result = await requestService.createUrgentRequest(data);
//       res.status(201).json(result);
//     } catch (err) {
//       res.status(500).json({ message: "Create urgent request failed", err });
//     }
//   }

//   async createRecurring(req: Request, res: Response) {
//     try {
//       const data = {
//         ...req.body,
//         customerId: req.user._id,
//       };

//       const result = await requestService.createRecurringRequest(data);
//       res.status(201).json(result);
//     } catch (err) {
//       res.status(500).json({ message: "Create recurring request failed", err });
//     }
//   }

//   async getMyRequests(req: Request, res: Response) {
//     try {
//       const result = await requestService.getCustomerRequests(req.user._id);
//       res.json(result);
//     } catch (err) {
//       res.status(500).json({ message: "Get requests failed", err });
//     }
//   }
// }

// export default new RequestController();