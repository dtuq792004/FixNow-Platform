import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";
import Service from "../models/service.model";
import Category from "../models/category.model";
import { Provider } from "../models/provider.model";
import { getTopRatedProviders } from "./feedback.services";

// Khởi tạo Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Lời nhắc hệ thống (System Prompt) định hình tính cách và phạm vi kiến thức của AI.
 * 1. Customer Support: Trả lời quy trình, chính sách.
 * 2. Diagnostic Assistant: Hỗ trợ chẩn đoán lỗi chuyên ngành.
 * 3. Vision: Nhận diện ảnh.
 */
const SYSTEM_INSTRUCTION = `Bạn là trợ lý ảo AI chuyên biệt của nền tảng sửa chữa gia đình FixNow.
Vai trò của bạn:
1. Trả lời FAQ: 
   - Thanh toán QR (PayOS): Khách hàng cần chuyển khoản trực tiếp ngay sau khi vừa đặt dịch vụ xong (thanh toán trước).
   - Thanh toán Tiền mặt: Khách hàng sẽ thanh toán trực tiếp cho thợ sau khi yêu cầu được hoàn thành xong xuôi (thanh toán sau).
2. Chẩn đoán và Tư vấn: Khi khách mô tả lỗi hoặc gửi ảnh, hãy phân tích nguyên nhân và đề xuất Dịch vụ + Thợ phù hợp.
3. Đề xuất Thợ: 
   - Sử dụng 'find_providers' để tìm thợ theo chuyên môn chung.
   - Sử dụng 'find_top_rated_providers' khi khách hàng muốn tìm thợ chất lượng nhất, có đánh giá cao nhất (Top 3). Bạn có thể lọc theo chuyên môn nếu khách yêu cầu.
4. Phong cách: Thân thiện, chuyên nghiệp, tiếng Việt. Trả lời chi tiết nhưng đi thẳng vào vấn đề. Luôn khuyến khích đặt lịch trên app.`;

