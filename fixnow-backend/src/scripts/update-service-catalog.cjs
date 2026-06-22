require("dotenv").config();
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const catalog = [
  {
    id: "050000000000000000000001",
    name: "Điều hòa",
    description:
      "Kiểm tra, vệ sinh, bảo dưỡng và khắc phục các lỗi điều hòa không lạnh, chảy nước, kêu to hoặc hoạt động không ổn định.",
    imageSource: "https://loremflickr.com/1200/800/air-conditioner,technician?lock=101",
  },
  {
    id: "050000000000000000000002",
    name: "Máy giặt",
    description:
      "Kiểm tra và sửa chữa máy giặt không cấp hoặc thoát nước, không vắt, rung lắc, báo lỗi; hỗ trợ vệ sinh lồng giặt khi cần.",
    imageSource: "https://loremflickr.com/1200/800/washing-machine,repair?lock=102",
  },
  {
    id: "050000000000000000000003",
    name: "Tủ lạnh",
    description:
      "Chẩn đoán và xử lý tủ lạnh kém lạnh, đóng tuyết, rò nước, phát tiếng ồn hoặc không hoạt động, kèm tư vấn bảo dưỡng phù hợp.",
    imageSource: "https://loremflickr.com/1200/800/refrigerator,repair?lock=103",
  },
  {
    id: "050000000000000000000004",
    name: "Máy nóng lạnh",
    description:
      "Kiểm tra và sửa máy nước nóng không làm nóng, rò điện, rò nước hoặc hoạt động chập chờn; ưu tiên kiểm tra an toàn điện.",
    imageSource: "https://loremflickr.com/1200/800/water-heater,technician?lock=104",
  },
  {
    id: "050000000000000000000005",
    name: "Vệ sinh nhà",
    description:
      "Làm sạch sàn, phòng khách, phòng ngủ, bếp và khu vực sinh hoạt theo nhu cầu, phù hợp vệ sinh định kỳ hoặc tổng vệ sinh.",
    imageSource: "https://loremflickr.com/1200/800/house-cleaning,cleaner?lock=105",
  },
  {
    id: "050000000000000000000006",
    name: "Vệ sinh văn phòng",
    description:
      "Vệ sinh bàn ghế, sàn, kính và khu vực làm việc, giúp duy trì không gian văn phòng sạch sẽ, gọn gàng và chuyên nghiệp.",
    imageSource: "https://loremflickr.com/1200/800/office-cleaning,cleaner?lock=106",
  },
  {
    id: "050000000000000000000007",
    name: "Vệ sinh sân vườn",
    description:
      "Thu gom lá rụng, làm sạch lối đi, phát quang và dọn dẹp khu vực sân vườn để không gian ngoài trời thông thoáng hơn.",
    imageSource: "https://loremflickr.com/1200/800/gardener,garden-maintenance?lock=107",
  },
  {
    id: "050000000000000000000008",
    name: "Sửa chữa điện",
    description:
      "Kiểm tra và khắc phục mất điện, chập điện, ổ cắm, công tắc, đèn và đường dây dân dụng; báo phương án trước khi sửa chữa.",
    imageSource: "https://loremflickr.com/1200/800/electrician,electrical-repair?lock=108",
  },
  {
    id: "050000000000000000000009",
    name: "Sửa chữa nước",
    description:
      "Xử lý rò rỉ, bể đường ống, vòi nước hư, áp lực nước yếu và các sự cố cấp thoát nước trong gia đình.",
    imageSource: "https://loremflickr.com/1200/800/plumber,pipe-repair?lock=109",
  },
  {
    id: "05000000000000000000000a",
    name: "Thông cống & thông bồn",
    description:
      "Khảo sát và xử lý tắc nghẽn bồn cầu, chậu rửa, đường thoát sàn hoặc đường cống bằng thiết bị phù hợp, hạn chế ảnh hưởng công trình.",
    imageSource: "https://loremflickr.com/1200/800/drain-cleaning,plumber?lock=110",
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const services = mongoose.connection.collection("services");

  for (const item of catalog) {
    console.log(`Đang tải ảnh và cập nhật: ${item.name}`);
    const uploaded = await cloudinary.uploader.upload(item.imageSource, {
      folder: "services/catalog",
      public_id: `service-${item.id}`,
      overwrite: true,
      invalidate: true,
      transformation: [
        { width: 1200, height: 800, crop: "fill", gravity: "auto" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    const result = await services.updateOne(
      { _id: new mongoose.Types.ObjectId(item.id) },
      {
        $set: {
          description: item.description,
          image: [uploaded.secure_url],
        },
      },
    );

    if (result.matchedCount !== 1) {
      throw new Error(`Không tìm thấy dịch vụ ${item.name} (${item.id})`);
    }
  }

  await mongoose.disconnect();
  console.log(`Đã cập nhật ${catalog.length} dịch vụ.`);
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
