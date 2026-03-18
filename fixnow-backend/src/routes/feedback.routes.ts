import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

/*FE có thể truyền filter để lấy feedback thông qua query.
 Ví dụ: /provider/123?rating=4.
Đồng thời có thể truyền filter như page, limit để phân trang.
Nếu không truyền filter thì sẽ lấy tất cả*/

router.get('/', feedbackController.getAllFeedbacks);

router.get('/provider/:id', feedbackController.getFeedbackByProviderId); // lấy feedback của riêng 1 thằng provider
router.get('/customer/:id', feedbackController.getFeedbackByCustomerId); // lấy tất cả feedback của 1 thằng customer, những cái nó từng feedback
router.get("/request/:id",feedbackController.getFeedbackByRequestId); //lấy feedback của 1 request cụ thể

router.post('/', feedbackController.createFeedback); // feedback từ phía customer
//cái này nhớ truyền body gồm requestId, providerId, servicesFeedbacks(mảng serviceId, rating, comment)

router.patch("/reply/:id",feedbackController.replyFeedback); // cho phép provider trả lời feedback của customer
//truyền body gồm replyContent, có thể để trống nếu muốn xóa reply

router.get('/search', feedbackController.searchFeedbacks); // cái này là optional cho phép làm tìm feedback nếu có giao diện hợp lí cần thiết

export default router;