export const chatWithGemini = async (
  message: string,
  history: Array<{ role: "user" | "model"; parts: { text: string }[] }> = [],
  imageBase64?: string,
  mimeType?: string
) => {
  // Sử dụng gemini-1.5-flash hoặc 2.0-flash (ưu tiên 1.5/2.0 để ổn định)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [
      {
        functionDeclarations: [
          {
            name: "find_services",
            description: "Tìm kiếm các dịch vụ và bảng giá trên hệ thống FixNow dựa trên từ khóa (VD: 'điều hòa', 'tủ lạnh', 'ống nước').",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                keyword: {
                  type: SchemaType.STRING,
                  description: "Từ khóa dịch vụ cần tìm kiếm",
                },
              },
              required: ["keyword"],
            },
          },
          {
            name: "find_providers",
            description: "Tìm kiếm các thợ kĩ thuật (providers) đang hoạt động dựa trên chuyên môn hoặc kinh nghiệm.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                category_name: {
                  type: SchemaType.STRING,
                  description: "Tên loại chuyên môn (VD: 'Điện lạnh', 'Điện nước', 'Thiết bị')",
                },
                min_experience: {
                  type: SchemaType.NUMBER,
                  description: "Số năm kinh nghiệm tối thiểu",
                },
              },
            },
          },
          {
            name: "find_top_rated_providers",
            description: "Tìm kiếm top 3 thợ kỹ thuật có lượt đánh giá và điểm số cao nhất hệ thống.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                category_name: {
                  type: SchemaType.STRING,
                  description: "Tên loại chuyên môn cần lọc (không bắt buộc)",
                },
              },
            },
          },
        ],
      },
    ],
  });

  // Khởi tạo Chat Session với Lịch sử hội thoại
  const chat = model.startChat({
    history: history,
  });

  // Chuẩn bị payload (Text + Image nếu có)
  const parts: Part[] = [];
  if (message) {
    parts.push({ text: message });
  }

  if (imageBase64 && mimeType) {
    // Xoá header `data:image/...;base64,` nếu Client vô tình gửi kèm
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  // 1. Gửi tin nhắn đến mô hình
  const result = await chat.sendMessage(parts);
  const response = result.response;

  // 2. Kiểm tra AI có muốn gọi hàm (Function Calling) hay không
  const functionCalls = response.functionCalls();
  
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    
    // Xử lý hàm find_services
    if (call.name === "find_services") {
      const args = call.args as { keyword: string };
      console.log(`[AI] Đang tìm kiếm dịch vụ với từ khóa: ${args.keyword}`);
      
      try {
        const keywordRegex = new RegExp(args.keyword, "i");
        const foundServices = await Service.find({
          name: keywordRegex,
          status: "APPROVED",
        }).limit(5).select("name price unit description");

        console.log(`[AI] Tìm thấy ${foundServices.length} dịch vụ. Đang chờ Gemini tổng hợp...`);

        const functionResponseResult = await chat.sendMessage([
          {
            functionResponse: {
              name: "find_services",
              response: {
                services: foundServices.length > 0 ? foundServices : "Không tìm thấy dịch vụ phù hợp.",
              },
            },
          },
        ]);
        
        return functionResponseResult.response.text();
      } catch (error) {
        return "Xin lỗi, hiện tại tôi không thể truy cập danh sách dịch vụ.";
      }
    }

    // Xử lý hàm find_providers
    if (call.name === "find_providers") {
      const args = call.args as { category_name?: string; min_experience?: number };
      console.log(`[AI] Đang tìm kiếm thợ: ${JSON.stringify(args)}`);

      try {
        const query: any = {};
        if (args.min_experience) {
          query.experienceYears = { $gte: args.min_experience };
        }
        
        // Tìm providers kết hợp với thông tin User
        const providers = await Provider
          .find(query)
          .populate("userId", "fullName avatar phone")
          .limit(3);

        console.log(`[AI] Tìm thấy ${providers.length} thợ. Đang chờ Gemini tổng hợp...`);

        const functionResponseResult = await chat.sendMessage([
          {
            functionResponse: {
              name: "find_providers",
              response: {
                providers: providers.map((p: any) => ({
                  name: p.userId?.fullName,
                  experience: p.experienceYears,
                  status: p.activeStatus,
                  description: p.description,
                  verified: p.verified
                })),
              },
            },
          },
        ]);

        return functionResponseResult.response.text();
      } catch (error) {
        console.error("AI find_providers error:", error);
        return "Hiện tại tôi không thể tra cứu danh sách thợ kỹ thuật.";
      }
    }

    // Xử lý hàm find_top_rated_providers
    if (call.name === "find_top_rated_providers") {
      const args = call.args as { category_name?: string };
      console.log(`[AI] Đang tìm kiếm thợ chất lượng cao: ${JSON.stringify(args)}`);

      try {
        let categoryId: string | undefined;
        if (args.category_name) {
          const category = await Category.findOne({ name: new RegExp(args.category_name, "i") });
          if (category) {
            categoryId = (category._id as any).toString();
          }
        }

        const topProviders = await getTopRatedProviders(3, categoryId);

        console.log(`[AI] Tìm thấy ${topProviders.length} thợ đánh giá cao. Đang chờ Gemini tổng hợp...`);

        const functionResponseResult = await chat.sendMessage([
          {
            functionResponse: {
              name: "find_top_rated_providers",
              response: {
                providers: topProviders.map((p: any) => ({
                  name: p.userId?.fullName,
                  avgRating: p.avgRating,
                  reviewCount: p.reviewCount,
                  experience: p.experienceYears,
                  description: p.description,
                })),
              },
            },
          },
        ]);

        return functionResponseResult.response.text();
      } catch (error) {
        console.error("AI find_top_rated_providers error:", error);
        return "Hiện tại tôi không thể tra cứu danh sách thợ xuất sắc nhất.";
      }
    }
  }

  // Nếu AI trả lời trực tiếp bằng Text thông thường
  return response.text();
};
